import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PRODUCTS } from '@/lib/products';

export const metadata: Metadata = {
  title: 'Get a quote',
  description: 'Choose a coverage type to compare real quotes from top-rated carriers.',
};

export default function QuoteSelectPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-h1">What kind of coverage?</h1>
        <p className="mt-3 text-body text-[var(--pw-muted)]">
          Pick a starting point — you can change any detail on the next screen. Not sure?{' '}
          <Link href="/needs-calculator" className="text-brand-navy underline">
            Estimate your coverage first
          </Link>
          .
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {PRODUCTS.map((product) => (
          <Link
            key={product.family}
            href={`/quote?product=${product.family}`}
            className="group flex items-center justify-between gap-4 rounded-xl border border-[var(--pw-border)] bg-white p-5 transition-colors hover:border-brand-navy"
          >
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-h3">{product.name}</h2>
                <span
                  className={
                    product.category === 'term' ? 'badge badge-blue' : 'badge badge-green'
                  }
                >
                  {product.category === 'term' ? 'Term' : 'Permanent'}
                </span>
              </div>
              <p className="mt-1 text-sm text-[var(--pw-muted)]">{product.tagline}</p>
            </div>
            <ArrowRight className="h-5 w-5 shrink-0 text-brand-navy transition-transform group-hover:translate-x-0.5" />
          </Link>
        ))}
      </div>
    </div>
  );
}
