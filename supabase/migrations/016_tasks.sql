-- ============================================================
-- Migration 016: tasks
-- Created: 2026-07-26
-- Purpose: Task management, assignable to agents and linkable to
--          any CRM entity. Supports workflow-automated creation.
-- Depends on: 002, 003, 004, 005, 006, 007, 011, 012, 014
-- ============================================================

CREATE TABLE IF NOT EXISTS tasks (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  agent_id    UUID REFERENCES agents(id) ON DELETE CASCADE,       -- assignee
  created_by  UUID REFERENCES profiles(id) ON DELETE SET NULL,

  title       TEXT NOT NULL,
  description TEXT,
  task_type   TEXT,

  status      TEXT NOT NULL DEFAULT 'open'
              CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  priority    TEXT NOT NULL DEFAULT 'medium'
              CHECK (priority IN ('low', 'medium', 'high', 'urgent')),

  due_at        TIMESTAMPTZ,
  completed_at  TIMESTAMPTZ,

  -- Related entities
  related_lead_id        UUID REFERENCES leads(id) ON DELETE CASCADE,
  related_opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
  related_application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  related_household_id   UUID REFERENCES households(id) ON DELETE CASCADE,
  related_contact_id     UUID REFERENCES contacts(id) ON DELETE CASCADE,
  related_client_id      UUID REFERENCES clients(id) ON DELETE CASCADE,
  related_candidate_id   UUID REFERENCES candidates(id) ON DELETE CASCADE,

  is_automated  BOOLEAN NOT NULL DEFAULT FALSE,

  metadata    JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER set_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
