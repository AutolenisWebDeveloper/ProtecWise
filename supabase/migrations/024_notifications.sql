-- ============================================================
-- Migration 024: notifications
-- Created: 2026-07-26
-- Purpose: In-app notification records (bell), per user, with
--          per-channel delivery preferences.
-- Depends on: 002
-- ============================================================

CREATE TABLE IF NOT EXISTS notifications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  type        TEXT NOT NULL,              -- new_lead, quote_viewed, app_submitted, carrier_approved, ...
  title       TEXT NOT NULL,
  body        TEXT,
  link        TEXT,

  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  read_at     TIMESTAMPTZ,
  channels    JSONB NOT NULL DEFAULT '["in_app"]',   -- ["in_app","email","sms"]

  related_entity_type TEXT,
  related_entity_id   UUID,

  metadata    JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER set_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
