import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createAdminSupabase } from '@/lib/supabase';
import { QuoteResults } from '@/components/quote/quote-results';
import type { QuoteResult } from '@/lib/quote';
import type { QuoteInput } from '@/lib/validations';

export const metadata: Metadata = { title: 'Shared quote' };
export const dynamic = 'force-dynamic';

export default async function SharedQuotePage({ params }: { params: { shareToken: string } }) {
  const supabase = createAdminSupabase();
  const { data: quote } = await supabase
    .from('quotes')
    .select('id, share_token, results, input, viewed_at')
    .eq('share_token', params.shareToken)
    .maybeSingle();

  if (!quote) notFound();

  // Stamp first view (feeds the quote-reminder sequence).
  if (!quote.viewed_at) {
    await supabase.from('quotes').update({ viewed_at: new Date().toISOString() }).eq('id', quote.id);
  }

  const results = (quote.results ?? []) as unknown as QuoteResult[];
  const input = (quote.input ?? {}) as unknown as QuoteInput;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-h1">A shared quote</h1>
      <p className="mt-2 text-body text-[var(--pw-muted)]">
        Here&rsquo;s a life insurance comparison someone shared with you.{' '}
        <Link href={`/quote/view/${quote.share_token}/modify`} className="text-brand-navy underline">
          Adjust the details
        </Link>{' '}
        to see how the numbers change.
      </p>
      <div className="mt-8">
        <QuoteResults
          quoteId={quote.id}
          shareToken={quote.share_token ?? ''}
          results={results}
          coverageAmount={input.coverageAmount ?? 0}
          readOnly
        />
      </div>
    </div>
  );
}
