import Link from 'next/link';
import { Logo } from './logo';

const COLUMNS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: 'Products',
    links: [
      { label: 'Term life', href: '/products/term-life' },
      { label: 'Decreasing term', href: '/products/decreasing-term' },
      { label: 'Term to 100', href: '/products/term-to-100' },
      { label: 'Whole life', href: '/products/whole-life' },
      { label: 'Universal life', href: '/products/universal-life' },
    ],
  },
  {
    heading: 'Get started',
    links: [
      { label: 'Get a quote', href: '/quote/select' },
      { label: 'Estimate your coverage', href: '/needs-calculator' },
      { label: 'Client portal', href: '/client/login' },
      { label: 'Contact us', href: '/contact' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'Join our team', href: '/recruiting' },
      { label: 'Privacy policy', href: '/privacy' },
      { label: 'Terms of use', href: '/terms' },
    ],
  },
];

export function PublicFooter() {
  const phone = process.env.NEXT_PUBLIC_AGENCY_PHONE;
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--pw-border)] bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Logo height={44} />
            <p className="mt-4 max-w-xs text-sm text-[var(--pw-muted)]">
              Protecting what matters most. Compare life insurance from top-rated carriers and apply
              with a licensed advisor.
            </p>
            {phone ? (
              <a
                href={`tel:${phone}`}
                className="mt-4 inline-block font-mono text-sm text-brand-navy"
              >
                {phone}
              </a>
            ) : null}
          </div>

          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h2 className="text-sm font-semibold text-brand-navy">{col.heading}</h2>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--pw-muted)] transition-colors hover:text-brand-navy"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-[var(--pw-border)] pt-6">
          <p className="text-xs leading-relaxed text-[var(--pw-hint)]">
            ProtecWise LLC is a licensed life insurance brokerage. We help you compare coverage and
            submit your application to the carrier you choose; the carrier makes all underwriting and
            issuance decisions. Coverage, rates, and availability vary by state and are not
            guaranteed until a policy is issued.
          </p>
          <p className="mt-4 text-xs text-[var(--pw-hint)]">
            &copy; {year} ProtecWise LLC. Protecting what matters most.
          </p>
        </div>
      </div>
    </footer>
  );
}
