-- ============================================================
-- Migration 004: clients
-- Created: 2026-07-26
-- Purpose: Consumer client accounts (magic-link auth). May be
--          linked to a household (FK added in migration 006).
-- Depends on: 002
-- ============================================================

CREATE TABLE IF NOT EXISTS clients (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID UNIQUE REFERENCES profiles(id) ON DELETE SET NULL,

  -- household_id FK constraint is added in migration 006 (households
  -- does not exist yet at this point in the migration order).
  household_id UUID,

  first_name  TEXT,
  last_name   TEXT,
  full_name   TEXT,
  email       TEXT UNIQUE,
  phone       TEXT,                       -- E.164
  date_of_birth DATE,
  gender      TEXT CHECK (gender IN ('M', 'F')),

  state       TEXT,
  timezone    TEXT NOT NULL DEFAULT 'America/Chicago',

  status      TEXT NOT NULL DEFAULT 'active'
              CHECK (status IN ('active', 'prospect', 'inactive')),

  -- Assigned advisor
  assigned_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,

  -- Communication consent (CAN-SPAM / TCPA)
  email_opt_out       BOOLEAN NOT NULL DEFAULT FALSE,
  email_opt_out_at    TIMESTAMPTZ,
  unsubscribe_token   TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),

  last_login_at TIMESTAMPTZ,
  notes       TEXT,
  metadata    JSONB NOT NULL DEFAULT '{}',
  is_deleted  BOOLEAN NOT NULL DEFAULT FALSE,   -- soft delete (data retention)
  deleted_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER set_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
