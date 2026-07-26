-- ============================================================
-- Migration 017: calendar_events
-- Created: 2026-07-26
-- Purpose: In-platform calendar (FullCalendar). Appointments,
--          interviews, reminders with SMS/email reminder tracking.
-- Depends on: 003, 004, 005, 007, 011
-- ============================================================

CREATE TABLE IF NOT EXISTS calendar_events (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  agent_id    UUID REFERENCES agents(id) ON DELETE CASCADE,

  title       TEXT NOT NULL,
  description TEXT,
  event_type  TEXT NOT NULL DEFAULT 'appointment'
              CHECK (event_type IN ('appointment', 'call', 'meeting', 'interview', 'reminder', 'other')),

  start_at    TIMESTAMPTZ NOT NULL,
  end_at      TIMESTAMPTZ,
  all_day     BOOLEAN NOT NULL DEFAULT FALSE,
  location    TEXT,

  -- Linked entity (any subset)
  client_id    UUID REFERENCES clients(id) ON DELETE SET NULL,
  contact_id   UUID REFERENCES contacts(id) ON DELETE SET NULL,
  lead_id      UUID REFERENCES leads(id) ON DELETE SET NULL,
  candidate_id UUID REFERENCES candidates(id) ON DELETE SET NULL,

  status      TEXT NOT NULL DEFAULT 'scheduled'
              CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),

  reminder_sent_at     TIMESTAMPTZ,
  sms_reminder_sent_at TIMESTAMPTZ,
  external_calendar_id TEXT,

  metadata    JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER set_updated_at
  BEFORE UPDATE ON calendar_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
