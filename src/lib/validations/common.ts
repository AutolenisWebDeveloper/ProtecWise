// ============================================================
// Shared Zod primitives used across every ProtecWise form schema
// ============================================================
import { z } from 'zod';

/** 50 states + DC — matches the 2-letter codes stored in carrier_state_rules. */
export const US_STATE_CODES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL',
  'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME',
  'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH',
  'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI',
  'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
] as const;

export const PRODUCT_FAMILIES = [
  'level_term',
  'decreasing_term',
  'term_to_100',
  'whole_life',
  'universal_life',
] as const;

export const zEmail = z.string().trim().toLowerCase().email('Enter a valid email address.');

/** E.164 format (e.g. +12145550123) — required for Twilio + TCPA records. */
export const zPhoneE164 = z
  .string()
  .regex(/^\+[1-9]\d{7,14}$/, 'Enter a valid phone number.');

export const zUsState = z.enum(US_STATE_CODES, {
  errorMap: () => ({ message: 'Select a valid US state.' }),
});

export const zProductFamily = z.enum(PRODUCT_FAMILIES);

export const zUuid = z.string().uuid();

export const zNonEmpty = (label: string) => z.string().trim().min(1, `${label} is required.`);

/** Coverage / face amount — positive dollars up to $25M. */
export const zCoverageAmount = z
  .number()
  .int()
  .positive('Coverage must be greater than $0.')
  .max(25_000_000, 'Coverage exceeds the maximum of $25,000,000.');

export const zGender = z.enum(['M', 'F']);

/** ISO date string (YYYY-MM-DD) that is a real, past date. */
export const zDateOfBirth = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid date of birth.')
  .refine((v) => {
    const d = new Date(v);
    return !Number.isNaN(d.getTime()) && d < new Date();
  }, 'Date of birth must be in the past.');

export const zZip = z.string().regex(/^\d{5}(-\d{4})?$/, 'Enter a valid ZIP code.');
