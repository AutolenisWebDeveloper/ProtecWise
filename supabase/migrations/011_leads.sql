-- ============================================================
-- Migration 011: leads
-- Created: 2026-07-26
-- Purpose: Lead records (from quotes, needs calculator, referrals,
--          imports). Carries all TCPA/DNC consent state.
-- Depends on: 003, 004, 006
-- ============================================================

CREATE TABLE IF NOT EXISTS leads (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  agent_id    UUID REFERENCES agents(id) ON DELETE SET NULL,     -- assigned advisor (nullable)
  household_id UUID REFERENCES households(id) ON DELETE SET NULL,
  client_id   UUID REFERENCES clients(id) ON DELETE SET NULL,

  first_name  TEXT,
  last_name   TEXT,
  full_name   TEXT,
  email       TEXT,
  phone       TEXT,                       -- E.164
  state       TEXT,
  timezone    TEXT NOT NULL DEFAULT 'America/Chicago',

  status      TEXT NOT NULL DEFAULT 'new'
              CHECK (status IN (
                'new', 'contacted', 'quoted', 'application_started',
                'application_submitted', 'won', 'lost', 'nurturing'
              )),

  source      TEXT NOT NULL DEFAULT 'website'
              CHECK (source IN (
                'website', 'referral', 'quote', 'needs_calculator',
                'recruiting', 'import', 'manual', 'campaign'
              )),
  source_detail TEXT,

  product_interest TEXT,
  coverage_amount  NUMERIC(12,2),

  -- TCPA SMS consent (must be captured before any SMS send)
  sms_consent         BOOLEAN NOT NULL DEFAULT FALSE,
  sms_consent_at      TIMESTAMPTZ,
  sms_consent_ip      TEXT,
  sms_consent_language TEXT,
  sms_opt_out         BOOLEAN NOT NULL DEFAULT FALSE,
  sms_opt_out_at      TIMESTAMPTZ,

  -- CAN-SPAM
  email_opt_out       BOOLEAN NOT NULL DEFAULT FALSE,
  email_opt_out_at    TIMESTAMPTZ,
  unsubscribe_token   TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),

  -- Do Not Call (internal list — Phase 1)
  do_not_call         BOOLEAN NOT NULL DEFAULT FALSE,
  do_not_call_reason  TEXT,

  assigned_at         TIMESTAMPTZ,
  last_contacted_at   TIMESTAMPTZ,
  notes       TEXT,
  tags        JSONB NOT NULL DEFAULT '[]',
  metadata    JSONB NOT NULL DEFAULT '{}',
  is_deleted  BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER set_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
