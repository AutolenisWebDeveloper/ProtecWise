-- ============================================================
-- Migration 021: compliance_records
-- Created: 2026-07-26
-- Purpose: Agent licensing, E&O, appointments, CE credits, and
--          audit tracking with expiry alerting.
-- Depends on: 003, 015
-- ============================================================

CREATE TABLE IF NOT EXISTS compliance_records (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id    UUID REFERENCES agents(id) ON DELETE CASCADE,

  record_type TEXT NOT NULL DEFAULT 'license'
              CHECK (record_type IN (
                'license', 'eo', 'appointment', 'training',
                'ce_credit', 'audit', 'other'
              )),

  title       TEXT,
  status      TEXT NOT NULL DEFAULT 'active'
              CHECK (status IN ('active', 'expiring', 'expired', 'completed', 'pending', 'failed')),

  state           TEXT,
  reference_number TEXT,
  issued_at       DATE,
  expires_at      DATE,
  alert_sent_at   TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,

  document_id UUID REFERENCES documents(id) ON DELETE SET NULL,

  notes       TEXT,
  metadata    JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER set_updated_at
  BEFORE UPDATE ON compliance_records
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
