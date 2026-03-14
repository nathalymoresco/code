-- Migration: 00006_packages
-- Description: Travel packages, items, itinerary, and checklist
-- Author: Dara (data-engineer)
-- Date: 2026-03-09
-- Dependencies: 00002_profiles, 00004_destinations, 00005_partners
-- Rollback: DROP TABLE IF EXISTS package_checklist_items, package_items, packages CASCADE;

-- ============================================================
-- Packages — assembled travel packages
-- ============================================================
CREATE TABLE IF NOT EXISTS packages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  destination_id  UUID NOT NULL REFERENCES destinations(id),
  status          TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'confirmed', 'paid', 'active', 'completed', 'cancelled')),
  total_price     DECIMAL(10,2) NOT NULL DEFAULT 0,
  markup_percentage REAL NOT NULL DEFAULT 15.0,  -- TravelMatch service fee %
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  num_travelers   SMALLINT NOT NULL DEFAULT 1 CHECK (num_travelers >= 1 AND num_travelers <= 20),
  comfort_level   TEXT NOT NULL DEFAULT 'conforto'
    CHECK (comfort_level IN ('economico', 'conforto', 'premium')),
  compatibility_score SMALLINT NOT NULL DEFAULT 0
    CHECK (compatibility_score >= 0 AND compatibility_score <= 100),
  insurance_included BOOLEAN NOT NULL DEFAULT TRUE,
  insurance_provider TEXT,
  insurance_policy_number TEXT,
  notes           TEXT,                  -- User or system notes
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_dates CHECK (end_date > start_date)
);

COMMENT ON TABLE packages IS 'Assembled travel packages — door-to-door with transfers, accommodation, activities, food';
COMMENT ON COLUMN packages.markup_percentage IS 'TravelMatch service fee percentage — visible to user for transparency';
COMMENT ON COLUMN packages.insurance_included IS 'Basic travel insurance included in all packages by default';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_packages_profile ON packages(profile_id);
CREATE INDEX IF NOT EXISTS idx_packages_destination ON packages(destination_id);
CREATE INDEX IF NOT EXISTS idx_packages_status ON packages(status);
CREATE INDEX IF NOT EXISTS idx_packages_dates ON packages(start_date, end_date);

-- ============================================================
-- Package Items — individual components of a package
-- ============================================================
CREATE TABLE IF NOT EXISTS package_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id      UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  partner_id      UUID REFERENCES partners(id),  -- nullable for generic items (seguro)
  type            TEXT NOT NULL CHECK (type IN (
    'transfer', 'hospedagem', 'passeio', 'alimentacao', 'seguro', 'experiencia'
  )),
  title           TEXT NOT NULL,
  description     TEXT,
  date            DATE NOT NULL,
  start_time      TIME,
  end_time        TIME,
  price           DECIMAL(8,2) NOT NULL DEFAULT 0,
  day_number      SMALLINT NOT NULL,
  sort_order      SMALLINT NOT NULL DEFAULT 0,
  is_removable    BOOLEAN NOT NULL DEFAULT TRUE,  -- Can user remove from package?
  maps_url        TEXT,                            -- Google Maps deep link
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE package_items IS 'Individual items in a package — one row per activity/transfer/meal/etc per day';
COMMENT ON COLUMN package_items.is_removable IS 'Items like transfer and seguro may not be removable';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pkg_items_package ON package_items(package_id);
CREATE INDEX IF NOT EXISTS idx_pkg_items_partner ON package_items(partner_id);
CREATE INDEX IF NOT EXISTS idx_pkg_items_day ON package_items(package_id, day_number, sort_order);

-- ============================================================
-- Package Checklist Items — pre-trip checklist (Story 3.9)
-- ============================================================
CREATE TABLE IF NOT EXISTS package_checklist_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id      UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  type            TEXT NOT NULL CHECK (type IN ('obrigatorio', 'recomendado', 'automatico')),
  source          TEXT NOT NULL DEFAULT 'system'
    CHECK (source IN ('system', 'destination', 'user')),
  is_completed    BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at    TIMESTAMPTZ,
  sort_order      SMALLINT NOT NULL DEFAULT 0
);

COMMENT ON TABLE package_checklist_items IS 'Pre-trip checklist — auto-populated from destination_requirements + system defaults';

CREATE INDEX IF NOT EXISTS idx_pkg_checklist_package ON package_checklist_items(package_id);
