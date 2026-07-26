'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Menu, X } from 'lucide-react';
import { Logo } from './logo';
import { cn } from '@/lib/utils';

const PRODUCTS = [
  { label: 'Term life', href: '/products/term-life' },
  { label: 'Decreasing term', href: '/products/decreasing-term' },
  { label: 'Term to 100', href: '/products/term-to-100' },
  { label: 'Whole life', href: '/products/whole-life' },
  { label: 'Universal life', href: '/products/universal-life' },
];

const NAV = [
  { label: 'Needs calculator', href: '/needs-calculator' },
  { label: 'Contact', href: '/contact' },
];

export function PublicHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--pw-border)] bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo height={40} priority />

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 lg:flex">
          <div
            className="relative"
            onMouseEnter={() => setProductsOpen(true)}
            onMouseLeave={() => setProductsOpen(false)}
          >
            <button
              type="button"
              aria-expanded={productsOpen}
              aria-haspopup="true"
              onClick={() => setProductsOpen((v) => !v)}
              className={cn(
                'flex min-h-[44px] items-center gap-1 rounded-md px-3 text-sm font-medium text-[var(--pw-muted)] transition-colors hover:text-brand-navy',
                pathname.startsWith('/products') && 'text-brand-navy',
              )}
            >
              Products
              <ChevronDown className="h-4 w-4" aria-hidden />
            </button>
            {productsOpen && (
              <div className="absolute left-0 top-full w-56 rounded-lg border border-[var(--pw-border)] bg-white p-1.5 shadow-lg">
                {PRODUCTS.map((p) => (
                  <Link
                    key={p.href}
                    href={p.href}
                    className={cn(
                      'block rounded-md px-3 py-2 text-sm text-[var(--pw-text)] transition-colors hover:bg-brand-navy-tint hover:text-brand-navy',
                      isActive(p.href) && 'bg-brand-navy-tint text-brand-navy',
                    )}
                  >
                    {p.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {NAV.map((item) => (
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

        {/* Desktop actions */}
        <div className="hidden items-center gap-3 lg:flex">
          <Link href="/client/login" className="btn btn-outline">
            Client portal
          </Link>
          <Link href="/quote/select" className="btn btn-accent">
            Get a quote
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-md text-brand-navy lg:hidden"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-[var(--pw-border)] bg-white lg:hidden">
          <nav className="mx-auto max-w-7xl space-y-1 px-4 py-4 sm:px-6">
            <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-[var(--pw-hint)]">
              Products
            </p>
            {PRODUCTS.map((p) => (
              <Link
                key={p.href}
                href={p.href}
                onClick={() => setMobileOpen(false)}
                className="block rounded-md px-3 py-2.5 text-sm text-[var(--pw-text)] hover:bg-brand-navy-tint"
              >
                {p.label}
              </Link>
            ))}
            <div className="my-2 border-t border-[var(--pw-border)]" />
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="block rounded-md px-3 py-2.5 text-sm text-[var(--pw-text)] hover:bg-brand-navy-tint"
              >
                {item.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-3">
              <Link
                href="/client/login"
                onClick={() => setMobileOpen(false)}
                className="btn btn-outline w-full"
              >
                Client portal
              </Link>
              <Link
                href="/quote/select"
                onClick={() => setMobileOpen(false)}
                className="btn btn-accent w-full"
              >
                Get a quote
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
