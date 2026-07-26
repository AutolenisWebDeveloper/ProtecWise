'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Share2 } from 'lucide-react';
import { Premium } from './premium';
import type { QuoteResult } from '@/lib/quote';
import { cn } from '@/lib/utils';

interface QuoteResultsProps {
  quoteId: string;
  shareToken: string;
  results: QuoteResult[];
  coverageAmount: number;
  /** Read-only shared view — hides apply + save actions. */
  readOnly?: boolean;
}

export function QuoteResults({
  quoteId,
  shareToken,
  results,
  coverageAmount,
  readOnly = false,
}: QuoteResultsProps) {
  const [copied, setCopied] = useState(false);
  const [applyingCode, setApplyingCode] = useState<string | null>(null);

  async function copyShare() {
    const url = `${window.location.origin}/quote/view/${shareToken}`;
    await navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function apply(carrierCode: string) {
    setApplyingCode(carrierCode);
    try {
      const res = await fetch('/api/quote/apply-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quoteId, carrierCode }),
      });
      const data = (await res.json().catch(() => ({}))) as { data?: { next?: string } };
      window.location.href = data.data?.next ?? '/contact';
    } catch {
      setApplyingCode(null);
    }
  }

  if (results.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--pw-border)] bg-white p-10 text-center">
        <h2 className="text-h3">No quotes matched this profile</h2>
        <p className="mt-2 text-body text-[var(--pw-muted)]">
          Try adjusting your coverage amount or term length.
        </p>
        <Link href="/quote/select" className="btn btn-accent mt-6">
          Start a new quote
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[var(--pw-muted)]">
          <span className="font-semibold text-brand-navy">{results.length}</span> carrier
          {results.length === 1 ? '' : 's'} for{' '}
          <span className="font-semibold text-brand-navy">${coverageAmount.toLocaleString()}</span> of
          coverage
        </p>
        {!readOnly && (
          <button type="button" onClick={copyShare} className="btn btn-ghost self-start text-sm">
            <Share2 className="h-4 w-4" aria-hidden />
            {copied ? 'Link copied' : 'Share these quotes'}
          </button>
        )}
      </div>

      <ul className="mt-4 space-y-3">
        {results.map((r) => (
          <li
            key={r.compulifeCode}
            className={cn(
              'flex flex-col gap-4 rounded-xl border bg-white p-5 sm:flex-row sm:items-center',
              r.isBestValue ? 'border-brand-green' : 'border-[var(--pw-border)]',
            )}
          >
            {/* Carrier */}
            <div className="flex flex-1 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-navy-tint text-sm font-bold text-brand-navy">
                {r.carrierName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-carrier">{r.carrierName}</p>
                <p className="text-product">
                  {r.productName}
                  {r.amBest ? ` · AM Best ${r.amBest}` : ''}
                </p>
                <div className="mt-1 flex gap-1.5">
                  {r.isBestValue && <span className="badge badge-solid-green">Best value</span>}
                  {r.isLowestAnnual && !r.isBestValue && (
                    <span className="badge badge-blue">Lowest annual</span>
                  )}
                </div>
              </div>
            </div>

            {/* Premium */}
            <div className="sm:text-right">
              <Premium amount={r.monthlyPremium ?? r.annualPremium / 12} className="text-3xl" />
              <p className="text-xs text-[var(--pw-hint)]">
                <span className="font-mono">${r.annualPremium.toLocaleString()}</span>/year
              </p>
            </div>

            {/* Action */}
            {!readOnly ? (
              <button
                type="button"
                onClick={() => apply(r.compulifeCode)}
                disabled={applyingCode !== null}
                className="btn btn-accent shrink-0 sm:w-32"
              >
                {applyingCode === r.compulifeCode ? 'One sec…' : 'Apply'}
              </button>
            ) : null}
          </li>
        ))}
      </ul>

      {readOnly && (
        <div className="mt-8 rounded-xl bg-brand-navy p-6 text-center text-white">
          <h2 className="text-h3 text-white">Want a quote of your own?</h2>
          <p className="mt-1 text-sm text-white/75">See your personalized rates in minutes.</p>
          <Link href="/quote/select" className="btn btn-accent mt-4">
            Get my quote
          </Link>
        </div>
      )}

      <p className="mt-6 flex items-start gap-2 text-xs text-[var(--pw-hint)]">
        <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" aria-hidden />
        Quotes are estimates based on the information provided and are not offers of insurance. Final
        rates are set by the carrier during underwriting.
      </p>
    </div>
  );
}
