-- ============================================================
-- Migration 027: client_auth_tokens
-- Created: 2026-07-26
-- Purpose: Magic-link / email-verification tokens for client portal
--          auth. Written + validated via service role only.
-- Depends on: 004
-- ============================================================

CREATE TABLE IF NOT EXISTS client_auth_tokens (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id   UUID REFERENCES clients(id) ON DELETE CASCADE,

  email       TEXT NOT NULL,
  token       TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  token_type  TEXT NOT NULL DEFAULT 'magic_link'
              CHECK (token_type IN ('magic_link', 'email_verify')),

  expires_at  TIMESTAMPTZ NOT NULL,
  used_at     TIMESTAMPTZ,
  ip_address  TEXT,

  metadata    JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER set_updated_at
  BEFORE UPDATE ON client_auth_tokens
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
