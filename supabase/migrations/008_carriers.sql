-- ============================================================
-- Migration 008: carriers
-- Created: 2026-07-26
-- Purpose: Carrier registry. The global active + client-visible
--          flags are the first two filters in buildCOMPINC().
-- Depends on: 001
-- ============================================================

CREATE TABLE IF NOT EXISTS carriers (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  compulife_id TEXT UNIQUE,               -- CompuLife company identifier

  name        TEXT NOT NULL,
  short_name  TEXT,
  logo_url    TEXT,
  naic_code   TEXT,
  am_best_rating TEXT,

  -- buildCOMPINC() filter flags
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,   -- global active
  is_client_visible BOOLEAN NOT NULL DEFAULT TRUE,   -- client visible

  product_families  JSONB NOT NULL DEFAULT '[]',     -- ["level_term","whole_life",...]
  states_available  JSONB NOT NULL DEFAULT '[]',     -- ["TX","FL",...]

  display_order INTEGER NOT NULL DEFAULT 0,
  website     TEXT,
  phone       TEXT,
  notes       TEXT,
  metadata    JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER set_updated_at
  BEFORE UPDATE ON carriers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
