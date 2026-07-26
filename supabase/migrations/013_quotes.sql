-- ============================================================
-- Migration 013: quotes
-- Created: 2026-07-26
-- Purpose: Quote records with versioning + share tokens. Every
--          quote stores compinc_used (the carrier filter applied)
--          and the CompuLife result set, plus email-lifecycle stamps.
-- Depends on: 003, 004, 011
-- ============================================================

CREATE TABLE IF NOT EXISTS quotes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  lead_id     UUID REFERENCES leads(id) ON DELETE SET NULL,
  agent_id    UUID REFERENCES agents(id) ON DELETE SET NULL,
  client_id   UUID REFERENCES clients(id) ON DELETE SET NULL,

  product_family TEXT NOT NULL
              CHECK (product_family IN (
                'level_term', 'decreasing_term', 'term_to_100',
                'whole_life', 'universal_life'
              )),

  -- Quote inputs (age, gender, state, coverage, term, tobacco, health class)
  input       JSONB NOT NULL DEFAULT '{}',
  -- CompuLife filtered result set (carrier cards)
  results     JSONB NOT NULL DEFAULT '[]',

  -- Carrier permission audit — the COMPINC value used for this quote.
  -- Required on EVERY quote per platform rules.
  compinc_used TEXT NOT NULL DEFAULT '',
  carrier_count INTEGER NOT NULL DEFAULT 0,
  lowest_annual_premium NUMERIC(12,2),
  best_value_carrier    TEXT,

  share_token   TEXT UNIQUE DEFAULT encode(gen_random_bytes(12), 'hex'),
  version       INTEGER NOT NULL DEFAULT 1,
  parent_quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,

  status      TEXT NOT NULL DEFAULT 'active'
              CHECK (status IN ('active', 'expired', 'converted', 'superseded')),

  -- Email + engagement lifecycle (drives cron reminder sequences)
  quote_email_sent_at TIMESTAMPTZ,
  reminder_1_sent_at  TIMESTAMPTZ,
  reminder_2_sent_at  TIMESTAMPTZ,
  reminder_3_sent_at  TIMESTAMPTZ,
  viewed_at           TIMESTAMPTZ,
  apply_clicked_at    TIMESTAMPTZ,
  expires_at          TIMESTAMPTZ,

  metadata    JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE TRIGGER set_updated_at
  BEFORE UPDATE ON quotes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
