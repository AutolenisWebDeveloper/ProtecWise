-- ============================================================
-- Migration 007: contacts
-- Created: 2026-07-26
-- Purpose: Individual contact records within a household.
--          Backfills households.primary_contact_id FK from 006.
-- Depends on: 006
-- ============================================================

CREATE TABLE IF NOT EXISTS contacts (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,

  first_name  TEXT,
  last_name   TEXT,
  email       TEXT,
  phone       TEXT,                       -- E.164
  date_of_birth DATE,
  gender      TEXT CHECK (gender IN ('M', 'F')),

  relationship TEXT NOT NULL DEFAULT 'self'
              CHECK (relationship IN ('self', 'spouse', 'child', 'parent', 'other')),
  is_primary  BOOLEAN NOT NULL DEFAULT FALSE,

  occupation  TEXT,
  notes       TEXT,
  metadata    JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER set_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Backfill deferred FK: households.primary_contact_id -> contacts.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'households_primary_contact_id_fkey'
  ) THEN
    ALTER TABLE households
      ADD CONSTRAINT households_primary_contact_id_fkey
      FOREIGN KEY (primary_contact_id) REFERENCES contacts(id) ON DELETE SET NULL;
  END IF;
END $$;
