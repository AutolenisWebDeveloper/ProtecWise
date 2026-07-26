-- ============================================================
-- Migration 018: message_threads
-- Created: 2026-07-26
-- Purpose: Secure messaging threads (agent <-> client), used with
--          Supabase Realtime for live updates.
-- Depends on: 003, 004, 011, 014
-- ============================================================

CREATE TABLE IF NOT EXISTS message_threads (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  subject     TEXT,
  agent_id    UUID REFERENCES agents(id) ON DELETE SET NULL,
  client_id   UUID REFERENCES clients(id) ON DELETE CASCADE,
  lead_id     UUID REFERENCES leads(id) ON DELETE SET NULL,
  application_id UUID REFERENCES applications(id) ON DELETE SET NULL,

  status      TEXT NOT NULL DEFAULT 'open'
              CHECK (status IN ('open', 'closed', 'archived')),

  last_message_at      TIMESTAMPTZ,
  last_message_preview TEXT,
  unread_count_agent   INTEGER NOT NULL DEFAULT 0,
  unread_count_client  INTEGER NOT NULL DEFAULT 0,

  metadata    JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER set_updated_at
  BEFORE UPDATE ON message_threads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
