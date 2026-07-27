import { describe, it, expect } from 'vitest';
import {
  toCompuLifeStateCode,
  toCompuLifeCategory,
  toCompuLifeParams,
  parseQuoteResults,
  computeBadges,
} from './quote';
import type { QuoteInput } from '@/lib/validations';

describe('CompuLife param mapping', () => {
  it('maps state to the CompuLife numeric code', () => {
    expect(toCompuLifeStateCode('AL')).toBe('1');
    expect(toCompuLifeStateCode('CA')).toBe('5');
    expect(toCompuLifeStateCode('TX')).toBe('44');
    expect(toCompuLifeStateCode('WY')).toBe('51');
  });

  it('maps product family + term to a NewCategory', () => {
    expect(toCompuLifeCategory('level_term', 10)).toBe('3');
    expect(toCompuLifeCategory('level_term', 20)).toBe('5');
    expect(toCompuLifeCategory('level_term', 30)).toBe('7');
    expect(toCompuLifeCategory('level_term')).toBe('5'); // default 20
    expect(toCompuLifeCategory('term_to_100')).toBe('E');
  });

  it('builds the full request params from quote input', () => {
    const input: QuoteInput = {
      productFamily: 'level_term',
      dateOfBirth: '1985-06-15',
      gender: 'M',
      state: 'TX',
      tobacco: false,
      healthClass: 'preferred_plus',
      coverageAmount: 500000,
      termLength: 20,
      smsConsent: false,
    };
    const params = toCompuLifeParams(input, '1,5,9');
    expect(params).toMatchObject({
      BirthYear: '1985',
      BirthMonth: '6',
      Birthday: '15',
      Sex: 'M',
      Smoker: 'N',
      Health: 'PP',
      NewCategory: '5',
      FaceAmount: '500000',
      State: '44',
      COMPINC: '1,5,9',
    });
  });
});

const SAMPLE_RESPONSE = {
  Compulife_ComparisonResults: [
    {
      Compulife_title: '20 Year Level Term',
      Compulife_Results: [
        {
          Compulife_company: 'Alpha Life',
          Compulife_product: 'Term 20',
          Compulife_compprodcode: 'ALPH0020',
          Compulife_ambest: 'A+',
          Compulife_premiumAnnual: '480.00',
          Compulife_premiumM: '42.00',
          Compulife_rgpfpp: 'Preferred Plus',
        },
        {
          Compulife_company: 'Beta Life',
          Compulife_product: 'Term 20',
          Compulife_compprodcode: 'BETA0020',
          Compulife_premiumAnnual: '500.00',
          Compulife_premiumM: '40.00',
        },
        {
          // no annual premium → not a quote row, must be skipped
          Compulife_company: 'Gamma',
          Compulife_compprodcode: 'GAMM0020',
        },
      ],
    },
  ],
};

describe('parseQuoteResults', () => {
  it('flattens result rows and skips rows without an annual premium', () => {
    const rows = parseQuoteResults(SAMPLE_RESPONSE);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      carrierName: 'Alpha Life',
      companyCode: 'ALPH',
      annualPremium: 480,
      monthlyPremium: 42,
    });
  });

  it('returns [] for junk input', () => {
    expect(parseQuoteResults(null)).toEqual([]);
    expect(parseQuoteResults({})).toEqual([]);
  });
});

describe('computeBadges', () => {
  it('flags Best Value (lowest monthly) and Lowest Annual separately', () => {
    const parsed = parseQuoteResults(SAMPLE_RESPONSE);
    const { results, bestValueCode, lowestAnnualCode, lowestAnnualPremium } = computeBadges(parsed);

    // Alpha: annual 480 / monthly 42; Beta: annual 500 / monthly 40.
    expect(lowestAnnualCode).toBe('ALPH0020'); // lowest annual
    expect(bestValueCode).toBe('BETA0020'); // lowest monthly
    expect(lowestAnnualPremium).toBe(480);

    // sorted ascending by annual
    expect(results.map((r) => r.compulifeCode)).toEqual(['ALPH0020', 'BETA0020']);
    expect(results.find((r) => r.compulifeCode === 'ALPH0020')?.isLowestAnnual).toBe(true);
    expect(results.find((r) => r.compulifeCode === 'BETA0020')?.isBestValue).toBe(true);
  });

  it('handles an empty result set', () => {
    expect(computeBadges([])).toMatchObject({ bestValueCode: null, lowestAnnualCode: null });
  });
});
