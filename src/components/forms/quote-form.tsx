'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { quoteInputSchema, type QuoteInput, US_STATE_CODES } from '@/lib/validations';
import { PRODUCTS } from '@/lib/products';
import { cn } from '@/lib/utils';

const COVERAGE_OPTIONS = [100_000, 250_000, 500_000, 750_000, 1_000_000, 2_000_000];
const TERM_OPTIONS = [10, 15, 20, 25, 30];
const HEALTH_OPTIONS: { value: QuoteInput['healthClass']; label: string }[] = [
  { value: 'preferred_plus', label: 'Excellent' },
  { value: 'preferred', label: 'Great' },
  { value: 'standard_plus', label: 'Good' },
  { value: 'standard', label: 'Average' },
];

export function QuoteForm({ defaults }: { defaults?: Partial<QuoteInput> }) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<QuoteInput>({
    resolver: zodResolver(quoteInputSchema),
    defaultValues: {
      productFamily: 'level_term',
      gender: 'M',
      tobacco: false,
      healthClass: 'preferred',
      coverageAmount: 500_000,
      termLength: 20,
      smsConsent: false,
      ...defaults,
    },
  });

  const family = watch('productFamily');
  const isTerm = family === 'level_term' || family === 'decreasing_term';

  async function onSubmit(values: QuoteInput) {
    setSubmitError(null);
    try {
      const res = await fetch('/api/quote/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        data?: { quoteId: string };
      };
      if (!res.ok || !data.data?.quoteId) {
        setSubmitError(data.error ?? 'We couldn’t run your quote. Please try again.');
        return;
      }
      router.push(`/quote/results/${data.data.quoteId}`);
    } catch {
      setSubmitError('We couldn’t reach the server. Check your connection and try again.');
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {submitError && (
        <div className="rounded-lg border border-[var(--pw-danger)]/30 bg-[var(--pw-danger-tint)] px-4 py-3 text-sm text-[var(--pw-danger)]">
          {submitError}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="productFamily" className="field-label">
            Coverage type
          </label>
          <select id="productFamily" className="input" {...register('productFamily')}>
            {PRODUCTS.map((p) => (
              <option key={p.family} value={p.family}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="coverageAmount" className="field-label">
            Coverage amount
          </label>
          <select
            id="coverageAmount"
            className="input"
            {...register('coverageAmount', { valueAsNumber: true })}
          >
            {COVERAGE_OPTIONS.map((amount) => (
              <option key={amount} value={amount}>
                ${amount.toLocaleString()}
              </option>
            ))}
          </select>
        </div>

        {isTerm && (
          <div>
            <label htmlFor="termLength" className="field-label">
              Term length
            </label>
            <select
              id="termLength"
              className="input"
              {...register('termLength', { valueAsNumber: true })}
            >
              {TERM_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t} years
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label htmlFor="dateOfBirth" className="field-label">
            Date of birth
          </label>
          <input
            id="dateOfBirth"
            type="date"
            className={cn('input', errors.dateOfBirth && 'input-error')}
            {...register('dateOfBirth')}
          />
          {errors.dateOfBirth && <p className="field-error mt-1">{errors.dateOfBirth.message}</p>}
        </div>

        <div>
          <label htmlFor="state" className="field-label">
            State
          </label>
          <select
            id="state"
            className={cn('input', errors.state && 'input-error')}
            defaultValue=""
            {...register('state')}
          >
            <option value="" disabled>
              Select a state
            </option>
            {US_STATE_CODES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {errors.state && <p className="field-error mt-1">{errors.state.message}</p>}
        </div>

        <div>
          <span className="field-label">Sex</span>
          <div className="flex gap-2">
            {(['M', 'F'] as const).map((g) => (
              <label
                key={g}
                className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-[var(--pw-border)] px-3 py-2.5 text-sm has-[:checked]:border-brand-navy has-[:checked]:bg-brand-navy-tint"
              >
                <input type="radio" value={g} className="sr-only" {...register('gender')} />
                {g === 'M' ? 'Male' : 'Female'}
              </label>
            ))}
          </div>
        </div>

        <div>
          <span className="field-label">Do you use tobacco?</span>
          <div className="flex gap-2">
            <label className="flex flex-1 cursor-pointer items-center justify-center rounded-lg border border-[var(--pw-border)] px-3 py-2.5 text-sm has-[:checked]:border-brand-navy has-[:checked]:bg-brand-navy-tint">
              <input type="radio" value="false" className="sr-only" {...register('tobacco', { setValueAs: (v) => v === 'true' })} defaultChecked />
              No
            </label>
            <label className="flex flex-1 cursor-pointer items-center justify-center rounded-lg border border-[var(--pw-border)] px-3 py-2.5 text-sm has-[:checked]:border-brand-navy has-[:checked]:bg-brand-navy-tint">
              <input type="radio" value="true" className="sr-only" {...register('tobacco', { setValueAs: (v) => v === 'true' })} />
              Yes
            </label>
          </div>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="healthClass" className="field-label">
            Overall health
          </label>
          <select id="healthClass" className="input" {...register('healthClass')}>
            {HEALTH_OPTIONS.map((h) => (
              <option key={h.value} value={h.value}>
                {h.label}
              </option>
            ))}
          </select>
          <p className="field-help mt-1">
            An estimate is fine — your advisor confirms the exact class during underwriting.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--pw-border)] bg-surface p-5">
        <p className="text-sm font-medium text-[var(--pw-text)]">
          Where should we send your quote? <span className="text-[var(--pw-hint)]">(optional)</span>
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <input type="text" placeholder="First name" className="input" {...register('firstName')} />
          <input type="text" placeholder="Last name" className="input" {...register('lastName')} />
          <input
            type="email"
            placeholder="Email"
            className={cn('input', errors.email && 'input-error')}
            {...register('email')}
          />
          <input type="tel" placeholder="Phone (+1…)" className="input" {...register('phone')} />
        </div>
        {errors.email && <p className="field-error mt-1">{errors.email.message}</p>}
        <label className="mt-3 flex items-start gap-2 text-xs text-[var(--pw-muted)]">
          <input type="checkbox" className="mt-0.5" {...register('smsConsent')} />
          <span>
            Text me about my quote. Message &amp; data rates may apply; reply STOP to opt out.
          </span>
        </label>
      </div>

      <button type="submit" disabled={isSubmitting} className="btn btn-accent w-full text-base">
        {isSubmitting ? 'Getting your quotes…' : 'See my quotes'}
      </button>
      <p className="field-help text-center">
        Comparing is free. No obligation, and we never sell your information.
      </p>
    </form>
  );
}
