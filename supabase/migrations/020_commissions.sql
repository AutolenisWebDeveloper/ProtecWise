-- ============================================================
-- Migration 020: commissions
-- Created: 2026-07-26
-- Purpose: Commission tracking — projected vs actual, chargebacks,
--          statement periods, 1099 export source data.
-- Depends on: 003, 008, 014
-- ============================================================

CREATE TABLE IF NOT EXISTS commissions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  agent_id    UUID REFERENCES agents(id) ON DELETE SET NULL,
  application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
  carrier_id  UUID REFERENCES carriers(id) ON DELETE SET NULL,

  policy_number TEXT,
  product_family TEXT,
  face_amount   NUMERIC(12,2),
  annual_premium NUMERIC(12,2),
  commission_rate NUMERIC(6,4),           -- e.g. 0.9000 = 90%

  commission_type TEXT NOT NULL DEFAULT 'first_year'
              CHECK (commission_type IN ('first_year', 'renewal', 'override', 'bonus')),

  projected_amount NUMERIC(12,2),
  actual_amount    NUMERIC(12,2),

  status      TEXT NOT NULL DEFAULT 'projected'
              CHECK (status IN ('projected', 'pending', 'paid', 'charged_back')),

  payout_date       DATE,
  chargeback_amount NUMERIC(12,2),
  chargeback_at     TIMESTAMPTZ,
  statement_period  TEXT,                 -- e.g. '2026-07'

  notes       TEXT,
  metadata    JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER set_updated_at
  BEFORE UPDATE ON commissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
