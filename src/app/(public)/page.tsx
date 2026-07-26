import Link from 'next/link';

// Foundation placeholder homepage. The full 7-section marketing homepage is
// built in Session 5; this renders inside the public header/footer shell.
export default function HomePage() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-24 text-center">
      <h1 className="text-display text-balance">
        Protecting What <span className="text-brand-green">Matters Most</span>
      </h1>
      <p className="max-w-xl text-body text-[var(--pw-muted)]">
        Compare life insurance from top-rated carriers in minutes, estimate the coverage your family
        needs, and apply with a licensed advisor.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/quote/select" className="btn btn-accent">
          Get a quote
        </Link>
        <Link href="/needs-calculator" className="btn btn-outline">
          Estimate your coverage
        </Link>
      </div>
    </section>
  );
}
