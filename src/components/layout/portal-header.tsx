'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Menu, X } from 'lucide-react';
import { Logo } from './logo';
import { createBrowserSupabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

export interface PortalHeaderItem {
  label: string;
  href: string;
  exact?: boolean;
}

/** Top-bar header for the authenticated client + candidate portals (light chrome). */
export function PortalHeader({
  items,
  homeHref,
  signOutRedirect,
}: {
  items: PortalHeaderItem[];
  homeHref: string;
  signOutRedirect: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const isActive = (item: PortalHeaderItem) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);

  async function signOut() {
    const supabase = createBrowserSupabase();
    await supabase.auth.signOut();
    router.push(signOutRedirect);
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--pw-border)] bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo height={38} href={homeHref} priority />

        <nav className="hidden items-center gap-1 md:flex">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex min-h-[44px] items-center rounded-md px-3 text-sm font-medium text-[var(--pw-muted)] transition-colors hover:text-brand-navy',
                isActive(item) && 'text-brand-navy',
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <button type="button" onClick={signOut} className="btn btn-ghost">
            <LogOut className="h-4 w-4" aria-hidden />
            Sign out
          </button>
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-md text-brand-navy md:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-[var(--pw-border)] bg-white md:hidden">
          <nav className="mx-auto max-w-6xl space-y-1 px-4 py-4 sm:px-6">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'block rounded-md px-3 py-2.5 text-sm text-[var(--pw-text)] hover:bg-brand-navy-tint',
                  isActive(item) && 'bg-brand-navy-tint text-brand-navy',
                )}
              >
                {item.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={signOut}
              className="mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-sm text-[var(--pw-muted)] hover:bg-brand-navy-tint"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              Sign out
            </button>
          </nav>
        </div>
      )}
    </header>
  );
}
