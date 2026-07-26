-- ============================================================
-- Migration 003: agents
-- Created: 2026-07-26
-- Purpose: Full agent record — licensing, appointments, E&O,
--          commission tier, upline, and recruiter flag.
-- Depends on: 002
-- ============================================================

CREATE TABLE IF NOT EXISTS agents (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  agent_code  TEXT UNIQUE,

  status      TEXT NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending', 'active', 'suspended', 'inactive')),

  first_name  TEXT,
  last_name   TEXT,
  email       TEXT,
  phone       TEXT,                       -- E.164

  -- Licensing / regulatory
  npn                 TEXT,               -- National Producer Number
  resident_state      TEXT,
  license_numbers     JSONB NOT NULL DEFAULT '[]',  -- [{state, number, expires_at, active}]
  appointed_states    JSONB NOT NULL DEFAULT '[]',  -- ["TX","FL",...]

  -- Errors & Omissions
  eo_carrier          TEXT,
  eo_policy_number    TEXT,
  eo_coverage_amount  NUMERIC(12,2),
  eo_expires_at       DATE,

  -- Hierarchy & compensation
  upline_agent_id     UUID REFERENCES agents(id) ON DELETE SET NULL,
  commission_tier     TEXT,
  is_recruiter        BOOLEAN NOT NULL DEFAULT FALSE,

  -- Onboarding / banking (encrypted at rest)
  banking_encrypted   TEXT,               -- ENCRYPTED: pgcrypto symmetric
  w9_on_file          BOOLEAN NOT NULL DEFAULT FALSE,
  tax_id_last_four    TEXT,

  hire_date           DATE,
  bio                 TEXT,
  headshot_url        TEXT,

  metadata    JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER set_updated_at
  BEFORE UPDATE ON agents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
