-- ============================================================
-- Migration 023: workflow_automations
-- Created: 2026-07-26
-- Purpose: Automation rules (trigger -> conditions -> actions)
--          executed by the workflow engine on events + cron.
-- Depends on: 002
-- ============================================================

CREATE TABLE IF NOT EXISTS workflow_automations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  name        TEXT NOT NULL,
  description TEXT,

  trigger_type TEXT NOT NULL
              CHECK (trigger_type IN (
                'lead_created', 'quote_created', 'quote_viewed',
                'application_started', 'application_step_completed',
                'application_submitted', 'opportunity_stage_changed',
                'candidate_stage_changed', 'appointment_scheduled',
                'scheduled', 'manual'
              )),
  trigger_config JSONB NOT NULL DEFAULT '{}',
  conditions  JSONB NOT NULL DEFAULT '[]',   -- [{field, op, value}]
  actions     JSONB NOT NULL DEFAULT '[]',   -- [{type, config}]

  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_by  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  last_run_at TIMESTAMPTZ,
  run_count   INTEGER NOT NULL DEFAULT 0,

  metadata    JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER set_updated_at
  BEFORE UPDATE ON workflow_automations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
