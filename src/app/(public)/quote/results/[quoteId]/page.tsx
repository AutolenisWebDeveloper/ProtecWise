import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createAdminSupabase } from '@/lib/supabase';
import { QuoteResults } from '@/components/quote/quote-results';
import type { QuoteResult } from '@/lib/quote';
import type { QuoteInput } from '@/lib/validations';

export const metadata: Metadata = { title: 'Your quotes' };
export const dynamic = 'force-dynamic';

export default async function QuoteResultsPage({ params }: { params: { quoteId: string } }) {
  const supabase = createAdminSupabase();
  const { data: quote } = await supabase
    .from('quotes')
    .select('id, share_token, results, input')
    .eq('id', params.quoteId)
    .maybeSingle();

  if (!quote) notFound();

  const results = (quote.results ?? []) as unknown as QuoteResult[];
  const input = (quote.input ?? {}) as unknown as QuoteInput;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-h1">Your quotes</h1>
      <p className="mt-2 text-body text-[var(--pw-muted)]">
        Compared live from top-rated carriers. Sorted by annual cost, lowest first.
      </p>
      <div className="mt-8">
        <QuoteResults
          quoteId={quote.id}
          shareToken={quote.share_token ?? ''}
          results={results}
          coverageAmount={input.coverageAmount ?? 0}
        />
      </div>
    </div>
  );
}
