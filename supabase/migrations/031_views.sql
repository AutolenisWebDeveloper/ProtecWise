-- ============================================================
-- Migration 031: views
-- Created: 2026-07-26
-- Purpose: Reporting / aggregate views. All use security_invoker so
--          RLS of the underlying tables applies to the querying role
--          (service role bypasses RLS for global usage counts).
-- Depends on: 011, 012, 013, 014, 022
-- ============================================================

-- CompuLife monthly quote volume (drives soft/hard limit enforcement)
CREATE OR REPLACE VIEW monthly_quote_count
  WITH (security_invoker = true) AS
  SELECT
    date_trunc('month', created_at)::date AS month,
    count(*)                              AS quote_count
  FROM quotes
  GROUP BY 1
  ORDER BY 1 DESC;

-- Current calendar-month usage (compare to COMPULIFE_MONTHLY_*_LIMIT envs)
CREATE OR REPLACE VIEW current_month_quote_usage
  WITH (security_invoker = true) AS
  SELECT
    date_trunc('month', now())::date AS month,
    count(*)                         AS quote_count
  FROM quotes
  WHERE created_at >= date_trunc('month', now());

-- Per-agent production summary
CREATE OR REPLACE VIEW agent_production_summary
  WITH (security_invoker = true) AS
  SELECT
    a.id                                                            AS agent_id,
    a.agent_code,
    count(DISTINCT l.id)                                            AS lead_count,
    count(DISTINCT q.id)                                            AS quote_count,
    count(DISTINCT ap.id)                                           AS application_count,
    count(DISTINCT ap.id) FILTER (WHERE ap.status = 'submitted')    AS submitted_applications
  FROM agents a
  LEFT JOIN leads l        ON l.agent_id  = a.id
  LEFT JOIN quotes q       ON q.agent_id  = a.id
  LEFT JOIN applications ap ON ap.agent_id = a.id
  GROUP BY a.id, a.agent_code;

-- Lead funnel counts by status
CREATE OR REPLACE VIEW lead_funnel_summary
  WITH (security_invoker = true) AS
  SELECT status, count(*) AS lead_count
  FROM leads
  WHERE is_deleted = FALSE
  GROUP BY status;

-- Opportunity pipeline value by agent + stage
CREATE OR REPLACE VIEW opportunity_pipeline_summary
  WITH (security_invoker = true) AS
  SELECT
    agent_id,
    stage,
    count(*)                                 AS opportunity_count,
    coalesce(sum(coverage_amount), 0)        AS total_coverage,
    coalesce(sum(estimated_commission), 0)   AS total_estimated_commission
  FROM opportunities
  GROUP BY agent_id, stage;

-- Recruiting pipeline counts by stage
CREATE OR REPLACE VIEW recruiting_pipeline_summary
  WITH (security_invoker = true) AS
  SELECT stage, count(*) AS candidate_count
  FROM recruiting_pipeline
  GROUP BY stage;
