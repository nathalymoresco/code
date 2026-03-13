-- Migration: 00010_functions
-- Description: Database functions — matching RPC, updated_at trigger, cache invalidation
-- Author: Dara (data-engineer)
-- Date: 2026-03-09
-- Dependencies: All previous migrations
-- Rollback: DROP FUNCTION IF EXISTS match_destinations, auto_updated_at, invalidate_rec_cache;

-- ============================================================
-- RPC: match_destinations — pgvector cosine similarity search
-- Called by Edge Function calculate-compatibility
-- ============================================================
CREATE OR REPLACE FUNCTION match_destinations(
  query_vector VECTOR(10),
  match_count INTEGER DEFAULT 20,
  completeness INTEGER DEFAULT 100
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  description TEXT,
  state CHAR(2),
  city TEXT,
  region TEXT,
  cover_url TEXT,
  photo_urls TEXT[],
  tags TEXT[],
  best_months SMALLINT[],
  avg_daily_cost DECIMAL(8,2),
  min_days SMALLINT,
  max_days SMALLINT,
  cosine_similarity DOUBLE PRECISION,
  raw_score INTEGER
)
LANGUAGE plpgsql
STABLE
SECURITY INVOKER  -- H2 FIX: Explicit SECURITY INVOKER — runs with caller's RLS context
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.name,
    d.slug,
    d.description,
    d.state,
    d.city,
    d.region,
    d.cover_url,
    d.photo_urls,
    d.tags,
    d.best_months,
    d.avg_daily_cost,
    d.min_days,
    d.max_days,
    (1 - (d.destination_vector <=> query_vector))::DOUBLE PRECISION AS cosine_similarity,
    -- Raw score: similarity * completeness factor, clamped 0-100
    LEAST(100, GREATEST(0,
      ROUND((1 - (d.destination_vector <=> query_vector)) * 100 * (completeness::REAL / 100))
    ))::INTEGER AS raw_score
  FROM destinations d
  WHERE d.is_active = true
  ORDER BY d.destination_vector <=> query_vector ASC
  LIMIT match_count;
END;
$$;

COMMENT ON FUNCTION match_destinations IS 'pgvector cosine similarity search — returns destinations ordered by DNA compatibility with raw score adjusted for DNA completeness';

-- ============================================================
-- Trigger function: auto-update updated_at timestamp
-- ============================================================
CREATE OR REPLACE FUNCTION auto_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION auto_updated_at IS 'Auto-sets updated_at = NOW() on every UPDATE';

-- Apply to all tables with updated_at
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN
    SELECT unnest(ARRAY[
      'profiles',
      'dna_profiles',
      'destinations',
      'partners',
      'packages',
      'package_payments',
      'destination_weather'
    ])
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS trg_updated_at ON %I;
      CREATE TRIGGER trg_updated_at
        BEFORE UPDATE ON %I
        FOR EACH ROW
        EXECUTE FUNCTION auto_updated_at();
    ', t, t);
  END LOOP;
END;
$$;

-- ============================================================
-- Trigger: invalidate recommendation cache on DNA change
-- ============================================================
CREATE OR REPLACE FUNCTION invalidate_rec_cache()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM recommendation_cache
  WHERE profile_id = NEW.profile_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_invalidate_cache ON dna_profiles;
CREATE TRIGGER trg_invalidate_cache
  AFTER UPDATE OF compatibility_vector ON dna_profiles
  FOR EACH ROW
  EXECUTE FUNCTION invalidate_rec_cache();

COMMENT ON FUNCTION invalidate_rec_cache IS 'Deletes cached recommendations when DNA vector changes — forces fresh matching';

-- ============================================================
-- Trigger: snapshot DNA to history on update
-- ============================================================
CREATE OR REPLACE FUNCTION snapshot_dna_history()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only snapshot if vector actually changed
  IF OLD.compatibility_vector IS DISTINCT FROM NEW.compatibility_vector THEN
    INSERT INTO dna_history (profile_id, dimensions, compatibility_vector, label, source)
    VALUES (
      NEW.profile_id,
      NEW.dimensions,
      NEW.compatibility_vector,
      NEW.label,
      CASE
        WHEN NEW.quiz_phase != OLD.quiz_phase THEN 'quiz'
        ELSE 'post_trip'
      END
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_snapshot_dna ON dna_profiles;
CREATE TRIGGER trg_snapshot_dna
  AFTER UPDATE ON dna_profiles
  FOR EACH ROW
  EXECUTE FUNCTION snapshot_dna_history();

COMMENT ON FUNCTION snapshot_dna_history IS 'Creates DNA history snapshot whenever the compatibility vector changes';

-- ============================================================
-- Function: check destination readiness (min partners)
-- ============================================================
CREATE OR REPLACE FUNCTION check_destination_readiness(dest_id UUID)
RETURNS TABLE (
  is_ready BOOLEAN,
  has_accommodation BOOLEAN,
  has_activity BOOLEAN,
  has_transfer BOOLEAN,
  total_curated INTEGER,
  missing TEXT[]
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_has_acc BOOLEAN;
  v_has_act BOOLEAN;
  v_has_trans BOOLEAN;
  v_total INTEGER;
  v_missing TEXT[] := '{}';
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM partners
    WHERE destination_id = dest_id
      AND type IN ('hotel', 'pousada', 'airbnb')
      AND is_curated = true AND contract_status = 'active'
  ) INTO v_has_acc;

  SELECT EXISTS (
    SELECT 1 FROM partners
    WHERE destination_id = dest_id
      AND type IN ('passeio', 'experiencia', 'guia')
      AND is_curated = true AND contract_status = 'active'
  ) INTO v_has_act;

  SELECT EXISTS (
    SELECT 1 FROM partners
    WHERE destination_id = dest_id
      AND type = 'transfer'
      AND is_curated = true AND contract_status = 'active'
  ) INTO v_has_trans;

  SELECT COUNT(*) INTO v_total
  FROM partners
  WHERE destination_id = dest_id
    AND is_curated = true AND contract_status = 'active';

  IF NOT v_has_acc THEN v_missing := array_append(v_missing, 'hospedagem'); END IF;
  IF NOT v_has_act THEN v_missing := array_append(v_missing, 'passeio/experiência'); END IF;
  IF NOT v_has_trans THEN v_missing := array_append(v_missing, 'transfer'); END IF;

  RETURN QUERY SELECT
    (v_has_acc AND v_has_act AND v_has_trans),
    v_has_acc,
    v_has_act,
    v_has_trans,
    v_total,
    v_missing;
END;
$$;

COMMENT ON FUNCTION check_destination_readiness IS 'Checks if destination has minimum curated partners (1 accommodation + 1 activity + 1 transfer) to be activated';
