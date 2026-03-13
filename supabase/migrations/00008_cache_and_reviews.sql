-- Migration: 00008_cache_and_reviews
-- Description: Recommendation cache and post-trip reviews
-- Author: Dara (data-engineer)
-- Date: 2026-03-09
-- Dependencies: 00002_profiles, 00005_partners, 00006_packages
-- Rollback: DROP TABLE IF EXISTS reviews, recommendation_cache CASCADE;

-- ============================================================
-- Recommendation Cache — cached matching results (TTL 24h)
-- ============================================================
CREATE TABLE IF NOT EXISTS recommendation_cache (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id      UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  recommendations JSONB NOT NULL,
    -- Schema: [{ destination_id, score, match_reasons: string[] }]
  dna_vector_hash TEXT NOT NULL,   -- Hash of DNA vector to detect changes
  expires_at      TIMESTAMPTZ NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE recommendation_cache IS 'Cached matching results per user — invalidated on DNA change or TTL expiry (24h)';
COMMENT ON COLUMN recommendation_cache.dna_vector_hash IS 'MD5 of compatibility_vector — cache miss if DNA changed';

CREATE INDEX IF NOT EXISTS idx_rec_cache_profile ON recommendation_cache(profile_id);
CREATE INDEX IF NOT EXISTS idx_rec_cache_expires ON recommendation_cache(expires_at);

-- ============================================================
-- Reviews — post-trip per-item reviews (Story 4.5)
-- ============================================================
CREATE TABLE IF NOT EXISTS reviews (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  package_id      UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  partner_id      UUID REFERENCES partners(id),   -- NULL for overall package review
  package_item_id UUID REFERENCES package_items(id),
  rating          SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment         TEXT,
  nps_score       SMALLINT CHECK (nps_score >= 0 AND nps_score <= 10),  -- Only on overall review
  is_overall      BOOLEAN NOT NULL DEFAULT FALSE,  -- True for package-level review
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(profile_id, package_id, package_item_id)
);

COMMENT ON TABLE reviews IS 'Post-trip reviews — per-item (partner) + overall (NPS). Feeds DNA progressive update and partner curation.';
COMMENT ON COLUMN reviews.nps_score IS 'NPS 0-10 — only on overall review (is_overall = true)';

CREATE INDEX IF NOT EXISTS idx_reviews_profile ON reviews(profile_id);
CREATE INDEX IF NOT EXISTS idx_reviews_package ON reviews(package_id);
CREATE INDEX IF NOT EXISTS idx_reviews_partner ON reviews(partner_id);

-- ============================================================
-- Trigger: update partner rating on new review
-- ============================================================
CREATE OR REPLACE FUNCTION update_partner_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.partner_id IS NOT NULL THEN
    UPDATE partners
    SET
      rating = (
        SELECT ROUND(AVG(rating)::numeric, 1)
        FROM reviews
        WHERE partner_id = NEW.partner_id
      ),
      review_count = (
        SELECT COUNT(*)
        FROM reviews
        WHERE partner_id = NEW.partner_id
      ),
      updated_at = NOW()
    WHERE id = NEW.partner_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_partner_rating ON reviews;
CREATE TRIGGER trg_update_partner_rating
  AFTER INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_partner_rating();

COMMENT ON FUNCTION update_partner_rating IS 'Recalculates partner avg rating and review_count after each new review';
