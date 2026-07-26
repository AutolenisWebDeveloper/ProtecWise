// ============================================================
// Product catalog — drives the homepage grid and product pages.
// Content only (no PII, no carrier data). ProductFamily maps to the
// quote engine's families and the DB CHECK constraints.
// ============================================================
import type { ProductFamily } from '@/types';

export interface ProductFaq {
  q: string;
  a: string;
}

export interface Product {
  /** URL slug under /products/[slug]. */
  slug: string;
  /** Quote-engine family (matches product_family in the schema). */
  family: ProductFamily;
  /** 'term' = temporary coverage, 'permanent' = lifelong + cash value. */
  category: 'term' | 'permanent';
  name: string;
  /** One-line positioning. */
  tagline: string;
  /** Short summary for cards and meta descriptions. */
  summary: string;
  /** Longer explanation paragraphs for the product page. */
  body: string[];
  /** "Best for" bullets. */
  bestFor: string[];
  /** Quick-fact chips (label + value). */
  facts: { label: string; value: string }[];
  /** Advantages. */
  benefits: string[];
  /** Honest trade-offs — trust is built by not overselling. */
  considerations: string[];
  faqs: ProductFaq[];
}

export const PRODUCTS: Product[] = [
  {
    slug: 'term-life',
    family: 'level_term',
    category: 'term',
    name: 'Term life',
    tagline: 'The most coverage for the least cost.',
    summary:
      'Level premiums and a fixed death benefit for a set term — 10 to 30 years. The straightforward way to protect your family through the years that matter most.',
    body: [
      'Term life covers you for a specific period — commonly 10, 15, 20, or 30 years. If you pass away during the term, your beneficiaries receive the full death benefit, income-tax-free. If you outlive the term, the coverage ends.',
      'Because it has no cash-value component, term life delivers the largest death benefit per dollar. A healthy 35-year-old can often cover $500,000 for the price of a couple of streaming subscriptions a month.',
      'Most families choose a term that lasts until the mortgage is paid and the kids are independent — the window where a lost income would hurt the most.',
    ],
    bestFor: [
      'Replacing income during your working years',
      'Covering a mortgage or other large debts',
      'Protecting young families on a budget',
    ],
    facts: [
      { label: 'Term lengths', value: '10 – 30 yrs' },
      { label: 'Coverage', value: '$50k – $10M+' },
      { label: 'Cash value', value: 'None' },
      { label: 'Premiums', value: 'Level, fixed' },
    ],
    benefits: [
      'Lowest cost per dollar of coverage',
      'Premiums locked for the whole term',
      'Simple to understand — no moving parts',
      'Many policies convert to permanent coverage later',
    ],
    considerations: [
      'Coverage ends when the term does',
      'Renewing at an older age costs significantly more',
      'Builds no cash value',
    ],
    faqs: [
      {
        q: 'What happens when the term ends?',
        a: 'Coverage stops. Many term policies include a conversion option that lets you switch to a permanent policy without a new medical exam — ask your advisor whether yours does.',
      },
      {
        q: 'How much coverage do I need?',
        a: 'A common starting point is 10–15× your annual income, plus debts and future goals like college. Our needs calculator gives you a personalized number in about two minutes.',
      },
      {
        q: 'Do I need a medical exam?',
        a: 'It depends on your age, health, and the coverage amount. Some carriers offer no-exam options up to certain limits. We help you find the fastest path you qualify for.',
      },
    ],
  },
  {
    slug: 'decreasing-term',
    family: 'decreasing_term',
    category: 'term',
    name: 'Decreasing term',
    tagline: 'Coverage that follows your mortgage down.',
    summary:
      'A death benefit that declines on a set schedule, designed to track a shrinking debt like a mortgage. Lower cost, aimed at one specific liability.',
    body: [
      'With decreasing term, the death benefit steps down over the life of the policy — usually to mirror the balance of a mortgage or other amortizing loan. Premiums typically stay level while the payout declines.',
      'The idea is simple: as you pay down what you owe, you need less coverage to pay it off. Pairing the two keeps your premium low and focused on a single, well-defined liability.',
      'Many people cover their mortgage this way and hold a separate level-term policy for income replacement and everything else.',
    ],
    bestFor: [
      'Covering a mortgage or amortizing loan',
      'Buyers who want the lowest possible premium',
      'Layering alongside a level-term policy',
    ],
    facts: [
      { label: 'Term lengths', value: '10 – 30 yrs' },
      { label: 'Death benefit', value: 'Declines' },
      { label: 'Cash value', value: 'None' },
      { label: 'Premiums', value: 'Level' },
    ],
    benefits: [
      'Lower premiums than level term',
      'Aligns coverage with a shrinking debt',
      'Straightforward, single-purpose protection',
    ],
    considerations: [
      'The payout shrinks over time',
      'Not ideal as your only life insurance',
      'Death benefit may not match your loan exactly',
    ],
    faqs: [
      {
        q: 'How is this different from level term?',
        a: 'Level term keeps the same death benefit for the whole term. Decreasing term lowers the benefit on a schedule, which is why it costs less — it is built to cover a debt that is going down.',
      },
      {
        q: 'Should this be my only policy?',
        a: 'Usually not. It is great for a mortgage, but income replacement and final expenses stay constant, so most families pair it with a level-term policy.',
      },
    ],
  },
  {
    slug: 'term-to-100',
    family: 'term_to_100',
    category: 'permanent',
    name: 'Term to 100',
    tagline: 'Lifelong coverage without the extras.',
    summary:
      'Permanent protection to age 100 with level premiums and no cash-value account — a lower-cost way to guarantee a death benefit for life.',
    body: [
      'Term to 100 is permanent coverage stripped to its essentials. The premium is level and the death benefit is guaranteed to age 100 (and often beyond), but there is little or no cash value building inside the policy.',
      'That trade — dropping the savings component — makes it more affordable than whole life while still guaranteeing a payout no matter when you pass away.',
      'It suits people who want a benefit that never expires, primarily for final expenses or leaving a legacy, without paying for a cash-value feature they do not plan to use.',
    ],
    bestFor: [
      'Guaranteed final-expense and legacy coverage',
      'Lifelong protection at a lower cost than whole life',
      'People who do not need cash value',
    ],
    facts: [
      { label: 'Coverage', value: 'To age 100+' },
      { label: 'Premiums', value: 'Level, guaranteed' },
      { label: 'Cash value', value: 'Little / none' },
      { label: 'Payout', value: 'Guaranteed' },
    ],
    benefits: [
      'Death benefit guaranteed for life',
      'Costs less than whole life',
      'Level premiums that never increase',
    ],
    considerations: [
      'Builds little or no cash value',
      'No savings to borrow against',
      'Missing payments can end the coverage',
    ],
    faqs: [
      {
        q: 'Is Term to 100 really permanent?',
        a: 'Yes. Unlike level term, it does not expire after a set number of years — the guaranteed death benefit continues to age 100 and typically beyond, as long as premiums are paid.',
      },
      {
        q: 'Why is it cheaper than whole life?',
        a: 'It removes the cash-value savings component. You get the lifelong guarantee without paying for the accumulation feature.',
      },
    ],
  },
  {
    slug: 'whole-life',
    family: 'whole_life',
    category: 'permanent',
    name: 'Whole life',
    tagline: 'Guarantees for life, with cash value.',
    summary:
      'Permanent coverage with fixed premiums, a guaranteed death benefit, and cash value that grows on a guaranteed schedule you can borrow against.',
    body: [
      'Whole life is the classic permanent policy. Your premium never changes, the death benefit is guaranteed, and a portion of every payment builds cash value that grows tax-deferred at a guaranteed rate.',
      'Over time that cash value becomes an asset. You can borrow against it for emergencies, opportunities, or retirement income — though outstanding loans reduce the death benefit until repaid. Some policies from mutual carriers also pay dividends.',
      'It costs more than term for the same death benefit, because you are funding both lifelong protection and a savings component. For people who value certainty and want coverage that never expires, that predictability is the point.',
    ],
    bestFor: [
      'Lifelong protection and estate planning',
      'People who value guarantees and predictability',
      'Building tax-deferred cash value over decades',
    ],
    facts: [
      { label: 'Coverage', value: 'Lifetime' },
      { label: 'Premiums', value: 'Fixed for life' },
      { label: 'Cash value', value: 'Guaranteed growth' },
      { label: 'Dividends', value: 'Possible*' },
    ],
    benefits: [
      'Guaranteed death benefit that never expires',
      'Cash value grows tax-deferred, guaranteed',
      'Borrow against the cash value when you need it',
      'Premiums locked in at issue',
    ],
    considerations: [
      'Higher premiums than term coverage',
      'Cash value grows slowly in the early years',
      'Policy loans reduce the death benefit until repaid',
    ],
    faqs: [
      {
        q: 'Can I access the cash value?',
        a: 'Yes — through policy loans or withdrawals. Loans accrue interest and reduce the death benefit until repaid, so we walk through the trade-offs before you borrow.',
      },
      {
        q: 'What are dividends?',
        a: 'Some mutual carriers share profits with policyholders as dividends, which can buy more coverage or reduce premiums. Dividends are not guaranteed.',
      },
    ],
  },
  {
    slug: 'universal-life',
    family: 'universal_life',
    category: 'permanent',
    name: 'Universal life',
    tagline: 'Permanent coverage you can adjust.',
    summary:
      'Flexible permanent insurance that lets you adjust premiums and death benefit over time, with cash value tied to interest crediting.',
    body: [
      'Universal life is permanent coverage built for flexibility. Within limits, you can raise or lower your premium and adjust the death benefit as your life changes — helpful when income or obligations shift over the decades.',
      'Cash value accumulates based on an interest rate the carrier credits (some designs tie crediting to a market index with a floor and cap). The cost of insurance is deducted from the account each month, so funding the policy well is important to keeping it in force.',
      'It rewards engagement: managed thoughtfully, universal life offers lifelong protection with room to adapt. Left underfunded, the rising cost of insurance can erode the cash value, so it works best with a plan and periodic reviews.',
    ],
    bestFor: [
      'People who want to adjust coverage over time',
      'Lifelong protection with premium flexibility',
      'Longer-term, actively managed planning',
    ],
    facts: [
      { label: 'Coverage', value: 'Lifetime' },
      { label: 'Premiums', value: 'Flexible' },
      { label: 'Death benefit', value: 'Adjustable' },
      { label: 'Cash value', value: 'Interest-credited' },
    ],
    benefits: [
      'Adjust premiums and death benefit within limits',
      'Lifelong coverage with cash-value growth',
      'Can use accumulated value toward future premiums',
    ],
    considerations: [
      'Requires monitoring to stay properly funded',
      'Crediting rates can change over time',
      'Underfunding can cause the policy to lapse',
    ],
    faqs: [
      {
        q: 'What does "flexible premium" actually mean?',
        a: 'You can pay more or less within limits, using cash value to cover premiums in lean months. The trade-off is that the policy needs enough funding to cover the rising cost of insurance as you age.',
      },
      {
        q: 'How is cash value credited?',
        a: 'It depends on the design. Traditional universal life credits a declared interest rate; indexed designs tie crediting to a market index with a floor (downside protection) and a cap. We explain exactly how your policy works before you apply.',
      },
    ],
  },
];

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}
