-- ============================================================
-- Migration 002: profiles
-- Created: 2026-07-26
-- Purpose: Application-level user profile extending auth.users.
--          Holds the role that drives all RBAC across the platform.
-- Depends on: 001
-- ============================================================

-- Role enum drives middleware RBAC and RLS policies.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('admin', 'agent', 'client', 'candidate', 'recruiter');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS profiles (
  -- id mirrors auth.users.id (1:1)
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role        user_role NOT NULL DEFAULT 'client',
  email       TEXT,
  full_name   TEXT,
  phone       TEXT,
  avatar_url  TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  metadata    JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER set_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
