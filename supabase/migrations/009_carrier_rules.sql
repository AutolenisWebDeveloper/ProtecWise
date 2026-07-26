-- ============================================================
-- Migration 009: carrier_product_rules + carrier_state_rules
-- Created: 2026-07-26
-- Purpose: Per-carrier product-family and state availability rules.
--          Filters 3 (product family) and 4 (state) in buildCOMPINC().
-- Depends on: 008
-- ============================================================

-- Filter 3 — product family availability per carrier
CREATE TABLE IF NOT EXISTS carrier_product_rules (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  carrier_id  UUID NOT NULL REFERENCES carriers(id) ON DELETE CASCADE,

  product_family TEXT NOT NULL
              CHECK (product_family IN (
                'level_term', 'decreasing_term', 'term_to_100',
                'whole_life', 'universal_life'
              )),
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  min_coverage  NUMERIC(12,2),
  max_coverage  NUMERIC(12,2),
  min_age       INTEGER,
  max_age       INTEGER,
  available_terms JSONB NOT NULL DEFAULT '[]',   -- [10,15,20,30]
  notes       TEXT,
  metadata    JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (carrier_id, product_family)
);

CREATE OR REPLACE TRIGGER set_updated_at
  BEFORE UPDATE ON carrier_product_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Filter 4 — state availability per carrier
CREATE TABLE IF NOT EXISTS carrier_state_rules (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  carrier_id  UUID NOT NULL REFERENCES carriers(id) ON DELETE CASCADE,

  state       TEXT NOT NULL,              -- 2-letter USPS code
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  notes       TEXT,
  metadata    JSONB NOT NULL DEFAULT '{}',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (carrier_id, state)
);

CREATE OR REPLACE TRIGGER set_updated_at
  BEFORE UPDATE ON carrier_state_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
