import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createAdminSupabase } from '@/lib/supabase';
import { QuoteForm } from '@/components/forms/quote-form';
import type { QuoteInput } from '@/lib/validations';

export const metadata: Metadata = { title: 'Modify quote' };
export const dynamic = 'force-dynamic';

export default async function ModifyQuotePage({ params }: { params: { shareToken: string } }) {
  const supabase = createAdminSupabase();
  const { data: quote } = await supabase
    .from('quotes')
    .select('input')
    .eq('share_token', params.shareToken)
    .maybeSingle();

  if (!quote) notFound();

  const input = (quote.input ?? {}) as unknown as QuoteInput;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
      <div className="text-center">
        <h1 className="text-h1">Adjust your quote</h1>
        <p className="mt-3 text-body text-[var(--pw-muted)]">
          Change anything below and we&rsquo;ll re-run the numbers with your carriers.
        </p>
      </div>
      <div className="mt-10 rounded-2xl border border-[var(--pw-border)] bg-white p-6 sm:p-8">
        <QuoteForm defaults={input} />
      </div>
    </div>
  );
}
