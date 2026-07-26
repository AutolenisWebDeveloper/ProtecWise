-- ============================================================
-- Migration 019: messages
-- Created: 2026-07-26
-- Purpose: Individual messages within a thread. INSERT events are
--          the Realtime payload for live messaging.
-- Depends on: 002, 018
-- ============================================================

CREATE TABLE IF NOT EXISTS messages (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  thread_id   UUID NOT NULL REFERENCES message_threads(id) ON DELETE CASCADE,

  sender_id   UUID REFERENCES profiles(id) ON DELETE SET NULL,   -- null for system
  sender_role TEXT NOT NULL DEFAULT 'agent'
              CHECK (sender_role IN ('agent', 'client', 'admin', 'system')),

  body        TEXT,
  attachments JSONB NOT NULL DEFAULT '[]',   -- [{name, path, size, mime_type}]
  is_system   BOOLEAN NOT NULL DEFAULT FALSE,
  read_at     TIMESTAMPTZ,

  metadata    JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER set_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
