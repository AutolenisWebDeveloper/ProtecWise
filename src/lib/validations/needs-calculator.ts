// ============================================================
// Insurance needs calculator schema (Session 8 uses this)
// ============================================================
import { z } from 'zod';
import { zEmail } from './common';

const nonNegative = z.number().min(0).max(1_000_000_000);

export const needsCalculatorSchema = z.object({
  annualIncome: nonNegative,
  incomeReplacementYears: z.union([
    z.literal(10),
    z.literal(15),
    z.literal(20),
    z.literal(25),
    z.literal(30),
  ]),
  mortgageBalance: nonNegative.default(0),
  otherDebts: nonNegative.default(0),
  finalExpenses: nonNegative.default(15_000),
  existingCoverage: nonNegative.default(0),
  savings: nonNegative.default(0),
  educationFund: nonNegative.default(0),
  spouseIncomeReplacementYears: z.number().min(0).max(30).default(0),
  youngestChildAge: z.number().int().min(0).max(30).optional(),
  mortgageYearsRemaining: z.number().int().min(0).max(40).optional(),
  /** Optional — links the saved result to a lead. */
  email: zEmail.optional(),
});
export type NeedsCalculatorInput = z.infer<typeof needsCalculatorSchema>;
