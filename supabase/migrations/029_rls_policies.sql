-- ============================================================
-- Migration 029: Row Level Security — enable + policies
-- Created: 2026-07-26
-- Purpose: Enable RLS on every table and apply role-appropriate
--          policies. Server code using the service role key
--          bypasses RLS by design (public quote flow, cron, admin ops).
-- Depends on: 002–028
-- ============================================================

-- ------------------------------------------------------------
-- Helper functions (SECURITY DEFINER so they bypass RLS on the
-- tables they read — prevents recursive policy evaluation).
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.current_agent_id()
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT id FROM public.agents WHERE user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.current_client_id()
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public, pg_temp AS $$
  SELECT id FROM public.clients WHERE user_id = auth.uid();
$$;

-- ------------------------------------------------------------
-- Enable RLS on every table
-- ------------------------------------------------------------
ALTER TABLE profiles                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients                    ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE households                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE carriers                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE carrier_product_rules      ENABLE ROW LEVEL SECURITY;
ALTER TABLE carrier_state_rules        ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_carrier_permissions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_carrier_preferences  ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities              ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications               ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks                      ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events            ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_threads            ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions                ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_records         ENABLE ROW LEVEL SECURITY;
ALTER TABLE recruiting_pipeline        ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_automations       ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications              ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log               ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_log                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_auth_tokens         ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_resets            ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------
-- profiles: own record or admin
-- ------------------------------------------------------------
DROP POLICY IF EXISTS profiles_self_or_admin ON profiles;
CREATE POLICY profiles_self_or_admin ON profiles
  FOR ALL
  USING (id = auth.uid() OR public.is_admin())
  WITH CHECK (id = auth.uid() OR public.is_admin());

-- ------------------------------------------------------------
-- agents: own record or admin
-- ------------------------------------------------------------
DROP POLICY IF EXISTS agents_self_or_admin ON agents;
CREATE POLICY agents_self_or_admin ON agents
  FOR ALL
  USING (user_id = auth.uid() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR public.is_admin());

-- ------------------------------------------------------------
-- clients: own, assigned agent, or admin
-- ------------------------------------------------------------
DROP POLICY IF EXISTS clients_scope ON clients;
CREATE POLICY clients_scope ON clients
  FOR ALL
  USING (user_id = auth.uid() OR assigned_agent_id = public.current_agent_id() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR assigned_agent_id = public.current_agent_id() OR public.is_admin());

-- ------------------------------------------------------------
-- candidates: own, assigned recruiter, or admin
-- ------------------------------------------------------------
DROP POLICY IF EXISTS candidates_scope ON candidates;
CREATE POLICY candidates_scope ON candidates
  FOR ALL
  USING (user_id = auth.uid() OR recruiter_id = public.current_agent_id() OR public.is_admin())
  WITH CHECK (user_id = auth.uid() OR recruiter_id = public.current_agent_id() OR public.is_admin());

-- ------------------------------------------------------------
-- households / contacts: owning agent or admin
-- ------------------------------------------------------------
DROP POLICY IF EXISTS households_scope ON households;
CREATE POLICY households_scope ON households
  FOR ALL
  USING (primary_agent_id = public.current_agent_id() OR public.is_admin())
  WITH CHECK (primary_agent_id = public.current_agent_id() OR public.is_admin());

DROP POLICY IF EXISTS contacts_scope ON contacts;
CREATE POLICY contacts_scope ON contacts
  FOR ALL
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM households h
      WHERE h.id = contacts.household_id
        AND h.primary_agent_id = public.current_agent_id()
    )
  )
  WITH CHECK (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM households h
      WHERE h.id = contacts.household_id
        AND h.primary_agent_id = public.current_agent_id()
    )
  );

-- ------------------------------------------------------------
-- carriers + rules: authenticated read, admin write
-- ------------------------------------------------------------
DROP POLICY IF EXISTS carriers_read ON carriers;
CREATE POLICY carriers_read ON carriers
  FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS carriers_admin_write ON carriers;
CREATE POLICY carriers_admin_write ON carriers
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS carrier_product_rules_read ON carrier_product_rules;
CREATE POLICY carrier_product_rules_read ON carrier_product_rules
  FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS carrier_product_rules_admin_write ON carrier_product_rules;
CREATE POLICY carrier_product_rules_admin_write ON carrier_product_rules
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS carrier_state_rules_read ON carrier_state_rules;
CREATE POLICY carrier_state_rules_read ON carrier_state_rules
  FOR SELECT USING (auth.uid() IS NOT NULL);
DROP POLICY IF EXISTS carrier_state_rules_admin_write ON carrier_state_rules;
CREATE POLICY carrier_state_rules_admin_write ON carrier_state_rules
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ------------------------------------------------------------
-- agent_carrier_permissions / preferences: owning agent or admin
-- ------------------------------------------------------------
DROP POLICY IF EXISTS agent_carrier_permissions_scope ON agent_carrier_permissions;
CREATE POLICY agent_carrier_permissions_scope ON agent_carrier_permissions
  FOR ALL
  USING (agent_id = public.current_agent_id() OR public.is_admin())
  WITH CHECK (agent_id = public.current_agent_id() OR public.is_admin());

DROP POLICY IF EXISTS agent_carrier_preferences_scope ON agent_carrier_preferences;
CREATE POLICY agent_carrier_preferences_scope ON agent_carrier_preferences
  FOR ALL
  USING (agent_id = public.current_agent_id() OR public.is_admin())
  WITH CHECK (agent_id = public.current_agent_id() OR public.is_admin());

-- ------------------------------------------------------------
-- leads: owning agent, linked client, or admin
-- ------------------------------------------------------------
DROP POLICY IF EXISTS leads_scope ON leads;
CREATE POLICY leads_scope ON leads
  FOR ALL
  USING (agent_id = public.current_agent_id() OR client_id = public.current_client_id() OR public.is_admin())
  WITH CHECK (agent_id = public.current_agent_id() OR public.is_admin());

-- ------------------------------------------------------------
-- opportunities: owning agent or admin
-- ------------------------------------------------------------
DROP POLICY IF EXISTS opportunities_scope ON opportunities;
CREATE POLICY opportunities_scope ON opportunities
  FOR ALL
  USING (agent_id = public.current_agent_id() OR public.is_admin())
  WITH CHECK (agent_id = public.current_agent_id() OR public.is_admin());

-- ------------------------------------------------------------
-- quotes: owning agent, linked client, or admin
-- ------------------------------------------------------------
DROP POLICY IF EXISTS quotes_scope ON quotes;
CREATE POLICY quotes_scope ON quotes
  FOR ALL
  USING (agent_id = public.current_agent_id() OR client_id = public.current_client_id() OR public.is_admin())
  WITH CHECK (agent_id = public.current_agent_id() OR client_id = public.current_client_id() OR public.is_admin());

-- ------------------------------------------------------------
-- applications: owning agent, linked client, or admin
-- ------------------------------------------------------------
DROP POLICY IF EXISTS applications_scope ON applications;
CREATE POLICY applications_scope ON applications
  FOR ALL
  USING (agent_id = public.current_agent_id() OR client_id = public.current_client_id() OR public.is_admin())
  WITH CHECK (agent_id = public.current_agent_id() OR client_id = public.current_client_id() OR public.is_admin());

-- ------------------------------------------------------------
-- documents: uploader, owning agent, linked client, or admin
-- ------------------------------------------------------------
DROP POLICY IF EXISTS documents_scope ON documents;
CREATE POLICY documents_scope ON documents
  FOR ALL
  USING (
    uploaded_by = auth.uid()
    OR agent_id = public.current_agent_id()
    OR client_id = public.current_client_id()
    OR public.is_admin()
  )
  WITH CHECK (
    uploaded_by = auth.uid()
    OR agent_id = public.current_agent_id()
    OR client_id = public.current_client_id()
    OR public.is_admin()
  );

-- ------------------------------------------------------------
-- tasks: assignee agent, creator, or admin
-- ------------------------------------------------------------
DROP POLICY IF EXISTS tasks_scope ON tasks;
CREATE POLICY tasks_scope ON tasks
  FOR ALL
  USING (agent_id = public.current_agent_id() OR created_by = auth.uid() OR public.is_admin())
  WITH CHECK (agent_id = public.current_agent_id() OR created_by = auth.uid() OR public.is_admin());

-- ------------------------------------------------------------
-- calendar_events: owning agent or admin
-- ------------------------------------------------------------
DROP POLICY IF EXISTS calendar_events_scope ON calendar_events;
CREATE POLICY calendar_events_scope ON calendar_events
  FOR ALL
  USING (agent_id = public.current_agent_id() OR public.is_admin())
  WITH CHECK (agent_id = public.current_agent_id() OR public.is_admin());

-- ------------------------------------------------------------
-- message_threads: participant agent/client or admin
-- ------------------------------------------------------------
DROP POLICY IF EXISTS message_threads_scope ON message_threads;
CREATE POLICY message_threads_scope ON message_threads
  FOR ALL
  USING (agent_id = public.current_agent_id() OR client_id = public.current_client_id() OR public.is_admin())
  WITH CHECK (agent_id = public.current_agent_id() OR client_id = public.current_client_id() OR public.is_admin());

-- ------------------------------------------------------------
-- messages: participants of the parent thread or admin
-- ------------------------------------------------------------
DROP POLICY IF EXISTS messages_scope ON messages;
CREATE POLICY messages_scope ON messages
  FOR ALL
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM message_threads t
      WHERE t.id = messages.thread_id
        AND (t.agent_id = public.current_agent_id() OR t.client_id = public.current_client_id())
    )
  )
  WITH CHECK (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM message_threads t
      WHERE t.id = messages.thread_id
        AND (t.agent_id = public.current_agent_id() OR t.client_id = public.current_client_id())
    )
  );

-- ------------------------------------------------------------
-- commissions: owning agent or admin
-- ------------------------------------------------------------
DROP POLICY IF EXISTS commissions_scope ON commissions;
CREATE POLICY commissions_scope ON commissions
  FOR ALL
  USING (agent_id = public.current_agent_id() OR public.is_admin())
  WITH CHECK (agent_id = public.current_agent_id() OR public.is_admin());

-- ------------------------------------------------------------
-- compliance_records: owning agent or admin
-- ------------------------------------------------------------
DROP POLICY IF EXISTS compliance_records_scope ON compliance_records;
CREATE POLICY compliance_records_scope ON compliance_records
  FOR ALL
  USING (agent_id = public.current_agent_id() OR public.is_admin())
  WITH CHECK (agent_id = public.current_agent_id() OR public.is_admin());

-- ------------------------------------------------------------
-- recruiting_pipeline: assigned recruiter or admin
-- ------------------------------------------------------------
DROP POLICY IF EXISTS recruiting_pipeline_scope ON recruiting_pipeline;
CREATE POLICY recruiting_pipeline_scope ON recruiting_pipeline
  FOR ALL
  USING (recruiter_id = public.current_agent_id() OR public.is_admin())
  WITH CHECK (recruiter_id = public.current_agent_id() OR public.is_admin());

-- ------------------------------------------------------------
-- workflow_automations: admin only
-- ------------------------------------------------------------
DROP POLICY IF EXISTS workflow_automations_admin ON workflow_automations;
CREATE POLICY workflow_automations_admin ON workflow_automations
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ------------------------------------------------------------
-- notifications: own user only
-- ------------------------------------------------------------
DROP POLICY IF EXISTS notifications_own ON notifications;
CREATE POLICY notifications_own ON notifications
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ------------------------------------------------------------
-- activity_log: admin read only (writes via service role)
-- ------------------------------------------------------------
DROP POLICY IF EXISTS activity_log_admin_read ON activity_log;
CREATE POLICY activity_log_admin_read ON activity_log
  FOR SELECT USING (public.is_admin());

-- ------------------------------------------------------------
-- email_log: admin + owning agent read (writes via service role)
-- ------------------------------------------------------------
DROP POLICY IF EXISTS email_log_read ON email_log;
CREATE POLICY email_log_read ON email_log
  FOR SELECT USING (public.is_admin() OR agent_id = public.current_agent_id());

-- ------------------------------------------------------------
-- client_auth_tokens / password_resets:
-- RLS enabled with NO policies => accessible only via service role.
-- ------------------------------------------------------------
