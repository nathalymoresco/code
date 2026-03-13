-- Migration: 00004_destinations
-- Description: Destinations catalog with pgvector and weather data
-- Author: Dara (data-engineer)
-- Date: 2026-03-09
-- Dependencies: pgvector extension
-- Rollback: DROP TABLE IF EXISTS destination_requirements, destination_weather, destination_scores, destinations CASCADE;

-- ============================================================
-- Destinations — curated travel destinations (10-20 MVP)
-- ============================================================
CREATE TABLE IF NOT EXISTS destinations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  description     TEXT,
  state           CHAR(2) NOT NULL,      -- UF: SP, RJ, GO, CE, etc.
  city            TEXT NOT NULL,
  region          TEXT NOT NULL CHECK (region IN ('norte', 'nordeste', 'centro-oeste', 'sudeste', 'sul')),
  latitude        DOUBLE PRECISION NOT NULL,
  longitude       DOUBLE PRECISION NOT NULL,
  climate_type    TEXT,                   -- tropical, subtropical, semiárido, etc.
  best_months     SMALLINT[] NOT NULL DEFAULT '{}',
  tags            TEXT[] NOT NULL DEFAULT '{}',
  destination_vector VECTOR(10) NOT NULL, -- 10-dim vector matching DNA dimensions
  cover_url       TEXT,                   -- Primary cover image
  photo_urls      TEXT[] NOT NULL DEFAULT '{}',
  min_days        SMALLINT NOT NULL DEFAULT 3,
  max_days        SMALLINT NOT NULL DEFAULT 7,
  avg_daily_cost  DECIMAL(8,2),           -- Average cost per person/day (BRL)
  is_active       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE destinations IS 'Curated travel destinations — 10-20 in MVP, each with 10-dim vector for DNA matching';
COMMENT ON COLUMN destinations.destination_vector IS '10-dim vector: [ritmo, natureza, urbano, praia, cultura, gastronomia, sociabilidade, fitness, aventura, relax]';
COMMENT ON COLUMN destinations.state IS 'Brazilian state UF code (2 chars): SP, RJ, GO, CE, etc.';
COMMENT ON COLUMN destinations.avg_daily_cost IS 'Average cost per person per day in BRL — used for budget matching';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_destinations_slug ON destinations(slug);
CREATE INDEX IF NOT EXISTS idx_destinations_region ON destinations(region);
CREATE INDEX IF NOT EXISTS idx_destinations_active ON destinations(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_destinations_tags ON destinations USING gin(tags);

-- HNSW for destination vector matching
CREATE INDEX IF NOT EXISTS idx_destination_vector_hnsw ON destinations
  USING hnsw (destination_vector vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- Trigram index for text search on name
CREATE INDEX IF NOT EXISTS idx_destinations_name_trgm ON destinations
  USING gin(name gin_trgm_ops);

-- ============================================================
-- Destination Scores — per-dimension scores (source of truth for vector)
-- ============================================================
CREATE TABLE IF NOT EXISTS destination_scores (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  destination_id  UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  dimension       TEXT NOT NULL CHECK (dimension IN (
    'ritmo', 'natureza', 'urbano', 'praia', 'cultura',
    'gastronomia', 'sociabilidade', 'fitness', 'aventura', 'relax'
  )),
  score           SMALLINT NOT NULL CHECK (score >= 0 AND score <= 100),
  UNIQUE(destination_id, dimension)
);

COMMENT ON TABLE destination_scores IS 'Per-dimension scores for destinations — admin sets these, trigger rebuilds the vector';

-- ============================================================
-- Destination Weather — monthly climate data cache
-- ============================================================
CREATE TABLE IF NOT EXISTS destination_weather (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  destination_id  UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  month           SMALLINT NOT NULL CHECK (month >= 1 AND month <= 12),
  avg_temp_c      REAL,
  avg_rain_mm     REAL,
  avg_humidity    REAL,
  condition       TEXT,  -- ensolarado, chuvoso, nublado, etc.
  is_high_season  BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(destination_id, month)
);

COMMENT ON TABLE destination_weather IS 'Monthly climate data per destination — cached from OpenWeather + manually curated';

-- ============================================================
-- Destination Requirements — documents, vaccines, fees
-- ============================================================
CREATE TABLE IF NOT EXISTS destination_requirements (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  destination_id  UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  type            TEXT NOT NULL CHECK (type IN ('documento', 'vacina', 'taxa', 'equipamento', 'recomendacao')),
  title           TEXT NOT NULL,
  description     TEXT,
  is_mandatory    BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order      SMALLINT NOT NULL DEFAULT 0
);

COMMENT ON TABLE destination_requirements IS 'Pre-trip requirements per destination — documents, vaccines, fees, gear';

CREATE INDEX IF NOT EXISTS idx_dest_requirements_dest ON destination_requirements(destination_id);

-- ============================================================
-- Trigger: rebuild destination_vector from scores
-- ============================================================
CREATE OR REPLACE FUNCTION rebuild_destination_vector()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_ritmo SMALLINT := 50;
  v_natureza SMALLINT := 50;
  v_urbano SMALLINT := 50;
  v_praia SMALLINT := 50;
  v_cultura SMALLINT := 50;
  v_gastronomia SMALLINT := 50;
  v_sociabilidade SMALLINT := 50;
  v_fitness SMALLINT := 50;
  v_aventura SMALLINT := 50;
  v_relax SMALLINT := 50;
  v_dest_id UUID;
BEGIN
  v_dest_id := COALESCE(NEW.destination_id, OLD.destination_id);

  SELECT
    COALESCE(MAX(CASE WHEN dimension = 'ritmo' THEN score END), 50),
    COALESCE(MAX(CASE WHEN dimension = 'natureza' THEN score END), 50),
    COALESCE(MAX(CASE WHEN dimension = 'urbano' THEN score END), 50),
    COALESCE(MAX(CASE WHEN dimension = 'praia' THEN score END), 50),
    COALESCE(MAX(CASE WHEN dimension = 'cultura' THEN score END), 50),
    COALESCE(MAX(CASE WHEN dimension = 'gastronomia' THEN score END), 50),
    COALESCE(MAX(CASE WHEN dimension = 'sociabilidade' THEN score END), 50),
    COALESCE(MAX(CASE WHEN dimension = 'fitness' THEN score END), 50),
    COALESCE(MAX(CASE WHEN dimension = 'aventura' THEN score END), 50),
    COALESCE(MAX(CASE WHEN dimension = 'relax' THEN score END), 50)
  INTO v_ritmo, v_natureza, v_urbano, v_praia, v_cultura,
       v_gastronomia, v_sociabilidade, v_fitness, v_aventura, v_relax
  FROM destination_scores
  WHERE destination_id = v_dest_id;

  UPDATE destinations
  SET
    destination_vector = ARRAY[v_ritmo, v_natureza, v_urbano, v_praia, v_cultura,
                               v_gastronomia, v_sociabilidade, v_fitness, v_aventura, v_relax]::vector(10),
    updated_at = NOW()
  WHERE id = v_dest_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_rebuild_dest_vector ON destination_scores;
CREATE TRIGGER trg_rebuild_dest_vector
  AFTER INSERT OR UPDATE OR DELETE ON destination_scores
  FOR EACH ROW
  EXECUTE FUNCTION rebuild_destination_vector();

COMMENT ON FUNCTION rebuild_destination_vector IS 'Auto-rebuilds destination_vector from dimension scores when scores change';
