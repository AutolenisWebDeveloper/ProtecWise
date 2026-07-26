-- ============================================================
-- Migration 014: applications
-- Created: 2026-07-26
-- Purpose: 8-step application intake with autosave + resume.
--          Step 5 (health/PHI) and step 6 (banking) are stored
--          ENCRYPTED at rest. Records are never hard-deleted
--          (7-year retention) — use soft delete only.
-- Depends on: 003, 004, 008, 011, 013
-- ============================================================

CREATE TABLE IF NOT EXISTS applications (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  quote_id    UUID REFERENCES quotes(id) ON DELETE SET NULL,
  lead_id     UUID REFERENCES leads(id) ON DELETE SET NULL,
  client_id   UUID REFERENCES clients(id) ON DELETE SET NULL,
  agent_id    UUID REFERENCES agents(id) ON DELETE SET NULL,
  carrier_id  UUID REFERENCES carriers(id) ON DELETE SET NULL,

  product_family  TEXT,
  coverage_amount NUMERIC(12,2),

  current_step INTEGER NOT NULL DEFAULT 1 CHECK (current_step BETWEEN 1 AND 8),
  status      TEXT NOT NULL DEFAULT 'draft'
              CHECK (status IN (
                'draft', 'in_progress', 'submitted',
                'withdrawn', 'declined', 'issued'
              )),

  -- Step payloads (JSONB). Health + financial steps are encrypted.
  step_1_quote_confirmation JSONB NOT NULL DEFAULT '{}',
  step_2_personal_info      JSONB NOT NULL DEFAULT '{}',
  step_3_beneficiaries      JSONB NOT NULL DEFAULT '{}',
  step_4_coverage_context   JSONB NOT NULL DEFAULT '{}',
  step_5_health_encrypted   TEXT,   -- ENCRYPTED PHI (pgcrypto symmetric)
  step_6_financial_encrypted TEXT,  -- ENCRYPTED banking (pgcrypto symmetric)
  step_7_disclosures        JSONB NOT NULL DEFAULT '{}',
  step_8_review             JSONB NOT NULL DEFAULT '{}',

  ssn_last_four_encrypted   TEXT,   -- ENCRYPTED (store last 4 only)

  -- Replacement business (NAIC Model 613 / Reg 60)
  replacement_flag    BOOLEAN NOT NULL DEFAULT FALSE,
  replacement_carrier TEXT,
  replacement_policy  TEXT,

  -- AML flag for high face amounts (manual review, Phase 1)
  aml_review_required BOOLEAN NOT NULL DEFAULT FALSE,
  aml_reviewed_at     TIMESTAMPTZ,

  resume_token      TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  last_autosaved_at TIMESTAMPTZ,
  submitted_at      TIMESTAMPTZ,
  confirmation_sent_at TIMESTAMPTZ,

  metadata    JSONB NOT NULL DEFAULT '{}',
  is_deleted  BOOLEAN NOT NULL DEFAULT FALSE,   -- soft delete only (7yr retention)
  deleted_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER set_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
