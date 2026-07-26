// ============================================================
// Contact form schema (public marketing site)
// ============================================================
import { z } from 'zod';
import { zEmail, zNonEmpty, zPhoneE164, zUsState } from './common';

export const CONTACT_TOPICS = [
  'Get a quote',
  'Question about coverage',
  'Help with my application',
  'Something else',
] as const;

export const contactFormSchema = z.object({
  name: zNonEmpty('Name').max(120),
  email: zEmail,
  phone: zPhoneE164.optional().or(z.literal('')),
  state: zUsState.optional(),
  topic: z.enum(CONTACT_TOPICS).default('Get a quote'),
  message: z.string().trim().min(10, 'Tell us a little more (at least 10 characters).').max(2000),
});
export type ContactFormInput = z.infer<typeof contactFormSchema>;
