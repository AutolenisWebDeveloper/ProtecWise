-- ============================================================
-- Migration 022: recruiting_pipeline
-- Created: 2026-07-26
-- Purpose: Recruiting CRM pipeline (Kanban) — one record per
--          candidate, tracking stage, recruiter, and activity.
-- Depends on: 003, 005
-- ============================================================

CREATE TABLE IF NOT EXISTS recruiting_pipeline (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  recruiter_id UUID REFERENCES agents(id) ON DELETE SET NULL,

  stage       TEXT NOT NULL DEFAULT 'applied'
              CHECK (stage IN (
                'applied', 'screening', 'interview', 'offer',
                'background', 'licensing', 'onboarding', 'active',
                'rejected', 'withdrawn'
              )),
  stage_entered_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  position           INTEGER NOT NULL DEFAULT 0,   -- Kanban ordering within stage

  expected_start_date DATE,
  source            TEXT,
  rejection_reason  TEXT,

  notes       TEXT,
  activity    JSONB NOT NULL DEFAULT '[]',
  metadata    JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (candidate_id)
);

CREATE OR REPLACE TRIGGER set_updated_at
  BEFORE UPDATE ON recruiting_pipeline
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
