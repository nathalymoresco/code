-- Migration: 00001_extensions
-- Description: Enable required PostgreSQL extensions
-- Author: Dara (data-engineer)
-- Date: 2026-03-09
-- Rollback: DROP EXTENSION IF EXISTS vector; DROP EXTENSION IF EXISTS pg_trgm;

-- pgvector for DNA↔destination embedding-based matching
CREATE EXTENSION IF NOT EXISTS "vector";

-- Trigram index for text search (destination names, partner search)
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- UUID generation (Supabase default, but explicit)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

COMMENT ON EXTENSION vector IS 'pgvector: vector similarity search for DNA matching';
COMMENT ON EXTENSION pg_trgm IS 'Trigram text search for destination/partner search';
