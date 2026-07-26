-- ============================================================
-- Migration 005: candidates
-- Created: 2026-07-26
-- Purpose: Recruiting candidates (email + password auth). Includes
--          TCPA consent fields required before any SMS outreach.
-- Depends on: 003
-- ============================================================

CREATE TABLE IF NOT EXISTS candidates (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID UNIQUE REFERENCES profiles(id) ON DELETE SET NULL,

  first_name  TEXT,
  last_name   TEXT,
  email       TEXT UNIQUE,
  phone       TEXT,                       -- E.164
  state       TEXT,
  timezone    TEXT NOT NULL DEFAULT 'America/Chicago',

  status      TEXT NOT NULL DEFAULT 'applied'
              CHECK (status IN (
                'applied', 'screening', 'interview', 'offer',
                'background', 'licensing', 'onboarding', 'active',
                'rejected', 'withdrawn'
              )),

  source          TEXT,
  resume_url      TEXT,

  -- Background / experience
  has_insurance_license BOOLEAN NOT NULL DEFAULT FALSE,
  license_states  JSONB NOT NULL DEFAULT '[]',
  years_experience INTEGER,
  current_occupation TEXT,
  motivation      TEXT,

  -- Assignment
  recruiter_id        UUID REFERENCES agents(id) ON DELETE SET NULL,
  referred_by_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,

  -- TCPA SMS consent (required before any SMS)
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

  background_check_status TEXT
              CHECK (background_check_status IN ('not_started', 'pending', 'passed', 'failed')),
  offer_extended_at   TIMESTAMPTZ,
  expected_start_date DATE,

  notes       TEXT,
  metadata    JSONB NOT NULL DEFAULT '{}',
  is_deleted  BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER set_updated_at
  BEFORE UPDATE ON candidates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
