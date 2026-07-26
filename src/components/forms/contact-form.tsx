'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check } from 'lucide-react';
import { contactFormSchema, type ContactFormInput, CONTACT_TOPICS, US_STATE_CODES } from '@/lib/validations';
import { cn } from '@/lib/utils';

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormInput>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { topic: 'Get a quote' },
  });

  async function onSubmit(values: ContactFormInput) {
    setSubmitError(null);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setSubmitError(data.error ?? 'We couldn’t send your message. Please try again.');
        return;
      }
      setSubmitted(true);
    } catch {
      setSubmitError('We couldn’t reach the server. Check your connection and try again.');
    }
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-brand-green/30 bg-brand-green-tint p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-green text-white">
          <Check className="h-6 w-6" aria-hidden />
        </div>
        <h2 className="mt-4 text-h3">Message sent</h2>
        <p className="mt-2 text-body text-[var(--pw-muted)]">
          Thanks for reaching out — a licensed advisor will be in touch soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      {submitError && (
        <div className="rounded-lg border border-[var(--pw-danger)]/30 bg-[var(--pw-danger-tint)] px-4 py-3 text-sm text-[var(--pw-danger)]">
          {submitError}
        </div>
      )}

      <div>
        <label htmlFor="name" className="field-label">
          Name
        </label>
        <input
          id="name"
          type="text"
          autoComplete="name"
          className={cn('input', errors.name && 'input-error')}
          aria-invalid={!!errors.name}
          {...register('name')}
        />
        {errors.name && <p className="field-error mt-1">{errors.name.message}</p>}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className="field-label">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={cn('input', errors.email && 'input-error')}
            aria-invalid={!!errors.email}
            {...register('email')}
          />
          {errors.email && <p className="field-error mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label htmlFor="phone" className="field-label">
            Phone <span className="text-[var(--pw-hint)]">(optional)</span>
          </label>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+1 214 555 0123"
            className={cn('input', errors.phone && 'input-error')}
            aria-invalid={!!errors.phone}
            {...register('phone')}
          />
          {errors.phone && <p className="field-error mt-1">{errors.phone.message}</p>}
          <p className="field-help mt-1">Use the format +1 followed by your number.</p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="state" className="field-label">
            State <span className="text-[var(--pw-hint)]">(optional)</span>
          </label>
          <select id="state" className="input" defaultValue="" {...register('state')}>
            <option value="">Select a state</option>
            {US_STATE_CODES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="topic" className="field-label">
            How can we help?
          </label>
          <select id="topic" className="input" {...register('topic')}>
            {CONTACT_TOPICS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="message" className="field-label">
          Message
        </label>
        <textarea
          id="message"
          rows={5}
          className={cn('input', errors.message && 'input-error')}
          aria-invalid={!!errors.message}
          placeholder="Tell us a bit about what you’re looking for."
          {...register('message')}
        />
        {errors.message && <p className="field-error mt-1">{errors.message.message}</p>}
      </div>

      <button type="submit" disabled={isSubmitting} className="btn btn-accent w-full sm:w-auto">
        {isSubmitting ? 'Sending…' : 'Send message'}
      </button>

      <p className="field-help">
        By submitting, you agree to be contacted about your request. See our{' '}
        <a href="/privacy" className="underline hover:text-brand-navy">
          privacy policy
        </a>
        .
      </p>
    </form>
  );
}
