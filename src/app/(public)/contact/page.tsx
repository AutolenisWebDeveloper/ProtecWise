import type { Metadata } from 'next';
import { Mail, Phone, Clock } from 'lucide-react';
import { ContactForm } from '@/components/forms/contact-form';

export const metadata: Metadata = {
  title: 'Contact us',
  description:
    'Talk to a licensed ProtecWise advisor about life insurance quotes, coverage, or your application. No cost, no obligation.',
};

export default function ContactPage() {
  const phone = process.env.NEXT_PUBLIC_AGENCY_PHONE;

  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-h1">Talk to a licensed advisor</h1>
        <p className="mt-3 text-body text-[var(--pw-muted)]">
          Have a question about coverage, a quote, or your application? Send a note and we&rsquo;ll get
          back to you — no cost, no pressure.
        </p>
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-[var(--pw-border)] bg-white p-6 sm:p-8">
          <ContactForm />
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-[var(--pw-border)] bg-surface p-6">
            <h2 className="text-h3">Prefer to reach us directly?</h2>
            <ul className="mt-4 space-y-4 text-sm">
              {phone ? (
                <li className="flex items-start gap-3">
                  <Phone className="mt-0.5 h-5 w-5 shrink-0 text-brand-navy" aria-hidden />
                  <div>
                    <p className="font-medium text-[var(--pw-text)]">Call us</p>
                    <a href={`tel:${phone}`} className="font-mono text-brand-navy">
                      {phone}
                    </a>
                  </div>
                </li>
              ) : null}
              <li className="flex items-start gap-3">
                <Mail className="mt-0.5 h-5 w-5 shrink-0 text-brand-navy" aria-hidden />
                <div>
                  <p className="font-medium text-[var(--pw-text)]">Email us</p>
                  <a href="mailto:hello@protecwise.com" className="text-brand-navy">
                    hello@protecwise.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="mt-0.5 h-5 w-5 shrink-0 text-brand-navy" aria-hidden />
                <div>
                  <p className="font-medium text-[var(--pw-text)]">Hours</p>
                  <p className="text-[var(--pw-muted)]">Mon–Fri, 9am–6pm CT</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl bg-brand-navy p-6 text-white">
            <h2 className="text-h3 text-white">In a hurry?</h2>
            <p className="mt-2 text-sm text-white/75">
              Skip the wait and see real quotes now.
            </p>
            <a href="/quote/select" className="btn btn-accent mt-4 w-full">
              Get a quote
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
