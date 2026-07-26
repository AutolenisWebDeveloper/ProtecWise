// ============================================================
// Quote form schemas — public quote input + share/save actions
// ============================================================
import { z } from 'zod';
import {
  zCoverageAmount,
  zDateOfBirth,
  zEmail,
  zGender,
  zPhoneE164,
  zProductFamily,
  zUsState,
  zZip,
} from './common';

/** CompuLife health / risk class buckets. */
export const HEALTH_CLASSES = [
  'preferred_plus',
  'preferred',
  'standard_plus',
  'standard',
] as const;

/** The inputs a consumer supplies to run a quote. */
export const quoteInputSchema = z.object({
  productFamily: zProductFamily,
  dateOfBirth: zDateOfBirth,
  gender: zGender,
  state: zUsState,
  zip: zZip.optional(),
  tobacco: z.boolean().default(false),
  healthClass: z.enum(HEALTH_CLASSES).default('preferred'),
  coverageAmount: zCoverageAmount,
  /** Term length in years (term products only). */
  termLength: z.number().int().min(1).max(40).optional(),
  /** Captured for lead creation + follow-up. */
  email: zEmail.optional(),
  firstName: z.string().trim().max(100).optional(),
  lastName: z.string().trim().max(100).optional(),
  phone: zPhoneE164.optional(),
  /** TCPA consent captured at the point of opt-in (required before any SMS). */
  smsConsent: z.boolean().default(false),
});
export type QuoteInput = z.infer<typeof quoteInputSchema>;

/** Save-quote-by-email action on the results page. */
export const saveQuoteEmailSchema = z.object({
  quoteId: z.string().uuid(),
  email: zEmail,
});
export type SaveQuoteEmailInput = z.infer<typeof saveQuoteEmailSchema>;

/** Record an apply-click from a quote (converts intent → application). */
export const applyClickSchema = z.object({
  quoteId: z.string().uuid(),
  carrierId: z.string().uuid(),
});
export type ApplyClickInput = z.infer<typeof applyClickSchema>;
