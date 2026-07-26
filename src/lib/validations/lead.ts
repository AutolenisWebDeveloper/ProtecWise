// ============================================================
// Lead + contact schemas
// ============================================================
import { z } from 'zod';
import { zEmail, zNonEmpty, zPhoneE164, zUsState } from './common';

export const LEAD_SOURCES = [
  'website',
  'referral',
  'quote',
  'needs_calculator',
  'recruiting',
  'import',
  'manual',
  'campaign',
] as const;

export const LEAD_STATUSES = [
  'new',
  'contacted',
  'quoted',
  'application_started',
  'application_submitted',
  'won',
  'lost',
  'nurturing',
] as const;

/** Create / capture a lead (server routes upsert by email). */
export const createLeadSchema = z.object({
  firstName: z.string().trim().max(100).optional(),
  lastName: z.string().trim().max(100).optional(),
  fullName: z.string().trim().max(200).optional(),
  email: zEmail.optional(),
  phone: zPhoneE164.optional(),
  state: zUsState.optional(),
  source: z.enum(LEAD_SOURCES).default('website'),
  sourceDetail: z.string().trim().max(200).optional(),
  productInterest: z.string().trim().max(100).optional(),
  coverageAmount: z.number().int().positive().max(25_000_000).optional(),
  smsConsent: z.boolean().default(false),
  smsConsentLanguage: z.string().optional(),
});
export type CreateLeadInput = z.infer<typeof createLeadSchema>;

/** Agent-side lead update (status transitions, assignment, notes). */
export const updateLeadSchema = z.object({
  status: z.enum(LEAD_STATUSES).optional(),
  agentId: z.string().uuid().optional(),
  notes: z.string().max(5000).optional(),
  doNotCall: z.boolean().optional(),
  doNotCallReason: z.string().max(500).optional(),
});
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;

/** Household contact record. */
export const contactSchema = z.object({
  householdId: z.string().uuid(),
  firstName: zNonEmpty('First name'),
  lastName: zNonEmpty('Last name'),
  email: zEmail.optional(),
  phone: zPhoneE164.optional(),
  relationship: z.enum(['self', 'spouse', 'child', 'parent', 'other']).default('self'),
  isPrimary: z.boolean().default(false),
});
export type ContactInput = z.infer<typeof contactSchema>;
