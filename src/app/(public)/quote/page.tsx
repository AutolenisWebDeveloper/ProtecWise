import type { Metadata } from 'next';
import { QuoteForm } from '@/components/forms/quote-form';
import { PRODUCT_FAMILIES } from '@/lib/validations';
import type { QuoteInput } from '@/lib/validations';
import type { ProductFamily } from '@/types';

export const metadata: Metadata = {
  title: 'Your quote',
  description: 'Tell us a little about yourself to compare real life insurance quotes.',
};

export default function QuotePage({
  searchParams,
}: {
  searchParams: { product?: string; coverage?: string };
}) {
  const defaults: Partial<QuoteInput> = {};

  if (
    searchParams.product &&
    (PRODUCT_FAMILIES as readonly string[]).includes(searchParams.product)
  ) {
    defaults.productFamily = searchParams.product as ProductFamily;
  }
  const coverage = Number(searchParams.coverage);
  if (Number.isFinite(coverage) && coverage > 0) {
    defaults.coverageAmount = Math.round(coverage);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <h1 className="text-h1">Let&rsquo;s find your rate</h1>
        <p className="mt-3 text-body text-[var(--pw-muted)]">
          A few quick questions — no account needed, and comparing is always free.
        </p>
      </div>
      <div className="mt-10 rounded-2xl border border-[var(--pw-border)] bg-white p-6 sm:p-8">
        <QuoteForm defaults={defaults} />
      </div>
    </div>
  );
}
