-- Migration: 00007_payments
-- Description: Asaas payment integration with split/escrow tracking
-- Author: Dara (data-engineer)
-- Date: 2026-03-09
-- Dependencies: 00006_packages
-- Rollback: DROP TABLE IF EXISTS payment_split_items, package_payments CASCADE;

-- ============================================================
-- Package Payments — Asaas payment records
-- ============================================================
CREATE TABLE IF NOT EXISTS package_payments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  package_id      UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  -- Asaas identifiers
  asaas_payment_id    TEXT UNIQUE,       -- Asaas payment ID (pay_...)
  asaas_customer_id   TEXT,              -- Asaas customer ID (cus_...)
  asaas_invoice_url   TEXT,              -- Invoice/boleto URL
  -- Payment details
  method          TEXT NOT NULL CHECK (method IN ('pix', 'credit_card', 'boleto')),
  installments    SMALLINT NOT NULL DEFAULT 1 CHECK (installments >= 1 AND installments <= 12),
  status          TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'overdue', 'refunded', 'cancelled', 'chargeback')),
  amount          DECIMAL(10,2) NOT NULL,
  net_amount      DECIMAL(10,2),         -- After Asaas fees
  -- Pix specific
  pix_qr_code     TEXT,
  pix_copy_paste  TEXT,
  pix_expiration  TIMESTAMPTZ,
  -- Escrow / split
  escrow_status   TEXT NOT NULL DEFAULT 'held'
    CHECK (escrow_status IN ('held', 'released', 'refunded', 'partial_release')),
  escrow_release_date DATE,              -- Scheduled release: end_date + 3 days
  escrow_released_at  TIMESTAMPTZ,       -- Actual release timestamp
  -- Audit
  webhook_events  JSONB NOT NULL DEFAULT '[]',  -- Append-only log of Asaas webhook events
  refund_reason   TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE package_payments IS 'Asaas payment records — supports Pix, cartão (12x), boleto with escrow/split';
COMMENT ON COLUMN package_payments.escrow_status IS 'Payment held until trip completion, then released to partners via split';
COMMENT ON COLUMN package_payments.webhook_events IS 'Append-only log: [{event, timestamp, data}] from Asaas webhooks';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payments_package ON package_payments(package_id);
CREATE INDEX IF NOT EXISTS idx_payments_asaas_id ON package_payments(asaas_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON package_payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_escrow ON package_payments(escrow_status, escrow_release_date)
  WHERE escrow_status = 'held';

-- ============================================================
-- Payment Split Items — tracks per-partner split payments
-- ============================================================
CREATE TABLE IF NOT EXISTS payment_split_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  payment_id      UUID NOT NULL REFERENCES package_payments(id) ON DELETE CASCADE,
  partner_id      UUID NOT NULL REFERENCES partners(id),
  asaas_transfer_id TEXT,                -- Asaas transfer ID
  amount          DECIMAL(8,2) NOT NULL,
  percentage      REAL NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'scheduled', 'released', 'failed')),
  scheduled_date  DATE,
  released_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE payment_split_items IS 'Per-partner split of payment — released after trip via Asaas transfer';

CREATE INDEX IF NOT EXISTS idx_split_items_payment ON payment_split_items(payment_id);
CREATE INDEX IF NOT EXISTS idx_split_items_partner ON payment_split_items(partner_id);
CREATE INDEX IF NOT EXISTS idx_split_items_pending ON payment_split_items(status, scheduled_date)
  WHERE status IN ('pending', 'scheduled');
