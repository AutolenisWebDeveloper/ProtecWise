// ============================================================
// Quote engine helpers — CompuLife request mapping + result parsing
// ============================================================
// Pure functions (no I/O) so they can be unit-tested without the live proxy.
// The CompuLife codes below come from the official sample quoter; the term
// categories + state numerics are exact. Permanent-product categories are
// best-effort and should be confirmed against CompuLife's CategoryList during
// live integration.

import { US_STATE_CODES } from '@/lib/validations/common';
import type { ProductFamily } from '@/types';
import type { QuoteInput } from '@/lib/validations';

// ---- Code maps ------------------------------------------------------------

/** Health class → CompuLife `Health` code. */
const HEALTH_CODE: Record<QuoteInput['healthClass'], string> = {
  preferred_plus: 'PP',
  preferred: 'P',
  standard_plus: 'RP', // Regular Plus
  standard: 'R', // Regular
};

/** Level-term length (years) → CompuLife `NewCategory` code. */
const TERM_CATEGORY: Record<number, string> = {
  1: '1',
  5: '2',
  10: '3',
  15: '4',
  20: '5',
  25: '6',
  30: '7',
  35: '9',
  40: '0',
};

/** CompuLife numeric state code — alphabetical with DC after DE, 1-indexed. */
export function toCompuLifeStateCode(state: string): string {
  const idx = US_STATE_CODES.indexOf(state as (typeof US_STATE_CODES)[number]);
  return idx >= 0 ? String(idx + 1) : '';
}

/**
 * Product family (+ term length) → CompuLife `NewCategory`.
 * Term is exact; permanent families use the nearest documented category and
 * should be verified against CategoryList when the proxy is live.
 */
export function toCompuLifeCategory(family: ProductFamily, termLength?: number): string {
  switch (family) {
    case 'level_term':
    case 'decreasing_term':
      return TERM_CATEGORY[termLength ?? 20] ?? '5'; // default 20-year
    case 'term_to_100':
      return 'E'; // To Age 100 Level
    case 'universal_life':
      return '8'; // To Age 121 Level (No Lapse U/L)
    case 'whole_life':
      return 'E'; // best-effort permanent; confirm vs CategoryList
    default:
      return '5';
  }
}

/** Build the CompuLife `request` params from validated quote input + COMPINC. */
export function toCompuLifeParams(
  input: QuoteInput,
  compinc: string,
): Record<string, string> {
  const [year, month, day] = input.dateOfBirth.split('-');
  return {
    BirthYear: year,
    BirthMonth: String(Number(month)),
    Birthday: String(Number(day)),
    Sex: input.gender,
    Smoker: input.tobacco ? 'Y' : 'N',
    Health: HEALTH_CODE[input.healthClass],
    NewCategory: toCompuLifeCategory(input.productFamily, input.termLength),
    FaceAmount: String(input.coverageAmount),
    State: toCompuLifeStateCode(input.state),
    ZipCode: input.zip ?? '',
    ErrOnMissingZipCode: 'OFF',
    ModeUsed: 'M', // returns monthly + annual
    CompRating: '4',
    SortOverride1: 'A', // ascending by annual premium
    COMPINC: compinc,
  };
}

// ---- Result parsing -------------------------------------------------------

export interface QuoteResult {
  /** CompuLife company+product code (e.g. "ABCD1234"). */
  compulifeCode: string;
  /** First 4 chars — the logo lookup key. */
  companyCode: string;
  carrierName: string;
  productName: string;
  amBest: string | null;
  monthlyPremium: number | null;
  annualPremium: number;
  healthClass: string | null;
  isBestValue: boolean;
  isLowestAnnual: boolean;
}

/** Parse a numeric premium that may arrive as "1,234.56", "$1234", or a number. */
function toNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const n = parseFloat(value.replace(/[$,\s]/g, ''));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function str(value: unknown): string {
  return typeof value === 'string' ? value : value == null ? '' : String(value);
}

/**
 * Parse a CompuLife `request` response into flat quote rows. Tolerates the
 * response being a single comparison group or an array of groups.
 */
export function parseQuoteResults(payload: unknown): QuoteResult[] {
  if (!payload || typeof payload !== 'object') return [];
  const root = payload as Record<string, unknown>;

  const groups: unknown[] = Array.isArray(root.Compulife_ComparisonResults)
    ? root.Compulife_ComparisonResults
    : Array.isArray(root.Compulife_Results)
      ? [root]
      : [];

  const out: QuoteResult[] = [];
  for (const group of groups) {
    if (!group || typeof group !== 'object') continue;
    const rows = (group as Record<string, unknown>).Compulife_Results;
    if (!Array.isArray(rows)) continue;

    for (const raw of rows) {
      if (!raw || typeof raw !== 'object') continue;
      const row = raw as Record<string, unknown>;
      const annual = toNumber(row.Compulife_premiumAnnual);
      if (annual === null) continue; // a row with no annual premium isn't a quote

      const code = str(row.Compulife_compprodcode);
      out.push({
        compulifeCode: code,
        companyCode: code.slice(0, 4),
        carrierName: str(row.Compulife_company),
        productName: str(row.Compulife_product),
        amBest: str(row.Compulife_ambest) || null,
        monthlyPremium: toNumber(row.Compulife_premiumM),
        annualPremium: annual,
        healthClass: str(row.Compulife_rgpfpp) || null,
        isBestValue: false,
        isLowestAnnual: false,
      });
    }
  }
  return out;
}

export interface BadgedQuote {
  results: QuoteResult[];
  /** compulifeCode of the best-value (lowest monthly) row, if any. */
  bestValueCode: string | null;
  /** compulifeCode of the lowest-annual row, if any. */
  lowestAnnualCode: string | null;
  lowestAnnualPremium: number | null;
}

/**
 * Flag the Best Value (lowest monthly premium, falling back to annual) and the
 * Lowest Annual row. Returns results sorted ascending by annual premium.
 */
export function computeBadges(results: QuoteResult[]): BadgedQuote {
  if (results.length === 0) {
    return { results: [], bestValueCode: null, lowestAnnualCode: null, lowestAnnualPremium: null };
  }

  const sorted = [...results].sort((a, b) => a.annualPremium - b.annualPremium);

  const monthlyOf = (r: QuoteResult) => r.monthlyPremium ?? r.annualPremium / 12;

  let bestValue = sorted[0];
  let lowestAnnual = sorted[0];
  for (const r of sorted) {
    if (monthlyOf(r) < monthlyOf(bestValue)) bestValue = r;
    if (r.annualPremium < lowestAnnual.annualPremium) lowestAnnual = r;
  }

  for (const r of sorted) {
    r.isBestValue = r.compulifeCode === bestValue.compulifeCode;
    r.isLowestAnnual = r.compulifeCode === lowestAnnual.compulifeCode;
  }

  return {
    results: sorted,
    bestValueCode: bestValue.compulifeCode,
    lowestAnnualCode: lowestAnnual.compulifeCode,
    lowestAnnualPremium: lowestAnnual.annualPremium,
  };
}
