// ============================================================
// ProtecWise shared domain types
// Built on the generated Supabase types (./supabase.ts).
// ============================================================
import type { Database } from './supabase';

type Tables = Database['public']['Tables'];
type Views = Database['public']['Views'];

export type Row<T extends keyof Tables> = Tables[T]['Row'];
export type Insert<T extends keyof Tables> = Tables[T]['Insert'];
export type Update<T extends keyof Tables> = Tables[T]['Update'];

// Enums
export type UserRole = Database['public']['Enums']['user_role'];

// ---- Table row aliases ----
export type Profile = Row<'profiles'>;
export type Agent = Row<'agents'>;
export type Client = Row<'clients'>;
export type Candidate = Row<'candidates'>;
export type Household = Row<'households'>;
export type Contact = Row<'contacts'>;
export type Carrier = Row<'carriers'>;
export type CarrierProductRule = Row<'carrier_product_rules'>;
export type CarrierStateRule = Row<'carrier_state_rules'>;
export type AgentCarrierPermission = Row<'agent_carrier_permissions'>;
export type AgentCarrierPreference = Row<'agent_carrier_preferences'>;
export type Lead = Row<'leads'>;
export type Opportunity = Row<'opportunities'>;
export type Quote = Row<'quotes'>;
export type Application = Row<'applications'>;
export type DocumentRecord = Row<'documents'>;
export type Task = Row<'tasks'>;
export type CalendarEvent = Row<'calendar_events'>;
export type MessageThread = Row<'message_threads'>;
export type Message = Row<'messages'>;
export type Commission = Row<'commissions'>;
export type ComplianceRecord = Row<'compliance_records'>;
export type RecruitingPipeline = Row<'recruiting_pipeline'>;
export type WorkflowAutomation = Row<'workflow_automations'>;
export type Notification = Row<'notifications'>;
export type ActivityLog = Row<'activity_log'>;
export type EmailLog = Row<'email_log'>;
export type ClientAuthToken = Row<'client_auth_tokens'>;
export type PasswordReset = Row<'password_resets'>;

// ---- Insert aliases (commonly used in API routes) ----
export type LeadInsert = Insert<'leads'>;
export type QuoteInsert = Insert<'quotes'>;
export type ApplicationInsert = Insert<'applications'>;
export type OpportunityInsert = Insert<'opportunities'>;

// ---- View row aliases ----
export type MonthlyQuoteCount = Views['monthly_quote_count']['Row'];
export type CurrentMonthQuoteUsage = Views['current_month_quote_usage']['Row'];
export type AgentProductionSummary = Views['agent_production_summary']['Row'];

// ---- Product families (mirror the SQL CHECK constraints) ----
export type ProductFamily =
  | 'level_term'
  | 'decreasing_term'
  | 'term_to_100'
  | 'whole_life'
  | 'universal_life';

// ---- Shared value objects ----
export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
}

// ---- JSONB shapes for application intake steps ----
// applications.step_2_personal_info
export interface PersonalInfoStep {
  legal_first_name: string;
  legal_middle_name?: string;
  legal_last_name: string;
  date_of_birth: string; // ISO date
  gender: 'M' | 'F';
  marital_status: 'single' | 'married' | 'divorced' | 'widowed';
  ssn_last_four_encrypted?: string;
  phone: string; // E.164
  email: string;
  current_address: Address;
  mailing_address?: Address;
  citizenship: 'us_citizen' | 'permanent_resident' | 'other';
  drivers_license_number?: string;
  drivers_license_state?: string;
}

// applications.step_7_disclosures (e-signature legal capture)
export interface DisclosuresStep {
  privacy_accepted: boolean;
  privacy_accepted_at?: string;
  privacy_accepted_ip?: string;
  hipaa_accepted: boolean;
  hipaa_accepted_at?: string;
  hipaa_accepted_ip?: string;
  hipaa_authorization_text?: string;
  econsent_accepted: boolean;
  accuracy_accepted: boolean;
  replacement_accepted?: boolean;
  signature_name?: string;
  signature_timestamp?: string;
  signature_ip?: string;
  signature_user_agent?: string;
}
