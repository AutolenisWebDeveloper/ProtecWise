'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { Logo } from './logo';
import { cn } from '@/lib/utils';

const RECRUITING_NAV = [
  { label: 'Why join us', href: '/recruiting/why-join-us' },
  { label: 'Compensation', href: '/recruiting/compensation' },
  { label: 'Training', href: '/recruiting/training' },
  { label: 'Licensing', href: '/recruiting/licensing' },
  { label: 'FAQ', href: '/recruiting/faq' },
];

/** Public recruiting-site header (light chrome, Apply now CTA). */
export function RecruitingHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--pw-border)] bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo height={38} href="/recruiting" priority />

        <nav className="hidden items-center gap-1 lg:flex">
          {RECRUITING_NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex min-h-[44px] items-center rounded-md px-3 text-sm font-medium text-[var(--pw-muted)] transition-colors hover:text-brand-navy',
                isActive(item.href) && 'text-brand-navy',
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Link href="/recruiting/apply" className="btn btn-accent">
            Apply now
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-md text-brand-navy lg:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-[var(--pw-border)] bg-white lg:hidden">
          <nav className="mx-auto max-w-7xl space-y-1 px-4 py-4 sm:px-6">
            {RECRUITING_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="block rounded-md px-3 py-2.5 text-sm text-[var(--pw-text)] hover:bg-brand-navy-tint"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/recruiting/apply"
              onClick={() => setOpen(false)}
              className="btn btn-accent mt-3 w-full"
            >
              Apply now
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
