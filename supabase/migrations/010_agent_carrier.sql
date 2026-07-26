-- ============================================================
-- Migration 010: agent_carrier_permissions + agent_carrier_preferences
-- Created: 2026-07-26
-- Purpose: Filter 5 in buildCOMPINC() — an agent may only quote a
--          carrier they are appointed with AND admin has approved.
--          Preferences drive per-agent carrier ordering.
-- Depends on: 003, 008
-- ============================================================

-- Filter 5 — admin-approved agent appointments
CREATE TABLE IF NOT EXISTS agent_carrier_permissions (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id    UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  carrier_id  UUID NOT NULL REFERENCES carriers(id) ON DELETE CASCADE,

  status      TEXT NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending', 'approved', 'denied', 'revoked')),
  appointment_number TEXT,
  appointed_states   JSONB NOT NULL DEFAULT '[]',

  requested_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_by   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  approved_at   TIMESTAMPTZ,
  denied_reason TEXT,

  metadata    JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (agent_id, carrier_id)
);

CREATE OR REPLACE TRIGGER set_updated_at
  BEFORE UPDATE ON agent_carrier_permissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Per-agent carrier preferences (ordering / favourites)
CREATE TABLE IF NOT EXISTS agent_carrier_preferences (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id    UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  carrier_id  UUID NOT NULL REFERENCES carriers(id) ON DELETE CASCADE,

  is_preferred  BOOLEAN NOT NULL DEFAULT FALSE,
  display_order INTEGER NOT NULL DEFAULT 0,
  notes       TEXT,
  metadata    JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (agent_id, carrier_id)
);

CREATE OR REPLACE TRIGGER set_updated_at
  BEFORE UPDATE ON agent_carrier_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
