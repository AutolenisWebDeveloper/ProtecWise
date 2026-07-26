-- ============================================================
-- Migration 026: email_log
-- Created: 2026-07-26
-- Purpose: Every automated/transactional email is logged here with
--          its Resend message id and delivery/engagement status.
--          Retention: 3 years.
-- Depends on: 003, 004, 005, 011
-- ============================================================

CREATE TABLE IF NOT EXISTS email_log (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  resend_message_id TEXT,
  template    TEXT,                       -- e.g. '01_QuoteCopyEmail'
  to_email    TEXT NOT NULL,
  from_email  TEXT,
  subject     TEXT,

  -- Recipient linkage (any subset)
  lead_id     UUID REFERENCES leads(id) ON DELETE SET NULL,
  client_id   UUID REFERENCES clients(id) ON DELETE SET NULL,
  agent_id    UUID REFERENCES agents(id) ON DELETE SET NULL,
  candidate_id UUID REFERENCES candidates(id) ON DELETE SET NULL,

  status      TEXT NOT NULL DEFAULT 'sent'
              CHECK (status IN (
                'queued', 'sent', 'delivered', 'opened',
                'clicked', 'bounced', 'complained', 'failed'
              )),
  opened_at   TIMESTAMPTZ,
  clicked_at  TIMESTAMPTZ,
  error       TEXT,
  unsubscribe_token TEXT,

  metadata    JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER set_updated_at
  BEFORE UPDATE ON email_log
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
