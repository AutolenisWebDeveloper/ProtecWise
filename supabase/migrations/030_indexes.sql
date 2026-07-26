-- ============================================================
-- Migration 030: indexes
-- Created: 2026-07-26
-- Purpose: Foreign-key, status, token, email, date, composite,
--          and full-text search indexes across all tables.
--          (UNIQUE columns already have an implicit index and are
--          not duplicated here.)
-- Depends on: 002–028
-- ============================================================

-- profiles
CREATE INDEX IF NOT EXISTS idx_profiles_role  ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- agents
CREATE INDEX IF NOT EXISTS idx_agents_status         ON agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_upline         ON agents(upline_agent_id);
CREATE INDEX IF NOT EXISTS idx_agents_is_recruiter   ON agents(is_recruiter);
CREATE INDEX IF NOT EXISTS idx_agents_eo_expires_at  ON agents(eo_expires_at);
CREATE INDEX IF NOT EXISTS idx_agents_email          ON agents(email);

-- clients
CREATE INDEX IF NOT EXISTS idx_clients_household_id     ON clients(household_id);
CREATE INDEX IF NOT EXISTS idx_clients_assigned_agent   ON clients(assigned_agent_id);
CREATE INDEX IF NOT EXISTS idx_clients_status           ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_is_deleted       ON clients(is_deleted);

-- candidates
CREATE INDEX IF NOT EXISTS idx_candidates_recruiter     ON candidates(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_candidates_referred_by   ON candidates(referred_by_agent_id);
CREATE INDEX IF NOT EXISTS idx_candidates_status        ON candidates(status);
CREATE INDEX IF NOT EXISTS idx_candidates_is_deleted    ON candidates(is_deleted);
CREATE INDEX IF NOT EXISTS idx_candidates_fts ON candidates
  USING gin (to_tsvector('english',
    coalesce(first_name,'') || ' ' || coalesce(last_name,'') || ' ' || coalesce(email,'')));

-- households
CREATE INDEX IF NOT EXISTS idx_households_primary_agent   ON households(primary_agent_id);
CREATE INDEX IF NOT EXISTS idx_households_primary_contact ON households(primary_contact_id);
CREATE INDEX IF NOT EXISTS idx_households_state           ON households(state);
CREATE INDEX IF NOT EXISTS idx_households_is_deleted      ON households(is_deleted);
CREATE INDEX IF NOT EXISTS idx_households_fts ON households
  USING gin (to_tsvector('english',
    coalesce(household_name,'') || ' ' || coalesce(email,'')));

-- contacts
CREATE INDEX IF NOT EXISTS idx_contacts_household_id ON contacts(household_id);
CREATE INDEX IF NOT EXISTS idx_contacts_email        ON contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_fts ON contacts
  USING gin (to_tsvector('english',
    coalesce(first_name,'') || ' ' || coalesce(last_name,'') || ' ' || coalesce(email,'')));

-- carriers + rules
CREATE INDEX IF NOT EXISTS idx_carriers_is_active         ON carriers(is_active);
CREATE INDEX IF NOT EXISTS idx_carriers_is_client_visible ON carriers(is_client_visible);
CREATE INDEX IF NOT EXISTS idx_carriers_display_order     ON carriers(display_order);
CREATE INDEX IF NOT EXISTS idx_carrier_product_rules_carrier ON carrier_product_rules(carrier_id);
CREATE INDEX IF NOT EXISTS idx_carrier_product_rules_family  ON carrier_product_rules(product_family);
CREATE INDEX IF NOT EXISTS idx_carrier_state_rules_carrier   ON carrier_state_rules(carrier_id);
CREATE INDEX IF NOT EXISTS idx_carrier_state_rules_state     ON carrier_state_rules(state);

-- agent_carrier_permissions / preferences
CREATE INDEX IF NOT EXISTS idx_acp_agent   ON agent_carrier_permissions(agent_id);
CREATE INDEX IF NOT EXISTS idx_acp_carrier ON agent_carrier_permissions(carrier_id);
CREATE INDEX IF NOT EXISTS idx_acp_status  ON agent_carrier_permissions(status);
CREATE INDEX IF NOT EXISTS idx_acpref_agent   ON agent_carrier_preferences(agent_id);
CREATE INDEX IF NOT EXISTS idx_acpref_carrier ON agent_carrier_preferences(carrier_id);

-- leads
CREATE INDEX IF NOT EXISTS idx_leads_agent_id     ON leads(agent_id);
CREATE INDEX IF NOT EXISTS idx_leads_household_id  ON leads(household_id);
CREATE INDEX IF NOT EXISTS idx_leads_client_id    ON leads(client_id);
CREATE INDEX IF NOT EXISTS idx_leads_status       ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_source       ON leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_email        ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_phone        ON leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_created_at   ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_is_deleted   ON leads(is_deleted);
CREATE INDEX IF NOT EXISTS idx_leads_fts ON leads
  USING gin (to_tsvector('english',
    coalesce(full_name,'') || ' ' || coalesce(email,'') || ' ' || coalesce(phone,'')));

-- opportunities
CREATE INDEX IF NOT EXISTS idx_opps_agent_id      ON opportunities(agent_id);
CREATE INDEX IF NOT EXISTS idx_opps_household_id  ON opportunities(household_id);
CREATE INDEX IF NOT EXISTS idx_opps_lead_id       ON opportunities(lead_id);
CREATE INDEX IF NOT EXISTS idx_opps_contact_id    ON opportunities(contact_id);
CREATE INDEX IF NOT EXISTS idx_opps_client_id     ON opportunities(client_id);
CREATE INDEX IF NOT EXISTS idx_opps_stage         ON opportunities(stage);
CREATE INDEX IF NOT EXISTS idx_opps_close_date    ON opportunities(expected_close_date);
CREATE INDEX IF NOT EXISTS idx_opps_stage_position ON opportunities(stage, position);

-- quotes
CREATE INDEX IF NOT EXISTS idx_quotes_lead_id     ON quotes(lead_id);
CREATE INDEX IF NOT EXISTS idx_quotes_agent_id    ON quotes(agent_id);
CREATE INDEX IF NOT EXISTS idx_quotes_client_id   ON quotes(client_id);
CREATE INDEX IF NOT EXISTS idx_quotes_parent      ON quotes(parent_quote_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status      ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_product     ON quotes(product_family);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at  ON quotes(created_at);
-- Cron reminder scan: open quotes that have not converted yet
CREATE INDEX IF NOT EXISTS idx_quotes_reminders ON quotes(created_at)
  WHERE apply_clicked_at IS NULL;

-- applications
CREATE INDEX IF NOT EXISTS idx_apps_quote_id      ON applications(quote_id);
CREATE INDEX IF NOT EXISTS idx_apps_lead_id       ON applications(lead_id);
CREATE INDEX IF NOT EXISTS idx_apps_client_id     ON applications(client_id);
CREATE INDEX IF NOT EXISTS idx_apps_agent_id      ON applications(agent_id);
CREATE INDEX IF NOT EXISTS idx_apps_carrier_id    ON applications(carrier_id);
CREATE INDEX IF NOT EXISTS idx_apps_status        ON applications(status);
CREATE INDEX IF NOT EXISTS idx_apps_current_step  ON applications(current_step);
CREATE INDEX IF NOT EXISTS idx_apps_submitted_at  ON applications(submitted_at);
CREATE INDEX IF NOT EXISTS idx_apps_is_deleted    ON applications(is_deleted);

-- documents
CREATE INDEX IF NOT EXISTS idx_docs_uploaded_by   ON documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_docs_client_id     ON documents(client_id);
CREATE INDEX IF NOT EXISTS idx_docs_application_id ON documents(application_id);
CREATE INDEX IF NOT EXISTS idx_docs_agent_id      ON documents(agent_id);
CREATE INDEX IF NOT EXISTS idx_docs_candidate_id  ON documents(candidate_id);
CREATE INDEX IF NOT EXISTS idx_docs_household_id  ON documents(household_id);
CREATE INDEX IF NOT EXISTS idx_docs_status        ON documents(status);
CREATE INDEX IF NOT EXISTS idx_docs_category      ON documents(category);
CREATE INDEX IF NOT EXISTS idx_docs_is_deleted    ON documents(is_deleted);

-- tasks
CREATE INDEX IF NOT EXISTS idx_tasks_agent_id     ON tasks(agent_id);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by   ON tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_status       ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority     ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_at       ON tasks(due_at);
CREATE INDEX IF NOT EXISTS idx_tasks_rel_lead        ON tasks(related_lead_id);
CREATE INDEX IF NOT EXISTS idx_tasks_rel_opportunity ON tasks(related_opportunity_id);
CREATE INDEX IF NOT EXISTS idx_tasks_rel_application ON tasks(related_application_id);
CREATE INDEX IF NOT EXISTS idx_tasks_rel_household   ON tasks(related_household_id);
CREATE INDEX IF NOT EXISTS idx_tasks_rel_contact     ON tasks(related_contact_id);
CREATE INDEX IF NOT EXISTS idx_tasks_rel_client      ON tasks(related_client_id);
CREATE INDEX IF NOT EXISTS idx_tasks_rel_candidate   ON tasks(related_candidate_id);

-- calendar_events
CREATE INDEX IF NOT EXISTS idx_cal_agent_id      ON calendar_events(agent_id);
CREATE INDEX IF NOT EXISTS idx_cal_client_id     ON calendar_events(client_id);
CREATE INDEX IF NOT EXISTS idx_cal_contact_id    ON calendar_events(contact_id);
CREATE INDEX IF NOT EXISTS idx_cal_lead_id       ON calendar_events(lead_id);
CREATE INDEX IF NOT EXISTS idx_cal_candidate_id  ON calendar_events(candidate_id);
CREATE INDEX IF NOT EXISTS idx_cal_start_at      ON calendar_events(start_at);
CREATE INDEX IF NOT EXISTS idx_cal_status        ON calendar_events(status);

-- message_threads / messages
CREATE INDEX IF NOT EXISTS idx_threads_agent_id    ON message_threads(agent_id);
CREATE INDEX IF NOT EXISTS idx_threads_client_id   ON message_threads(client_id);
CREATE INDEX IF NOT EXISTS idx_threads_lead_id     ON message_threads(lead_id);
CREATE INDEX IF NOT EXISTS idx_threads_application ON message_threads(application_id);
CREATE INDEX IF NOT EXISTS idx_threads_status      ON message_threads(status);
CREATE INDEX IF NOT EXISTS idx_threads_last_msg    ON message_threads(last_message_at);
CREATE INDEX IF NOT EXISTS idx_messages_thread_id  ON messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id  ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- commissions
CREATE INDEX IF NOT EXISTS idx_comm_agent_id       ON commissions(agent_id);
CREATE INDEX IF NOT EXISTS idx_comm_application_id ON commissions(application_id);
CREATE INDEX IF NOT EXISTS idx_comm_carrier_id     ON commissions(carrier_id);
CREATE INDEX IF NOT EXISTS idx_comm_status         ON commissions(status);
CREATE INDEX IF NOT EXISTS idx_comm_payout_date    ON commissions(payout_date);
CREATE INDEX IF NOT EXISTS idx_comm_statement      ON commissions(statement_period);

-- compliance_records
CREATE INDEX IF NOT EXISTS idx_compliance_agent_id  ON compliance_records(agent_id);
CREATE INDEX IF NOT EXISTS idx_compliance_type      ON compliance_records(record_type);
CREATE INDEX IF NOT EXISTS idx_compliance_status    ON compliance_records(status);
CREATE INDEX IF NOT EXISTS idx_compliance_expires   ON compliance_records(expires_at);
CREATE INDEX IF NOT EXISTS idx_compliance_document  ON compliance_records(document_id);

-- recruiting_pipeline
CREATE INDEX IF NOT EXISTS idx_recruiting_recruiter ON recruiting_pipeline(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_recruiting_stage     ON recruiting_pipeline(stage);
CREATE INDEX IF NOT EXISTS idx_recruiting_stage_pos ON recruiting_pipeline(stage, position);

-- workflow_automations
CREATE INDEX IF NOT EXISTS idx_workflow_trigger   ON workflow_automations(trigger_type);
CREATE INDEX IF NOT EXISTS idx_workflow_is_active ON workflow_automations(is_active);

-- notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user     ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread   ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created  ON notifications(created_at);

-- activity_log
CREATE INDEX IF NOT EXISTS idx_activity_actor      ON activity_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_activity_entity     ON activity_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_action     ON activity_log(action);
CREATE INDEX IF NOT EXISTS idx_activity_created_at ON activity_log(created_at);

-- email_log
CREATE INDEX IF NOT EXISTS idx_email_resend_id   ON email_log(resend_message_id);
CREATE INDEX IF NOT EXISTS idx_email_lead_id     ON email_log(lead_id);
CREATE INDEX IF NOT EXISTS idx_email_client_id   ON email_log(client_id);
CREATE INDEX IF NOT EXISTS idx_email_agent_id    ON email_log(agent_id);
CREATE INDEX IF NOT EXISTS idx_email_candidate_id ON email_log(candidate_id);
CREATE INDEX IF NOT EXISTS idx_email_status      ON email_log(status);
CREATE INDEX IF NOT EXISTS idx_email_template    ON email_log(template);
CREATE INDEX IF NOT EXISTS idx_email_created_at  ON email_log(created_at);

-- client_auth_tokens / password_resets
CREATE INDEX IF NOT EXISTS idx_client_tokens_client ON client_auth_tokens(client_id);
CREATE INDEX IF NOT EXISTS idx_client_tokens_email  ON client_auth_tokens(email);
CREATE INDEX IF NOT EXISTS idx_client_tokens_expiry ON client_auth_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_pwresets_user   ON password_resets(user_id);
CREATE INDEX IF NOT EXISTS idx_pwresets_email  ON password_resets(email);
CREATE INDEX IF NOT EXISTS idx_pwresets_expiry ON password_resets(expires_at);
