// ============================================================
// Supabase generated types — ProtecWise
// Introspected from migrations 001–031 against PostgreSQL 16.
// Regenerate after schema changes with: pnpm db:types
// (`supabase gen types typescript --local` once the local stack is up).
// ============================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      activity_log: {
        Row: {
        id: string
        actor_id: string | null
        actor_role: string | null
        action: string
        entity_type: string | null
        entity_id: string | null
        description: string | null
        ip_address: string | null
        user_agent: string | null
        changes: Json
        metadata: Json
        created_at: string
        updated_at: string
        }
        Insert: {
        id?: string
        actor_id?: string | null
        actor_role?: string | null
        action: string
        entity_type?: string | null
        entity_id?: string | null
        description?: string | null
        ip_address?: string | null
        user_agent?: string | null
        changes?: Json
        metadata?: Json
        created_at?: string
        updated_at?: string
        }
        Update: {
        id?: string
        actor_id?: string | null
        actor_role?: string | null
        action?: string
        entity_type?: string | null
        entity_id?: string | null
        description?: string | null
        ip_address?: string | null
        user_agent?: string | null
        changes?: Json
        metadata?: Json
        created_at?: string
        updated_at?: string
        }
        Relationships: []
      }
      agent_carrier_permissions: {
        Row: {
        id: string
        agent_id: string
        carrier_id: string
        status: string
        appointment_number: string | null
        appointed_states: Json
        requested_at: string
        approved_by: string | null
        approved_at: string | null
        denied_reason: string | null
        metadata: Json
        created_at: string
        updated_at: string
        }
        Insert: {
        id?: string
        agent_id: string
        carrier_id: string
        status?: string
        appointment_number?: string | null
        appointed_states?: Json
        requested_at?: string
        approved_by?: string | null
        approved_at?: string | null
        denied_reason?: string | null
        metadata?: Json
        created_at?: string
        updated_at?: string
        }
        Update: {
        id?: string
        agent_id?: string
        carrier_id?: string
        status?: string
        appointment_number?: string | null
        appointed_states?: Json
        requested_at?: string
        approved_by?: string | null
        approved_at?: string | null
        denied_reason?: string | null
        metadata?: Json
        created_at?: string
        updated_at?: string
        }
        Relationships: []
      }
      agent_carrier_preferences: {
        Row: {
        id: string
        agent_id: string
        carrier_id: string
        is_preferred: boolean
        display_order: number
        notes: string | null
        metadata: Json
        created_at: string
        updated_at: string
        }
        Insert: {
        id?: string
        agent_id: string
        carrier_id: string
        is_preferred?: boolean
        display_order?: number
        notes?: string | null
        metadata?: Json
        created_at?: string
        updated_at?: string
        }
        Update: {
        id?: string
        agent_id?: string
        carrier_id?: string
        is_preferred?: boolean
        display_order?: number
        notes?: string | null
        metadata?: Json
        created_at?: string
        updated_at?: string
        }
        Relationships: []
      }
      agents: {
        Row: {
        id: string
        user_id: string | null
        agent_code: string | null
        status: string
        first_name: string | null
        last_name: string | null
        email: string | null
        phone: string | null
        npn: string | null
        resident_state: string | null
        license_numbers: Json
        appointed_states: Json
        eo_carrier: string | null
        eo_policy_number: string | null
        eo_coverage_amount: number | null
        eo_expires_at: string | null
        upline_agent_id: string | null
        commission_tier: string | null
        is_recruiter: boolean
        banking_encrypted: string | null
        w9_on_file: boolean
        tax_id_last_four: string | null
        hire_date: string | null
        bio: string | null
        headshot_url: string | null
        metadata: Json
        created_at: string
        updated_at: string
        }
        Insert: {
        id?: string
        user_id?: string | null
        agent_code?: string | null
        status?: string
        first_name?: string | null
        last_name?: string | null
        email?: string | null
        phone?: string | null
        npn?: string | null
        resident_state?: string | null
        license_numbers?: Json
        appointed_states?: Json
        eo_carrier?: string | null
        eo_policy_number?: string | null
        eo_coverage_amount?: number | null
        eo_expires_at?: string | null
        upline_agent_id?: string | null
        commission_tier?: string | null
        is_recruiter?: boolean
        banking_encrypted?: string | null
        w9_on_file?: boolean
        tax_id_last_four?: string | null
        hire_date?: string | null
        bio?: string | null
        headshot_url?: string | null
        metadata?: Json
        created_at?: string
        updated_at?: string
        }
        Update: {
        id?: string
        user_id?: string | null
        agent_code?: string | null
        status?: string
        first_name?: string | null
        last_name?: string | null
        email?: string | null
        phone?: string | null
        npn?: string | null
        resident_state?: string | null
        license_numbers?: Json
        appointed_states?: Json
        eo_carrier?: string | null
        eo_policy_number?: string | null
        eo_coverage_amount?: number | null
        eo_expires_at?: string | null
        upline_agent_id?: string | null
        commission_tier?: string | null
        is_recruiter?: boolean
        banking_encrypted?: string | null
        w9_on_file?: boolean
        tax_id_last_four?: string | null
        hire_date?: string | null
        bio?: string | null
        headshot_url?: string | null
        metadata?: Json
        created_at?: string
        updated_at?: string
        }
        Relationships: []
      }
      applications: {
        Row: {
        id: string
        quote_id: string | null
        lead_id: string | null
        client_id: string | null
        agent_id: string | null
        carrier_id: string | null
        product_family: string | null
        coverage_amount: number | null
        current_step: number
        status: string
        step_1_quote_confirmation: Json
        step_2_personal_info: Json
        step_3_beneficiaries: Json
        step_4_coverage_context: Json
        step_5_health_encrypted: string | null
        step_6_financial_encrypted: string | null
        step_7_disclosures: Json
        step_8_review: Json
        ssn_last_four_encrypted: string | null
        replacement_flag: boolean
        replacement_carrier: string | null
        replacement_policy: string | null
        aml_review_required: boolean
        aml_reviewed_at: string | null
        resume_token: string | null
        last_autosaved_at: string | null
        submitted_at: string | null
        confirmation_sent_at: string | null
        metadata: Json
        is_deleted: boolean
        deleted_at: string | null
        created_at: string
        updated_at: string
        }
        Insert: {
        id?: string
        quote_id?: string | null
        lead_id?: string | null
        client_id?: string | null
        agent_id?: string | null
        carrier_id?: string | null
        product_family?: string | null
        coverage_amount?: number | null
        current_step?: number
        status?: string
        step_1_quote_confirmation?: Json
        step_2_personal_info?: Json
        step_3_beneficiaries?: Json
        step_4_coverage_context?: Json
        step_5_health_encrypted?: string | null
        step_6_financial_encrypted?: string | null
        step_7_disclosures?: Json
        step_8_review?: Json
        ssn_last_four_encrypted?: string | null
        replacement_flag?: boolean
        replacement_carrier?: string | null
        replacement_policy?: string | null
        aml_review_required?: boolean
        aml_reviewed_at?: string | null
        resume_token?: string | null
        last_autosaved_at?: string | null
        submitted_at?: string | null
        confirmation_sent_at?: string | null
        metadata?: Json
        is_deleted?: boolean
        deleted_at?: string | null
        created_at?: string
        updated_at?: string
        }
        Update: {
        id?: string
        quote_id?: string | null
        lead_id?: string | null
        client_id?: string | null
        agent_id?: string | null
        carrier_id?: string | null
        product_family?: string | null
        coverage_amount?: number | null
        current_step?: number
        status?: string
        step_1_quote_confirmation?: Json
        step_2_personal_info?: Json
        step_3_beneficiaries?: Json
        step_4_coverage_context?: Json
        step_5_health_encrypted?: string | null
        step_6_financial_encrypted?: string | null
        step_7_disclosures?: Json
        step_8_review?: Json
        ssn_last_four_encrypted?: string | null
        replacement_flag?: boolean
        replacement_carrier?: string | null
        replacement_policy?: string | null
        aml_review_required?: boolean
        aml_reviewed_at?: string | null
        resume_token?: string | null
        last_autosaved_at?: string | null
        submitted_at?: string | null
        confirmation_sent_at?: string | null
        metadata?: Json
        is_deleted?: boolean
        deleted_at?: string | null
        created_at?: string
        updated_at?: string
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
        id: string
        agent_id: string | null
        title: string
        description: string | null
        event_type: string
        start_at: string
        end_at: string | null
        all_day: boolean
        location: string | null
        client_id: string | null
        contact_id: string | null
        lead_id: string | null
        candidate_id: string | null
        status: string
        reminder_sent_at: string | null
        sms_reminder_sent_at: string | null
        external_calendar_id: string | null
        metadata: Json
        created_at: string
        updated_at: string
        }
        Insert: {
        id?: string
        agent_id?: string | null
        title: string
        description?: string | null
        event_type?: string
        start_at: string
        end_at?: string | null
        all_day?: boolean
        location?: string | null
        client_id?: string | null
        contact_id?: string | null
        lead_id?: string | null
        candidate_id?: string | null
        status?: string
        reminder_sent_at?: string | null
        sms_reminder_sent_at?: string | null
        external_calendar_id?: string | null
        metadata?: Json
        created_at?: string
        updated_at?: string
        }
        Update: {
        id?: string
        agent_id?: string | null
        title?: string
        description?: string | null
        event_type?: string
        start_at?: string
        end_at?: string | null
        all_day?: boolean
        location?: string | null
        client_id?: string | null
        contact_id?: string | null
        lead_id?: string | null
        candidate_id?: string | null
        status?: string
        reminder_sent_at?: string | null
        sms_reminder_sent_at?: string | null
        external_calendar_id?: string | null
        metadata?: Json
        created_at?: string
        updated_at?: string
        }
        Relationships: []
      }
      candidates: {
        Row: {
        id: string
        user_id: string | null
        first_name: string | null
        last_name: string | null
        email: string | null
        phone: string | null
        state: string | null
        timezone: string
        status: string
        source: string | null
        resume_url: string | null
        has_insurance_license: boolean
        license_states: Json
        years_experience: number | null
        current_occupation: string | null
        motivation: string | null
        recruiter_id: string | null
        referred_by_agent_id: string | null
        sms_consent: boolean
        sms_consent_at: string | null
        sms_consent_ip: string | null
        sms_consent_language: string | null
        sms_opt_out: boolean
        sms_opt_out_at: string | null
        email_opt_out: boolean
        email_opt_out_at: string | null
        unsubscribe_token: string | null
        background_check_status: string | null
        offer_extended_at: string | null
        expected_start_date: string | null
        notes: string | null
        metadata: Json
        is_deleted: boolean
        deleted_at: string | null
        created_at: string
        updated_at: string
        }
        Insert: {
        id?: string
        user_id?: string | null
        first_name?: string | null
        last_name?: string | null
        email?: string | null
        phone?: string | null
        state?: string | null
        timezone?: string
        status?: string
        source?: string | null
        resume_url?: string | null
        has_insurance_license?: boolean
        license_states?: Json
        years_experience?: number | null
        current_occupation?: string | null
        motivation?: string | null
        recruiter_id?: string | null
        referred_by_agent_id?: string | null
        sms_consent?: boolean
        sms_consent_at?: string | null
        sms_consent_ip?: string | null
        sms_consent_language?: string | null
        sms_opt_out?: boolean
        sms_opt_out_at?: string | null
        email_opt_out?: boolean
        email_opt_out_at?: string | null
        unsubscribe_token?: string | null
        background_check_status?: string | null
        offer_extended_at?: string | null
        expected_start_date?: string | null
        notes?: string | null
        metadata?: Json
        is_deleted?: boolean
        deleted_at?: string | null
        created_at?: string
        updated_at?: string
        }
        Update: {
        id?: string
        user_id?: string | null
        first_name?: string | null
        last_name?: string | null
        email?: string | null
        phone?: string | null
        state?: string | null
        timezone?: string
        status?: string
        source?: string | null
        resume_url?: string | null
        has_insurance_license?: boolean
        license_states?: Json
        years_experience?: number | null
        current_occupation?: string | null
        motivation?: string | null
        recruiter_id?: string | null
        referred_by_agent_id?: string | null
        sms_consent?: boolean
        sms_consent_at?: string | null
        sms_consent_ip?: string | null
        sms_consent_language?: string | null
        sms_opt_out?: boolean
        sms_opt_out_at?: string | null
        email_opt_out?: boolean
        email_opt_out_at?: string | null
        unsubscribe_token?: string | null
        background_check_status?: string | null
        offer_extended_at?: string | null
        expected_start_date?: string | null
        notes?: string | null
        metadata?: Json
        is_deleted?: boolean
        deleted_at?: string | null
        created_at?: string
        updated_at?: string
        }
        Relationships: []
      }
      carrier_product_rules: {
        Row: {
        id: string
        carrier_id: string
        product_family: string
        is_active: boolean
        min_coverage: number | null
        max_coverage: number | null
        min_age: number | null
        max_age: number | null
        available_terms: Json
        notes: string | null
        metadata: Json
        created_at: string
        updated_at: string
        }
        Insert: {
        id?: string
        carrier_id: string
        product_family: string
        is_active?: boolean
        min_coverage?: number | null
        max_coverage?: number | null
        min_age?: number | null
        max_age?: number | null
        available_terms?: Json
        notes?: string | null
        metadata?: Json
        created_at?: string
        updated_at?: string
        }
        Update: {
        id?: string
        carrier_id?: string
        product_family?: string
        is_active?: boolean
        min_coverage?: number | null
        max_coverage?: number | null
        min_age?: number | null
        max_age?: number | null
        available_terms?: Json
        notes?: string | null
        metadata?: Json
        created_at?: string
        updated_at?: string
        }
        Relationships: []
      }
      carrier_state_rules: {
        Row: {
        id: string
        carrier_id: string
        state: string
        is_active: boolean
        notes: string | null
        metadata: Json
        created_at: string
        updated_at: string
        }
        Insert: {
        id?: string
        carrier_id: string
        state: string
        is_active?: boolean
        notes?: string | null
        metadata?: Json
        created_at?: string
        updated_at?: string
        }
        Update: {
        id?: string
        carrier_id?: string
        state?: string
        is_active?: boolean
        notes?: string | null
        metadata?: Json
        created_at?: string
        updated_at?: string
        }
        Relationships: []
      }
      carriers: {
        Row: {
        id: string
        compulife_id: string | null
        name: string
        short_name: string | null
        logo_url: string | null
        naic_code: string | null
        am_best_rating: string | null
        is_active: boolean
        is_client_visible: boolean
        product_families: Json
        states_available: Json
        display_order: number
        website: string | null
        phone: string | null
        notes: string | null
        metadata: Json
        created_at: string
        updated_at: string
        }
        Insert: {
        id?: string
        compulife_id?: string | null
        name: string
        short_name?: string | null
        logo_url?: string | null
        naic_code?: string | null
        am_best_rating?: string | null
        is_active?: boolean
        is_client_visible?: boolean
        product_families?: Json
        states_available?: Json
        display_order?: number
        website?: string | null
        phone?: string | null
        notes?: string | null
        metadata?: Json
        created_at?: string
        updated_at?: string
        }
        Update: {
        id?: string
        compulife_id?: string | null
        name?: string
        short_name?: string | null
        logo_url?: string | null
        naic_code?: string | null
        am_best_rating?: string | null
        is_active?: boolean
        is_client_visible?: boolean
        product_families?: Json
        states_available?: Json
        display_order?: number
        website?: string | null
        phone?: string | null
        notes?: string | null
        metadata?: Json
        created_at?: string
        updated_at?: string
        }
        Relationships: []
      }
      client_auth_tokens: {
        Row: {
        id: string
        client_id: string | null
        email: string
        token: string
        token_type: string
        expires_at: string
        used_at: string | null
        ip_address: string | null
        metadata: Json
        created_at: string
        updated_at: string
        }
        Insert: {
        id?: string
        client_id?: string | null
        email: string
        token?: string
        token_type?: string
        expires_at: string
        used_at?: string | null
        ip_address?: string | null
        metadata?: Json
        created_at?: string
        updated_at?: string
        }
        Update: {
        id?: string
        client_id?: string | null
        email?: string
        token?: string
        token_type?: string
        expires_at?: string
        used_at?: string | null
        ip_address?: string | null
        metadata?: Json
        created_at?: string
        updated_at?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
        id: string
        user_id: string | null
        household_id: string | null
        first_name: string | null
        last_name: string | null
        full_name: string | null
        email: string | null
        phone: string | null
        date_of_birth: string | null
        gender: string | null
        state: string | null
        timezone: string
        status: string
        assigned_agent_id: string | null
        email_opt_out: boolean
        email_opt_out_at: string | null
        unsubscribe_token: string | null
        last_login_at: string | null
        notes: string | null
        metadata: Json
        is_deleted: boolean
        deleted_at: string | null
        created_at: string
        updated_at: string
        }
        Insert: {
        id?: string
        user_id?: string | null
        household_id?: string | null
        first_name?: string | null
        last_name?: string | null
        full_name?: string | null
        email?: string | null
        phone?: string | null
        date_of_birth?: string | null
        gender?: string | null
        state?: string | null
        timezone?: string
        status?: string
        assigned_agent_id?: string | null
        email_opt_out?: boolean
        email_opt_out_at?: string | null
        unsubscribe_token?: string | null
        last_login_at?: string | null
        notes?: string | null
        metadata?: Json
        is_deleted?: boolean
        deleted_at?: string | null
        created_at?: string
        updated_at?: string
        }
        Update: {
        id?: string
        user_id?: string | null
        household_id?: string | null
        first_name?: string | null
        last_name?: string | null
        full_name?: string | null
        email?: string | null
        phone?: string | null
        date_of_birth?: string | null
        gender?: string | null
        state?: string | null
        timezone?: string
        status?: string
        assigned_agent_id?: string | null
        email_opt_out?: boolean
        email_opt_out_at?: string | null
        unsubscribe_token?: string | null
        last_login_at?: string | null
        notes?: string | null
        metadata?: Json
        is_deleted?: boolean
        deleted_at?: string | null
        created_at?: string
        updated_at?: string
        }
        Relationships: []
      }
      commissions: {
        Row: {
        id: string
        agent_id: string | null
        application_id: string | null
        carrier_id: string | null
        policy_number: string | null
        product_family: string | null
        face_amount: number | null
        annual_premium: number | null
        commission_rate: number | null
        commission_type: string
        projected_amount: number | null
        actual_amount: number | null
        status: string
        payout_date: string | null
        chargeback_amount: number | null
        chargeback_at: string | null
        statement_period: string | null
        notes: string | null
        metadata: Json
        created_at: string
        updated_at: string
        }
        Insert: {
        id?: string
        agent_id?: string | null
        application_id?: string | null
        carrier_id?: string | null
        policy_number?: string | null
        product_family?: string | null
        face_amount?: number | null
        annual_premium?: number | null
        commission_rate?: number | null
        commission_type?: string
        projected_amount?: number | null
        actual_amount?: number | null
        status?: string
        payout_date?: string | null
        chargeback_amount?: number | null
        chargeback_at?: string | null
        statement_period?: string | null
        notes?: string | null
        metadata?: Json
        created_at?: string
        updated_at?: string
        }
        Update: {
        id?: string
        agent_id?: string | null
        application_id?: string | null
        carrier_id?: string | null
        policy_number?: string | null
        product_family?: string | null
        face_amount?: number | null
        annual_premium?: number | null
        commission_rate?: number | null
        commission_type?: string
        projected_amount?: number | null
        actual_amount?: number | null
        status?: string
        payout_date?: string | null
        chargeback_amount?: number | null
        chargeback_at?: string | null
        statement_period?: string | null
        notes?: string | null
        metadata?: Json
        created_at?: string
        updated_at?: string
        }
        Relationships: []
      }
      compliance_records: {
        Row: {
        id: string
        agent_id: string | null
        record_type: string
        title: string | null
        status: string
        state: string | null
        reference_number: string | null
        issued_at: string | null
        expires_at: string | null
        alert_sent_at: string | null
        completed_at: string | null
        document_id: string | null
        notes: string | null
        metadata: Json
        created_at: string
        updated_at: string
        }
        Insert: {
        id?: string
        agent_id?: string | null
        record_type?: string
        title?: string | null
        status?: string
        state?: string | null
        reference_number?: string | null
        issued_at?: string | null
        expires_at?: string | null
        alert_sent_at?: string | null
        completed_at?: string | null
        document_id?: string | null
        notes?: string | null
        metadata?: Json
        created_at?: string
        updated_at?: string
        }
        Update: {
        id?: string
        agent_id?: string | null
        record_type?: string
        title?: string | null
        status?: string
        state?: string | null
        reference_number?: string | null
        issued_at?: string | null
        expires_at?: string | null
        alert_sent_at?: string | null
        completed_at?: string | null
        document_id?: string | null
        notes?: string | null
        metadata?: Json
        created_at?: string
        updated_at?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
        id: string
        household_id: string | null
        first_name: string | null
        last_name: string | null
        email: string | null
        phone: string | null
        date_of_birth: string | null
        gender: string | null
        relationship: string
        is_primary: boolean
        occupation: string | null
        notes: string | null
        metadata: Json
        created_at: string
        updated_at: string
        }
        Insert: {
        id?: string
        household_id?: string | null
        first_name?: string | null
        last_name?: string | null
        email?: string | null
        phone?: string | null
        date_of_birth?: string | null
        gender?: string | null
        relationship?: string
        is_primary?: boolean
        occupation?: string | null
        notes?: string | null
        metadata?: Json
        created_at?: string
        updated_at?: string
        }
        Update: {
        id?: string
        household_id?: string | null
        first_name?: string | null
        last_name?: string | null
        email?: string | null
        phone?: string | null
        date_of_birth?: string | null
        gender?: string | null
        relationship?: string
        is_primary?: boolean
        occupation?: string | null
        notes?: string | null
        metadata?: Json
        created_at?: string
        updated_at?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
        id: string
        uploaded_by: string | null
        client_id: string | null
        application_id: string | null
        agent_id: string | null
        candidate_id: string | null
        household_id: string | null
        category: string
        name: string
        file_path: string | null
        file_size: number | null
        mime_type: string | null
        status: string
        requested_at: string | null
        reviewed_by: string | null
        reviewed_at: string | null
        rejection_reason: string | null
        metadata: Json
        is_deleted: boolean
        deleted_at: string | null
        created_at: string
        updated_at: string
        }
        Insert: {
        id?: string
        uploaded_by?: string | null
        client_id?: string | null
        application_id?: string | null
        agent_id?: string | null
        candidate_id?: string | null
        household_id?: string | null
        category?: string
        name: string
        file_path?: string | null
        file_size?: number | null
        mime_type?: string | null
        status?: string
        requested_at?: string | null
        reviewed_by?: string | null
        reviewed_at?: string | null
        rejection_reason?: string | null
        metadata?: Json
        is_deleted?: boolean
        deleted_at?: string | null
        created_at?: string
        updated_at?: string
        }
        Update: {
        id?: string
        uploaded_by?: string | null
        client_id?: string | null
        application_id?: string | null
        agent_id?: string | null
        candidate_id?: string | null
        household_id?: string | null
        category?: string
        name?: string
        file_path?: string | null
        file_size?: number | null
        mime_type?: string | null
        status?: string
        requested_at?: string | null
        reviewed_by?: string | null
        reviewed_at?: string | null
        rejection_reason?: string | null
        metadata?: Json
        is_deleted?: boolean
        deleted_at?: string | null
        created_at?: string
        updated_at?: string
        }
        Relationships: []
      }
      email_log: {
        Row: {
        id: string
        resend_message_id: string | null
        template: string | null
        to_email: string
        from_email: string | null
        subject: string | null
        lead_id: string | null
        client_id: string | null
        agent_id: string | null
        candidate_id: string | null
        status: string
        opened_at: string | null
        clicked_at: string | null
        error: string | null
        unsubscribe_token: string | null
        metadata: Json
        created_at: string
        updated_at: string
        }
        Insert: {
        id?: string
        resend_message_id?: string | null
        template?: string | null
        to_email: string
        from_email?: string | null
        subject?: string | null
        lead_id?: string | null
        client_id?: string | null
        agent_id?: string | null
        candidate_id?: string | null
        status?: string
        opened_at?: string | null
        clicked_at?: string | null
        error?: string | null
        unsubscribe_token?: string | null
        metadata?: Json
        created_at?: string
        updated_at?: string
        }
        Update: {
        id?: string
        resend_message_id?: string | null
        template?: string | null
        to_email?: string
        from_email?: string | null
        subject?: string | null
        lead_id?: string | null
        client_id?: string | null
        agent_id?: string | null
        candidate_id?: string | null
        status?: string
        opened_at?: string | null
        clicked_at?: string | null
        error?: string | null
        unsubscribe_token?: string | null
        metadata?: Json
        created_at?: string
        updated_at?: string
        }
        Relationships: []
      }
      households: {
        Row: {
        id: string
        household_name: string | null
        primary_agent_id: string | null
        primary_contact_id: string | null
        address: Json
        city: string | null
        state: string | null
        zip: string | null
        phone: string | null
        email: string | null
        annual_income: number | null
        notes: string | null
        tags: Json
        metadata: Json
        is_deleted: boolean
        deleted_at: string | null
        created_at: string
        updated_at: string
        }
        Insert: {
        id?: string
        household_name?: string | null
        primary_agent_id?: string | null
        primary_contact_id?: string | null
        address?: Json
        city?: string | null
        state?: string | null
        zip?: string | null
        phone?: string | null
        email?: string | null
        annual_income?: number | null
        notes?: string | null
        tags?: Json
        metadata?: Json
        is_deleted?: boolean
        deleted_at?: string | null
        created_at?: string
        updated_at?: string
        }
        Update: {
        id?: string
        household_name?: string | null
        primary_agent_id?: string | null
        primary_contact_id?: string | null
        address?: Json
        city?: string | null
        state?: string | null
        zip?: string | null
        phone?: string | null
        email?: string | null
        annual_income?: number | null
        notes?: string | null
        tags?: Json
        metadata?: Json
        is_deleted?: boolean
        deleted_at?: string | null
        created_at?: string
        updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
        id: string
        agent_id: string | null
        household_id: string | null
        client_id: string | null
        first_name: string | null
        last_name: string | null
        full_name: string | null
        email: string | null
        phone: string | null
        state: string | null
        timezone: string
        status: string
        source: string
        source_detail: string | null
        product_interest: string | null
        coverage_amount: number | null
        sms_consent: boolean
        sms_consent_at: string | null
        sms_consent_ip: string | null
        sms_consent_language: string | null
        sms_opt_out: boolean
        sms_opt_out_at: string | null
        email_opt_out: boolean
        email_opt_out_at: string | null
        unsubscribe_token: string | null
        do_not_call: boolean
        do_not_call_reason: string | null
        assigned_at: string | null
        last_contacted_at: string | null
        notes: string | null
        tags: Json
        metadata: Json
        is_deleted: boolean
        deleted_at: string | null
        created_at: string
        updated_at: string
        }
        Insert: {
        id?: string
        agent_id?: string | null
        household_id?: string | null
        client_id?: string | null
        first_name?: string | null
        last_name?: string | null
        full_name?: string | null
        email?: string | null
        phone?: string | null
        state?: string | null
        timezone?: string
        status?: string
        source?: string
        source_detail?: string | null
        product_interest?: string | null
        coverage_amount?: number | null
        sms_consent?: boolean
        sms_consent_at?: string | null
        sms_consent_ip?: string | null
        sms_consent_language?: string | null
        sms_opt_out?: boolean
        sms_opt_out_at?: string | null
        email_opt_out?: boolean
        email_opt_out_at?: string | null
        unsubscribe_token?: string | null
        do_not_call?: boolean
        do_not_call_reason?: string | null
        assigned_at?: string | null
        last_contacted_at?: string | null
        notes?: string | null
        tags?: Json
        metadata?: Json
        is_deleted?: boolean
        deleted_at?: string | null
        created_at?: string
        updated_at?: string
        }
        Update: {
        id?: string
        agent_id?: string | null
        household_id?: string | null
        client_id?: string | null
        first_name?: string | null
        last_name?: string | null
        full_name?: string | null
        email?: string | null
        phone?: string | null
        state?: string | null
        timezone?: string
        status?: string
        source?: string
        source_detail?: string | null
        product_interest?: string | null
        coverage_amount?: number | null
        sms_consent?: boolean
        sms_consent_at?: string | null
        sms_consent_ip?: string | null
        sms_consent_language?: string | null
        sms_opt_out?: boolean
        sms_opt_out_at?: string | null
        email_opt_out?: boolean
        email_opt_out_at?: string | null
        unsubscribe_token?: string | null
        do_not_call?: boolean
        do_not_call_reason?: string | null
        assigned_at?: string | null
        last_contacted_at?: string | null
        notes?: string | null
        tags?: Json
        metadata?: Json
        is_deleted?: boolean
        deleted_at?: string | null
        created_at?: string
        updated_at?: string
        }
        Relationships: []
      }
      message_threads: {
        Row: {
        id: string
        subject: string | null
        agent_id: string | null
        client_id: string | null
        lead_id: string | null
        application_id: string | null
        status: string
        last_message_at: string | null
        last_message_preview: string | null
        unread_count_agent: number
        unread_count_client: number
        metadata: Json
        created_at: string
        updated_at: string
        }
        Insert: {
        id?: string
        subject?: string | null
        agent_id?: string | null
        client_id?: string | null
        lead_id?: string | null
        application_id?: string | null
        status?: string
        last_message_at?: string | null
        last_message_preview?: string | null
        unread_count_agent?: number
        unread_count_client?: number
        metadata?: Json
        created_at?: string
        updated_at?: string
        }
        Update: {
        id?: string
        subject?: string | null
        agent_id?: string | null
        client_id?: string | null
        lead_id?: string | null
        application_id?: string | null
        status?: string
        last_message_at?: string | null
        last_message_preview?: string | null
        unread_count_agent?: number
        unread_count_client?: number
        metadata?: Json
        created_at?: string
        updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
        id: string
        thread_id: string
        sender_id: string | null
        sender_role: string
        body: string | null
        attachments: Json
        is_system: boolean
        read_at: string | null
        metadata: Json
        created_at: string
        updated_at: string
        }
        Insert: {
        id?: string
        thread_id: string
        sender_id?: string | null
        sender_role?: string
        body?: string | null
        attachments?: Json
        is_system?: boolean
        read_at?: string | null
        metadata?: Json
        created_at?: string
        updated_at?: string
        }
        Update: {
        id?: string
        thread_id?: string
        sender_id?: string | null
        sender_role?: string
        body?: string | null
        attachments?: Json
        is_system?: boolean
        read_at?: string | null
        metadata?: Json
        created_at?: string
        updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
        id: string
        user_id: string
        type: string
        title: string
        body: string | null
        link: string | null
        is_read: boolean
        read_at: string | null
        channels: Json
        related_entity_type: string | null
        related_entity_id: string | null
        metadata: Json
        created_at: string
        updated_at: string
        }
        Insert: {
        id?: string
        user_id: string
        type: string
        title: string
        body?: string | null
        link?: string | null
        is_read?: boolean
        read_at?: string | null
        channels?: Json
        related_entity_type?: string | null
        related_entity_id?: string | null
        metadata?: Json
        created_at?: string
        updated_at?: string
        }
        Update: {
        id?: string
        user_id?: string
        type?: string
        title?: string
        body?: string | null
        link?: string | null
        is_read?: boolean
        read_at?: string | null
        channels?: Json
        related_entity_type?: string | null
        related_entity_id?: string | null
        metadata?: Json
        created_at?: string
        updated_at?: string
        }
        Relationships: []
      }
      opportunities: {
        Row: {
        id: string
        agent_id: string | null
        household_id: string | null
        lead_id: string | null
        contact_id: string | null
        client_id: string | null
        title: string | null
        stage: string
        product_family: string | null
        coverage_amount: number | null
        estimated_premium: number | null
        estimated_commission: number | null
        probability: number
        expected_close_date: string | null
        actual_close_date: string | null
        lost_reason: string | null
        stage_changed_at: string
        position: number
        notes: string | null
        metadata: Json
        created_at: string
        updated_at: string
        }
        Insert: {
        id?: string
        agent_id?: string | null
        household_id?: string | null
        lead_id?: string | null
        contact_id?: string | null
        client_id?: string | null
        title?: string | null
        stage?: string
        product_family?: string | null
        coverage_amount?: number | null
        estimated_premium?: number | null
        estimated_commission?: number | null
        probability?: number
        expected_close_date?: string | null
        actual_close_date?: string | null
        lost_reason?: string | null
        stage_changed_at?: string
        position?: number
        notes?: string | null
        metadata?: Json
        created_at?: string
        updated_at?: string
        }
        Update: {
        id?: string
        agent_id?: string | null
        household_id?: string | null
        lead_id?: string | null
        contact_id?: string | null
        client_id?: string | null
        title?: string | null
        stage?: string
        product_family?: string | null
        coverage_amount?: number | null
        estimated_premium?: number | null
        estimated_commission?: number | null
        probability?: number
        expected_close_date?: string | null
        actual_close_date?: string | null
        lost_reason?: string | null
        stage_changed_at?: string
        position?: number
        notes?: string | null
        metadata?: Json
        created_at?: string
        updated_at?: string
        }
        Relationships: []
      }
      password_resets: {
        Row: {
        id: string
        user_id: string | null
        email: string
        token: string
        expires_at: string
        used_at: string | null
        ip_address: string | null
        metadata: Json
        created_at: string
        updated_at: string
        }
        Insert: {
        id?: string
        user_id?: string | null
        email: string
        token?: string
        expires_at: string
        used_at?: string | null
        ip_address?: string | null
        metadata?: Json
        created_at?: string
        updated_at?: string
        }
        Update: {
        id?: string
        user_id?: string | null
        email?: string
        token?: string
        expires_at?: string
        used_at?: string | null
        ip_address?: string | null
        metadata?: Json
        created_at?: string
        updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
        id: string
        role: Database["public"]["Enums"]["user_role"]
        email: string | null
        full_name: string | null
        phone: string | null
        avatar_url: string | null
        is_active: boolean
        last_login_at: string | null
        metadata: Json
        created_at: string
        updated_at: string
        }
        Insert: {
        id: string
        role?: Database["public"]["Enums"]["user_role"]
        email?: string | null
        full_name?: string | null
        phone?: string | null
        avatar_url?: string | null
        is_active?: boolean
        last_login_at?: string | null
        metadata?: Json
        created_at?: string
        updated_at?: string
        }
        Update: {
        id?: string
        role?: Database["public"]["Enums"]["user_role"]
        email?: string | null
        full_name?: string | null
        phone?: string | null
        avatar_url?: string | null
        is_active?: boolean
        last_login_at?: string | null
        metadata?: Json
        created_at?: string
        updated_at?: string
        }
        Relationships: []
      }
      quotes: {
        Row: {
        id: string
        lead_id: string | null
        agent_id: string | null
        client_id: string | null
        product_family: string
        input: Json
        results: Json
        compinc_used: string
        carrier_count: number
        lowest_annual_premium: number | null
        best_value_carrier: string | null
        share_token: string | null
        version: number
        parent_quote_id: string | null
        status: string
        quote_email_sent_at: string | null
        reminder_1_sent_at: string | null
        reminder_2_sent_at: string | null
        reminder_3_sent_at: string | null
        viewed_at: string | null
        apply_clicked_at: string | null
        expires_at: string | null
        metadata: Json
        created_at: string
        updated_at: string
        }
        Insert: {
        id?: string
        lead_id?: string | null
        agent_id?: string | null
        client_id?: string | null
        product_family: string
        input?: Json
        results?: Json
        compinc_used?: string
        carrier_count?: number
        lowest_annual_premium?: number | null
        best_value_carrier?: string | null
        share_token?: string | null
        version?: number
        parent_quote_id?: string | null
        status?: string
        quote_email_sent_at?: string | null
        reminder_1_sent_at?: string | null
        reminder_2_sent_at?: string | null
        reminder_3_sent_at?: string | null
        viewed_at?: string | null
        apply_clicked_at?: string | null
        expires_at?: string | null
        metadata?: Json
        created_at?: string
        updated_at?: string
        }
        Update: {
        id?: string
        lead_id?: string | null
        agent_id?: string | null
        client_id?: string | null
        product_family?: string
        input?: Json
        results?: Json
        compinc_used?: string
        carrier_count?: number
        lowest_annual_premium?: number | null
        best_value_carrier?: string | null
        share_token?: string | null
        version?: number
        parent_quote_id?: string | null
        status?: string
        quote_email_sent_at?: string | null
        reminder_1_sent_at?: string | null
        reminder_2_sent_at?: string | null
        reminder_3_sent_at?: string | null
        viewed_at?: string | null
        apply_clicked_at?: string | null
        expires_at?: string | null
        metadata?: Json
        created_at?: string
        updated_at?: string
        }
        Relationships: []
      }
      recruiting_pipeline: {
        Row: {
        id: string
        candidate_id: string
        recruiter_id: string | null
        stage: string
        stage_entered_at: string
        position: number
        expected_start_date: string | null
        source: string | null
        rejection_reason: string | null
        notes: string | null
        activity: Json
        metadata: Json
        created_at: string
        updated_at: string
        }
        Insert: {
        id?: string
        candidate_id: string
        recruiter_id?: string | null
        stage?: string
        stage_entered_at?: string
        position?: number
        expected_start_date?: string | null
        source?: string | null
        rejection_reason?: string | null
        notes?: string | null
        activity?: Json
        metadata?: Json
        created_at?: string
        updated_at?: string
        }
        Update: {
        id?: string
        candidate_id?: string
        recruiter_id?: string | null
        stage?: string
        stage_entered_at?: string
        position?: number
        expected_start_date?: string | null
        source?: string | null
        rejection_reason?: string | null
        notes?: string | null
        activity?: Json
        metadata?: Json
        created_at?: string
        updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
        id: string
        agent_id: string | null
        created_by: string | null
        title: string
        description: string | null
        task_type: string | null
        status: string
        priority: string
        due_at: string | null
        completed_at: string | null
        related_lead_id: string | null
        related_opportunity_id: string | null
        related_application_id: string | null
        related_household_id: string | null
        related_contact_id: string | null
        related_client_id: string | null
        related_candidate_id: string | null
        is_automated: boolean
        metadata: Json
        created_at: string
        updated_at: string
        }
        Insert: {
        id?: string
        agent_id?: string | null
        created_by?: string | null
        title: string
        description?: string | null
        task_type?: string | null
        status?: string
        priority?: string
        due_at?: string | null
        completed_at?: string | null
        related_lead_id?: string | null
        related_opportunity_id?: string | null
        related_application_id?: string | null
        related_household_id?: string | null
        related_contact_id?: string | null
        related_client_id?: string | null
        related_candidate_id?: string | null
        is_automated?: boolean
        metadata?: Json
        created_at?: string
        updated_at?: string
        }
        Update: {
        id?: string
        agent_id?: string | null
        created_by?: string | null
        title?: string
        description?: string | null
        task_type?: string | null
        status?: string
        priority?: string
        due_at?: string | null
        completed_at?: string | null
        related_lead_id?: string | null
        related_opportunity_id?: string | null
        related_application_id?: string | null
        related_household_id?: string | null
        related_contact_id?: string | null
        related_client_id?: string | null
        related_candidate_id?: string | null
        is_automated?: boolean
        metadata?: Json
        created_at?: string
        updated_at?: string
        }
        Relationships: []
      }
      workflow_automations: {
        Row: {
        id: string
        name: string
        description: string | null
        trigger_type: string
        trigger_config: Json
        conditions: Json
        actions: Json
        is_active: boolean
        created_by: string | null
        last_run_at: string | null
        run_count: number
        metadata: Json
        created_at: string
        updated_at: string
        }
        Insert: {
        id?: string
        name: string
        description?: string | null
        trigger_type: string
        trigger_config?: Json
        conditions?: Json
        actions?: Json
        is_active?: boolean
        created_by?: string | null
        last_run_at?: string | null
        run_count?: number
        metadata?: Json
        created_at?: string
        updated_at?: string
        }
        Update: {
        id?: string
        name?: string
        description?: string | null
        trigger_type?: string
        trigger_config?: Json
        conditions?: Json
        actions?: Json
        is_active?: boolean
        created_by?: string | null
        last_run_at?: string | null
        run_count?: number
        metadata?: Json
        created_at?: string
        updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      agent_production_summary: {
        Row: {
        agent_id: string | null
        agent_code: string | null
        lead_count: number | null
        quote_count: number | null
        application_count: number | null
        submitted_applications: number | null
        }
        Relationships: []
      }
      current_month_quote_usage: {
        Row: {
        month: string | null
        quote_count: number | null
        }
        Relationships: []
      }
      lead_funnel_summary: {
        Row: {
        status: string | null
        lead_count: number | null
        }
        Relationships: []
      }
      monthly_quote_count: {
        Row: {
        month: string | null
        quote_count: number | null
        }
        Relationships: []
      }
      opportunity_pipeline_summary: {
        Row: {
        agent_id: string | null
        stage: string | null
        opportunity_count: number | null
        total_coverage: number | null
        total_estimated_commission: number | null
        }
        Relationships: []
      }
      recruiting_pipeline_summary: {
        Row: {
        stage: string | null
        candidate_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: "admin" | "agent" | "client" | "candidate" | "recruiter"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
