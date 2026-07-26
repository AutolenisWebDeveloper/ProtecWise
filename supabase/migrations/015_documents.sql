-- ============================================================
-- Migration 015: documents
-- Created: 2026-07-26
-- Purpose: Document storage records (Supabase Storage paths) with
--          category, review status, and request workflow.
-- Depends on: 002, 003, 004, 005, 006, 014
-- ============================================================

CREATE TABLE IF NOT EXISTS documents (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,

  -- Owning entity (any subset may be set)
  client_id      UUID REFERENCES clients(id) ON DELETE CASCADE,
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  agent_id       UUID REFERENCES agents(id) ON DELETE CASCADE,
  candidate_id   UUID REFERENCES candidates(id) ON DELETE CASCADE,
  household_id   UUID REFERENCES households(id) ON DELETE CASCADE,

  category    TEXT NOT NULL DEFAULT 'other'
              CHECK (category IN (
                'identification', 'application', 'medical', 'financial',
                'license', 'eo_certificate', 'appointment', 'resume',
                'w9', 'contract', 'disclosure', 'other'
              )),

  name        TEXT NOT NULL,
  file_path   TEXT,                       -- Supabase Storage object path
  file_size   BIGINT,
  mime_type   TEXT,

  status      TEXT NOT NULL DEFAULT 'uploaded'
              CHECK (status IN ('requested', 'uploaded', 'reviewed', 'approved', 'rejected')),
  requested_at TIMESTAMPTZ,
  reviewed_by  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at  TIMESTAMPTZ,
  rejection_reason TEXT,

  metadata    JSONB NOT NULL DEFAULT '{}',
  is_deleted  BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER set_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
