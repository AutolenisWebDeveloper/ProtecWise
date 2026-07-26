// ============================================================
// Auth form schemas — agent/admin login+register, password reset, magic link
// ============================================================
import { z } from 'zod';
import { zEmail, zNonEmpty, zPhoneE164 } from './common';

const zPassword = z
  .string()
  .min(8, 'Password must be at least 8 characters.')
  .max(72, 'Password must be 72 characters or fewer.');

/** Agent/admin email + password login. */
export const loginSchema = z.object({
  email: zEmail,
  password: zNonEmpty('Password'),
});
export type LoginInput = z.infer<typeof loginSchema>;

/** New agent self-registration. */
export const registerSchema = z
  .object({
    firstName: zNonEmpty('First name'),
    lastName: zNonEmpty('Last name'),
    email: zEmail,
    phone: zPhoneE164,
    password: zPassword,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });
export type RegisterInput = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({ email: zEmail });
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    token: zNonEmpty('Token'),
    password: zPassword,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

/** Client magic-link request (email only — clients never use a password). */
export const magicLinkSchema = z.object({ email: zEmail });
export type MagicLinkInput = z.infer<typeof magicLinkSchema>;

/** Candidate portal registration (email + password). */
export const candidateRegisterSchema = z
  .object({
    firstName: zNonEmpty('First name'),
    lastName: zNonEmpty('Last name'),
    email: zEmail,
    phone: zPhoneE164,
    password: zPassword,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });
export type CandidateRegisterInput = z.infer<typeof candidateRegisterSchema>;
