import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of use',
  description: 'The terms that govern your use of the ProtecWise website and services.',
};

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-h1">Terms of use</h1>
      <p className="mt-3 text-sm text-[var(--pw-hint)]">Last updated: July 2026</p>

      <p className="mt-8 text-body text-[var(--pw-muted)]">
        These terms govern your use of the ProtecWise LLC website and services. By using the site,
        you agree to them. This page is provided for general information and is not legal advice.
      </p>

      <h2 className="mt-10 text-h2">What ProtecWise does</h2>
      <p className="mt-4 text-body text-[var(--pw-muted)]">
        ProtecWise is a licensed independent insurance brokerage. We help you compare life insurance,
        estimate your coverage needs, and submit a completed application to the carrier you select.
        We are not an insurance carrier. We do not underwrite policies, issue coverage, or make
        claims decisions — those are the responsibility of the carrier.
      </p>

      <h2 className="mt-10 text-h2">No guarantee of coverage</h2>
      <p className="mt-4 text-body text-[var(--pw-muted)]">
        Quotes are estimates based on the information provided and are not offers of insurance.
        Coverage, rates, and availability vary by state and are subject to the carrier&rsquo;s
        underwriting. No coverage exists until a policy is issued by the carrier and the required
        premium is paid.
      </p>

      <h2 className="mt-10 text-h2">Eligibility</h2>
      <p className="mt-4 text-body text-[var(--pw-muted)]">
        You must be at least 18 years old and a U.S. resident to use our services. You agree to
        provide accurate and complete information; providing false information may affect your
        eligibility for coverage.
      </p>

      <h2 className="mt-10 text-h2">Acceptable use</h2>
      <p className="mt-4 text-body text-[var(--pw-muted)]">
        You agree not to misuse the site, interfere with its operation, attempt unauthorized access,
        or use it for any unlawful purpose. Content on the site is owned by ProtecWise or its
        licensors and may not be copied or reused without permission.
      </p>

      <h2 className="mt-10 text-h2">Disclaimers and limitation of liability</h2>
      <p className="mt-4 text-body text-[var(--pw-muted)]">
        The site and services are provided &ldquo;as is&rdquo; without warranties of any kind. To the
        fullest extent permitted by law, ProtecWise is not liable for indirect, incidental, or
        consequential damages arising from your use of the site.
      </p>

      <h2 className="mt-10 text-h2">Changes to these terms</h2>
      <p className="mt-4 text-body text-[var(--pw-muted)]">
        We may update these terms from time to time. Continued use of the site after an update means
        you accept the revised terms.
      </p>

      <h2 className="mt-10 text-h2">Contact us</h2>
      <p className="mt-4 text-body text-[var(--pw-muted)]">
        Questions about these terms? Email{' '}
        <a href="mailto:legal@protecwise.com" className="text-brand-navy underline">
          legal@protecwise.com
        </a>
        .
      </p>
    </article>
  );
}
