import Link from 'next/link';
import { Check, Info, ArrowRight } from 'lucide-react';
import type { Product } from '@/lib/products';

/** Renders a full marketing page for a single product from its data. */
export function ProductPage({ product }: { product: Product }) {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-brand-navy-tint/60 to-white">
        <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20">
          <Link
            href="/#products"
            className="text-sm font-medium text-[var(--pw-hint)] hover:text-brand-navy"
          >
            &larr; All products
          </Link>
          <span
            className={
              product.category === 'term'
                ? 'badge badge-blue mt-4 block w-fit'
                : 'badge badge-green mt-4 block w-fit'
            }
          >
            {product.category === 'term' ? 'Term coverage' : 'Permanent coverage'}
          </span>
          <h1 className="mt-4 text-h1">{product.name}</h1>
          <p className="mt-2 text-lg font-medium text-brand-green">{product.tagline}</p>
          <p className="mt-4 max-w-2xl text-body text-[var(--pw-muted)]">{product.summary}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/quote/select" className="btn btn-accent">
              Get a {product.name.toLowerCase()} quote
            </Link>
            <Link href="/needs-calculator" className="btn btn-outline">
              Estimate your coverage
            </Link>
          </div>
        </div>
      </section>

      {/* Quick facts */}
      <section className="border-y border-[var(--pw-border)] bg-white">
        <dl className="mx-auto grid max-w-4xl grid-cols-2 gap-6 px-4 py-8 sm:grid-cols-4 sm:px-6">
          {product.facts.map((fact) => (
            <div key={fact.label}>
              <dt className="text-xs uppercase tracking-wide text-[var(--pw-hint)]">{fact.label}</dt>
              <dd className="text-premium mt-1 text-xl">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Body */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h2 className="text-h2">How {product.name.toLowerCase()} works</h2>
        <div className="mt-6 space-y-5">
          {product.body.map((paragraph, i) => (
            <p key={i} className="text-body text-[var(--pw-text)]">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Best for */}
        <div className="mt-10 rounded-xl border border-[var(--pw-border)] bg-surface p-6">
          <h3 className="text-h3">Best for</h3>
          <ul className="mt-4 space-y-2">
            {product.bestFor.map((item) => (
              <li key={item} className="flex items-start gap-2 text-body text-[var(--pw-text)]">
                <Check className="mt-1 h-5 w-5 shrink-0 text-brand-green" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Benefits vs considerations */}
      <section className="bg-surface py-16">
        <div className="mx-auto grid max-w-4xl gap-8 px-4 sm:px-6 md:grid-cols-2">
          <div className="rounded-xl border border-[var(--pw-border)] bg-white p-6">
            <h3 className="text-h3">What&rsquo;s great about it</h3>
            <ul className="mt-4 space-y-3">
              {product.benefits.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-[var(--pw-text)]">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-xl border border-[var(--pw-border)] bg-white p-6">
            <h3 className="text-h3">What to keep in mind</h3>
            <ul className="mt-4 space-y-3">
              {product.considerations.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-[var(--pw-text)]">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-brand-blue" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <h2 className="text-h2">Common questions</h2>
        <div className="mt-8 space-y-6">
          {product.faqs.map((faq) => (
            <div key={faq.q}>
              <h3 className="text-h3">{faq.q}</h3>
              <p className="mt-2 text-body text-[var(--pw-muted)]">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-brand-navy">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-4 py-14 text-center sm:px-6">
          <h2 className="text-h2 text-white">See what {product.name.toLowerCase()} costs for you</h2>
          <p className="max-w-xl text-white/75">
            Real quotes from top-rated carriers in minutes. No cost, no obligation.
          </p>
          <Link href="/quote/select" className="btn btn-accent">
            Get a quote
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </section>
    </>
  );
}
