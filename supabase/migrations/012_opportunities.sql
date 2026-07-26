-- ============================================================
-- Migration 012: opportunities
-- Created: 2026-07-26
-- Purpose: CRM opportunity pipeline (Kanban). Tracks value,
--          stage, probability, and close forecasting.
-- Depends on: 003, 004, 006, 007, 011
-- ============================================================

CREATE TABLE IF NOT EXISTS opportunities (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  agent_id    UUID REFERENCES agents(id) ON DELETE SET NULL,
  household_id UUID REFERENCES households(id) ON DELETE SET NULL,
  lead_id     UUID REFERENCES leads(id) ON DELETE SET NULL,
  contact_id  UUID REFERENCES contacts(id) ON DELETE SET NULL,
  client_id   UUID REFERENCES clients(id) ON DELETE SET NULL,

  title       TEXT,
  stage       TEXT NOT NULL DEFAULT 'new'
              CHECK (stage IN (
                'new', 'contacted', 'needs_analysis', 'quoted',
                'application', 'underwriting', 'won', 'lost'
              )),

  product_family      TEXT,
  coverage_amount     NUMERIC(12,2),
  estimated_premium   NUMERIC(12,2),
  estimated_commission NUMERIC(12,2),
  probability         INTEGER NOT NULL DEFAULT 0 CHECK (probability BETWEEN 0 AND 100),

  expected_close_date DATE,
  actual_close_date   DATE,
  lost_reason         TEXT,

  stage_changed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  position            INTEGER NOT NULL DEFAULT 0,   -- Kanban ordering within stage

  notes       TEXT,
  metadata    JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER set_updated_at
  BEFORE UPDATE ON opportunities
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
