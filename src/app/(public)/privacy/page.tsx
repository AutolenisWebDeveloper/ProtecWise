import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy policy',
  description: 'How ProtecWise LLC collects, uses, and protects your information.',
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-h1">Privacy policy</h1>
      <p className="mt-3 text-sm text-[var(--pw-hint)]">Last updated: July 2026</p>

      <p className="mt-8 text-body text-[var(--pw-muted)]">
        ProtecWise LLC (&ldquo;ProtecWise,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;) is an independent life
        insurance brokerage. This policy explains what information we collect when you use our
        website and services, how we use it, and the choices you have. This page is provided for
        general information and is not legal advice.
      </p>

      <h2 className="mt-10 text-h2">Information we collect</h2>
      <ul className="mt-4 list-disc space-y-2 pl-6 text-body text-[var(--pw-muted)]">
        <li>
          <strong className="text-[var(--pw-text)]">Information you provide</strong> — contact
          details, quote inputs (such as age, state, and coverage amount), and the information you
          enter in an application, which may include health and financial details.
        </li>
        <li>
          <strong className="text-[var(--pw-text)]">Automatic information</strong> — device and usage
          data collected through cookies and similar technologies to operate and improve the site.
        </li>
      </ul>

      <h2 className="mt-10 text-h2">How we use your information</h2>
      <ul className="mt-4 list-disc space-y-2 pl-6 text-body text-[var(--pw-muted)]">
        <li>To generate quotes and provide the services you request.</li>
        <li>To prepare and submit your application to the carrier you select.</li>
        <li>To communicate with you about your quote, application, or questions.</li>
        <li>To operate, secure, and improve our platform, and to meet legal obligations.</li>
      </ul>

      <h2 className="mt-10 text-h2">How we share information</h2>
      <p className="mt-4 text-body text-[var(--pw-muted)]">
        We share your information with the insurance carrier you choose in order to submit your
        application, and with service providers that help us operate the platform under
        confidentiality obligations. We do not sell your personal information. We may disclose
        information when required by law or to protect our rights and the safety of others.
      </p>

      <h2 className="mt-10 text-h2">Health information</h2>
      <p className="mt-4 text-body text-[var(--pw-muted)]">
        Health information you provide during an application is sensitive. We limit access to it,
        store it encrypted, and share it only with the carrier you select for the purpose of
        evaluating your application, and only with your authorization.
      </p>

      <h2 className="mt-10 text-h2">Security</h2>
      <p className="mt-4 text-body text-[var(--pw-muted)]">
        We use administrative, technical, and physical safeguards designed to protect your
        information, including encryption of sensitive data at rest. No system is perfectly secure,
        but we work to protect the information you entrust to us.
      </p>

      <h2 className="mt-10 text-h2">Your choices</h2>
      <p className="mt-4 text-body text-[var(--pw-muted)]">
        You can opt out of marketing emails using the unsubscribe link in any such message, and you
        can decline marketing text messages by replying STOP. You may request access to or deletion
        of your information, subject to legal and recordkeeping requirements, by contacting us.
      </p>

      <h2 className="mt-10 text-h2">Contact us</h2>
      <p className="mt-4 text-body text-[var(--pw-muted)]">
        Questions about this policy? Email{' '}
        <a href="mailto:privacy@protecwise.com" className="text-brand-navy underline">
          privacy@protecwise.com
        </a>
        .
      </p>
    </article>
  );
}
