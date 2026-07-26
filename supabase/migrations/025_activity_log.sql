-- ============================================================
-- Migration 025: activity_log
-- Created: 2026-07-26
-- Purpose: Append-only audit trail of all user + system actions.
--          Retention: 5 years. Written via service role only.
-- Depends on: 002
-- ============================================================

CREATE TABLE IF NOT EXISTS activity_log (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  actor_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,   -- null for system
  actor_role  TEXT,

  action      TEXT NOT NULL,             -- 'lead.created', 'quote.run', 'application.submitted', ...
  entity_type TEXT,
  entity_id   UUID,
  description TEXT,

  ip_address  TEXT,
  user_agent  TEXT,
  changes     JSONB NOT NULL DEFAULT '{}',   -- {before, after} where relevant

  metadata    JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER set_updated_at
  BEFORE UPDATE ON activity_log
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
