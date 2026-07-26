-- ============================================================
-- Migration 001: extensions + shared helpers
-- Created: 2026-07-26
-- Purpose: Enable required Postgres extensions and create the
--          shared updated_at trigger function used by every table.
-- Depends on: none
-- ============================================================

-- UUID generation (uuid_generate_v4)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Symmetric encryption for PHI / banking data at rest (pgp_sym_encrypt)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Trigram matching to accelerate CRM full-text / fuzzy search
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ------------------------------------------------------------
-- Shared trigger function: keep updated_at fresh on every UPDATE.
-- Every table in ProtecWise attaches a BEFORE UPDATE trigger to this.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
