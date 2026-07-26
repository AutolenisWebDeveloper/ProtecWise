import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ShieldCheck,
  Scale,
  BadgeCheck,
  Headset,
  ArrowRight,
  Check,
} from 'lucide-react';
import { PRODUCTS } from '@/lib/products';

export const metadata: Metadata = {
  title: 'Life insurance made clear',
  description:
    'Compare life insurance from top-rated carriers, estimate the coverage your family needs, and apply with a licensed advisor. Protecting what matters most.',
};

const STEPS = [
  {
    n: '01',
    title: 'Compare',
    body: 'Answer a few questions and see real quotes from top-rated carriers — side by side, in minutes.',
  },
  {
    n: '02',
    title: 'Choose',
    body: 'Pick the coverage that fits your budget and goals, with a licensed advisor whenever you want one.',
  },
  {
    n: '03',
    title: 'Apply',
    body: 'Complete your application online. We validate it and submit it to the carrier you chose.',
  },
];

const VALUES = [
  {
    icon: Scale,
    title: 'Independent, not captive',
    body: 'We work for you, not a single carrier — so the recommendation is about your needs, not a quota.',
  },
  {
    icon: ShieldCheck,
    title: 'Top-rated carriers',
    body: 'Compare financially strong, highly rated companies with a track record of paying claims.',
  },
  {
    icon: BadgeCheck,
    title: 'No cost to compare',
    body: 'Quoting and advice are free. You only ever pay a premium if you choose to buy a policy.',
  },
  {
    icon: Headset,
    title: 'Real licensed advisors',
    body: 'Prefer to talk it through? A licensed advisor is a click away — no pressure, no jargon.',
  },
];

const STATS = [
  { value: 'A-rated', label: 'carriers we compare' },
  { value: '2 min', label: 'to your first quote' },
  { value: '$0', label: 'to compare and get advice' },
  { value: '100%', label: 'online application' },
];

const FAQS = [
  {
    q: 'Does comparing quotes cost anything?',
    a: 'No. Comparing quotes and talking with an advisor is completely free. You only pay a premium if you decide to buy a policy.',
  },
  {
    q: 'How much coverage do I actually need?',
    a: 'It depends on your income, debts, and goals. Our needs calculator gives you a personalized number in about two minutes — no email required to see it.',
  },
  {
    q: 'What does ProtecWise do, exactly?',
    a: 'We help you compare coverage, run a needs analysis, and submit a complete application to the carrier you choose. The carrier makes the underwriting and issuance decisions.',
  },
];

export default function HomePage() {
  return (
    <>
      {/* 1 — Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-navy-tint/60 to-white">
        <div className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 sm:py-28">
          <h1 className="text-display text-balance">
            Protecting What <span className="text-brand-green">Matters Most</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-body text-[var(--pw-muted)]">
            Compare life insurance from top-rated carriers, estimate the coverage your family needs,
            and apply with a licensed advisor — all in one place.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/quote/select" className="btn btn-accent">
              Get a quote
            </Link>
            <Link href="/needs-calculator" className="btn btn-outline">
              Estimate your coverage
            </Link>
          </div>
          <p className="mt-6 text-sm text-[var(--pw-hint)]">
            Compare top-rated carriers · No cost, no obligation · Licensed advisors
          </p>
        </div>
      </section>

      {/* 2 — How it works */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-h2">How it works</h2>
          <p className="mt-3 text-body text-[var(--pw-muted)]">
            Three steps from &ldquo;I should probably do this&rdquo; to protected.
          </p>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {STEPS.map((step) => (
            <div key={step.n}>
              <span className="font-mono text-sm font-bold text-brand-green">{step.n}</span>
              <h3 className="mt-2 text-h3">{step.title}</h3>
              <p className="mt-2 text-body text-[var(--pw-muted)]">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3 — Products */}
      <section id="products" className="scroll-mt-20 bg-surface py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-h2">Coverage for every stage</h2>
            <p className="mt-3 text-body text-[var(--pw-muted)]">
              From low-cost term to lifelong protection with cash value — here&rsquo;s the plain-English
              version.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PRODUCTS.map((product) => (
              <Link
                key={product.slug}
                href={`/products/${product.slug}`}
                className="group flex flex-col rounded-xl border border-[var(--pw-border)] bg-white p-6 transition-colors hover:border-brand-navy"
              >
                <span
                  className={
                    product.category === 'term'
                      ? 'badge badge-blue self-start'
                      : 'badge badge-green self-start'
                  }
                >
                  {product.category === 'term' ? 'Term' : 'Permanent'}
                </span>
                <h3 className="mt-4 text-h3">{product.name}</h3>
                <p className="mt-1 text-sm font-medium text-brand-green">{product.tagline}</p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-[var(--pw-muted)]">
                  {product.summary}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-navy">
                  Learn about {product.name.toLowerCase()}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4 — Why ProtecWise */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-h2">Why ProtecWise</h2>
          <p className="mt-3 text-body text-[var(--pw-muted)]">
            An independent brokerage built to make this decision clearer, not harder.
          </p>
        </div>
        <div className="mt-12 grid gap-8 sm:grid-cols-2">
          {VALUES.map((value) => {
            const Icon = value.icon;
            return (
              <div key={value.title} className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-navy-tint text-brand-navy">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <div>
                  <h3 className="text-h3">{value.title}</h3>
                  <p className="mt-1 text-body text-[var(--pw-muted)]">{value.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5 — Needs calculator CTA band */}
      <section className="bg-brand-navy">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-4 py-16 text-center sm:px-6 lg:flex-row lg:justify-between lg:text-left">
          <div>
            <h2 className="text-h2 text-white">Not sure how much you need?</h2>
            <p className="mt-2 max-w-xl text-white/75">
              Answer a few questions and get a personalized coverage recommendation in about two
              minutes.
            </p>
          </div>
          <Link href="/needs-calculator" className="btn btn-accent shrink-0">
            Estimate your coverage
          </Link>
        </div>
      </section>

      {/* 6 — Common questions (trust via transparency) */}
      <section className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <h2 className="text-center text-h2">Questions people ask first</h2>
        <div className="mt-10 space-y-6">
          {FAQS.map((faq) => (
            <div key={faq.q} className="rounded-xl border border-[var(--pw-border)] p-6">
              <h3 className="flex items-start gap-2 text-h3">
                <Check className="mt-1 h-5 w-5 shrink-0 text-brand-green" aria-hidden />
                {faq.q}
              </h3>
              <p className="mt-2 pl-7 text-body text-[var(--pw-muted)]">{faq.a}</p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <dl className="mt-14 grid grid-cols-2 gap-6 sm:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <dt className="sr-only">{stat.label}</dt>
              <dd className="text-premium text-2xl">{stat.value}</dd>
              <p className="mt-1 text-xs text-[var(--pw-hint)]">{stat.label}</p>
            </div>
          ))}
        </dl>
      </section>

      {/* 7 — Final CTA */}
      <section className="bg-surface">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
          <h2 className="text-h1">Ready to protect what matters most?</h2>
          <p className="mx-auto mt-4 max-w-xl text-body text-[var(--pw-muted)]">
            See real quotes in minutes. No cost, no obligation, no pressure.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/quote/select" className="btn btn-accent">
              Get a quote
            </Link>
            <Link href="/contact" className="btn btn-outline">
              Talk to an advisor
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
