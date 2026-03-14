-- Migration: 00005_partners
-- Description: Local partners (hotels, guides, restaurants, transfers)
-- Author: Dara (data-engineer)
-- Date: 2026-03-09
-- Dependencies: 00004_destinations
-- Rollback: DROP TABLE IF EXISTS partners CASCADE;

CREATE TABLE IF NOT EXISTS partners (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_id  UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  type            TEXT NOT NULL CHECK (type IN (
    'hotel', 'pousada', 'airbnb', 'guia', 'restaurante', 'transfer', 'experiencia'
  )),
  description     TEXT,
  whatsapp        TEXT,
  email           TEXT,
  address         TEXT,
  latitude        DOUBLE PRECISION,
  longitude       DOUBLE PRECISION,
  price_range     TEXT CHECK (price_range IN ('economico', 'moderado', 'premium')),
  daily_rate      DECIMAL(8,2),          -- Base daily rate in BRL
  rating          REAL NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  review_count    INTEGER NOT NULL DEFAULT 0,
  is_curated      BOOLEAN NOT NULL DEFAULT FALSE,
  contract_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (contract_status IN ('pending', 'active', 'inactive', 'suspended')),
  cover_url       TEXT,
  photo_urls      TEXT[] NOT NULL DEFAULT '{}',
  amenities       TEXT[] NOT NULL DEFAULT '{}',  -- wifi, piscina, ar-condicionado, etc.
  cancellation_policy TEXT,
  -- Asaas integration for split payments
  asaas_wallet_id TEXT,
  split_percentage REAL NOT NULL DEFAULT 0
    CHECK (split_percentage >= 0 AND split_percentage <= 100),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE partners IS 'Local curated partners per destination — hotels, guides, restaurants, transfers';
COMMENT ON COLUMN partners.asaas_wallet_id IS 'Asaas wallet ID for split payment — receives percentage after trip escrow release';
COMMENT ON COLUMN partners.split_percentage IS 'Percentage of package item price paid to partner via Asaas split';
COMMENT ON COLUMN partners.review_count IS 'Total reviews — partner with rating < 3.0 after 5+ reviews triggers admin alert';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_partners_destination ON partners(destination_id);
CREATE INDEX IF NOT EXISTS idx_partners_type ON partners(destination_id, type);
CREATE INDEX IF NOT EXISTS idx_partners_curated ON partners(is_curated, contract_status)
  WHERE is_curated = true AND contract_status = 'active';
CREATE INDEX IF NOT EXISTS idx_partners_rating ON partners(rating DESC);
CREATE INDEX IF NOT EXISTS idx_partners_name_trgm ON partners USING gin(name gin_trgm_ops);
