-- ============================================================
-- Migration 006: households
-- Created: 2026-07-26
-- Purpose: Household / family grouping for CRM. Backfills the
--          clients.household_id foreign key deferred from 004.
-- Depends on: 003, 004
-- ============================================================

CREATE TABLE IF NOT EXISTS households (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_name TEXT,

  primary_agent_id  UUID REFERENCES agents(id) ON DELETE SET NULL,
  -- primary_contact_id FK constraint added in migration 007 (contacts
  -- does not exist yet at this point in the migration order).
  primary_contact_id UUID,

  address     JSONB NOT NULL DEFAULT '{}',   -- {line1, line2, city, state, zip}
  city        TEXT,
  state       TEXT,
  zip         TEXT,
  phone       TEXT,
  email       TEXT,
  annual_income NUMERIC(12,2),

  notes       TEXT,
  tags        JSONB NOT NULL DEFAULT '[]',
  metadata    JSONB NOT NULL DEFAULT '{}',
  is_deleted  BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER set_updated_at
  BEFORE UPDATE ON households
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Backfill deferred FK: clients.household_id -> households.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'clients_household_id_fkey'
  ) THEN
    ALTER TABLE clients
      ADD CONSTRAINT clients_household_id_fkey
      FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE SET NULL;
  END IF;
END $$;
