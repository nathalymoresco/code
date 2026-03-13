-- Migration: 00003_dna
-- Description: DNA profiles, quiz responses, and DNA history tables
-- Author: Dara (data-engineer)
-- Date: 2026-03-09
-- Dependencies: 00002_profiles, pgvector extension
-- Rollback: DROP TABLE IF EXISTS dna_history, quiz_responses, dna_profiles CASCADE;

-- ============================================================
-- DNA Profiles — behavioral travel profile (10-dim vector)
-- ============================================================
CREATE TABLE IF NOT EXISTS dna_profiles (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id      UUID NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  dimensions      JSONB NOT NULL,
    -- Schema: { ritmo: 0-100, natureza: 0-100, urbano: 0-100, praia: 0-100,
    --           cultura: 0-100, gastronomia: 0-100, sociabilidade: 0-100,
    --           fitness: 0-100, aventura: 0-100, relax: 0-100 }
  compatibility_vector  VECTOR(10) NOT NULL,
  label           TEXT NOT NULL DEFAULT 'Viajante',
  label_emoji     TEXT NOT NULL DEFAULT '✈️',
  completeness_percentage INTEGER NOT NULL DEFAULT 40
    CHECK (completeness_percentage >= 0 AND completeness_percentage <= 100),
  quiz_phase      SMALLINT NOT NULL DEFAULT 1
    CHECK (quiz_phase IN (1, 2)),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE dna_profiles IS 'Travel DNA profile — 10-dimension behavioral vector for pgvector matching';
COMMENT ON COLUMN dna_profiles.dimensions IS 'JSON with 10 dimensions scored 0-100: ritmo, natureza, urbano, praia, cultura, gastronomia, sociabilidade, fitness, aventura, relax';
COMMENT ON COLUMN dna_profiles.compatibility_vector IS '10-dim vector for cosine similarity matching via pgvector';
COMMENT ON COLUMN dna_profiles.completeness_percentage IS '40 = Phase 1 only (3 questions), 95+ = Phase 1+2 (10 questions)';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_dna_profiles_profile_id ON dna_profiles(profile_id);

-- HNSW index for fast approximate nearest neighbor search
-- m=16: connections per node (good for small datasets <1M)
-- ef_construction=64: build quality (higher = better recall, slower build)
-- For 20 destinations, even exact search is fast, but HNSW scales to 100K+
CREATE INDEX IF NOT EXISTS idx_dna_vector_hnsw ON dna_profiles
  USING hnsw (compatibility_vector vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- ============================================================
-- Quiz Responses — individual answers for resumability
-- ============================================================
CREATE TABLE IF NOT EXISTS quiz_responses (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question_index  SMALLINT NOT NULL,
  phase           SMALLINT NOT NULL CHECK (phase IN (1, 2)),
  answer          JSONB NOT NULL,
    -- Schema: { option_id: string, dimensions_affected: { dimension: weight } }
  answered_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(profile_id, question_index)
);

COMMENT ON TABLE quiz_responses IS 'Individual quiz answers — enables resume if user exits mid-quiz';
COMMENT ON COLUMN quiz_responses.answer IS 'Selected option with dimension weights for DNA calculation';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_quiz_responses_profile ON quiz_responses(profile_id);

-- ============================================================
-- DNA History — tracks DNA evolution over time (Story 5.1)
-- ============================================================
CREATE TABLE IF NOT EXISTS dna_history (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  dimensions      JSONB NOT NULL,
  compatibility_vector VECTOR(10) NOT NULL,
  label           TEXT NOT NULL,
  source          TEXT NOT NULL CHECK (source IN ('quiz', 'post_trip', 'manual')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE dna_history IS 'DNA evolution history — each quiz completion or post-trip update creates a snapshot';

CREATE INDEX IF NOT EXISTS idx_dna_history_profile ON dna_history(profile_id);
CREATE INDEX IF NOT EXISTS idx_dna_history_created ON dna_history(profile_id, created_at DESC);
