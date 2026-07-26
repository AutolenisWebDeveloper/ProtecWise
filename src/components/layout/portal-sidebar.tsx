'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Menu, X, type LucideIcon } from 'lucide-react';
import { Wordmark } from './logo';
import { createBrowserSupabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

export interface SidebarItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Match the pathname exactly (dashboard roots). */
  exact?: boolean;
  /** Pending count → renders a badge. Wired to real counts in later sessions. */
  badge?: number;
}

interface PortalSidebarProps {
  items: SidebarItem[];
  /** 'agent' = navy; 'admin' = darker navy to distinguish the two portals. */
  variant: 'agent' | 'admin';
  /** Small label under the wordmark, e.g. "Agent portal". */
  subtitle: string;
}

export function PortalSidebar({ items, variant, subtitle }: PortalSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const bg = variant === 'admin' ? 'bg-[#142D6A]' : 'bg-brand-navy';

  const isActive = (item: SidebarItem) =>
    item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);

  async function signOut() {
    const supabase = createBrowserSupabase();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <>
      {/* Mobile top bar */}
      <div
        className={cn(
          'sticky top-0 z-40 flex h-14 items-center justify-between px-4 lg:hidden',
          bg,
        )}
      >
        <Wordmark protecClassName="text-white" wiseClassName="text-brand-green" className="text-lg" />
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open navigation"
          className="inline-flex h-11 w-11 items-center justify-center rounded-md text-white/80 hover:text-white"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          aria-hidden
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-60 flex-col transition-transform duration-200 ease-out lg:translate-x-0',
          bg,
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center justify-between px-6">
          <Link href={variant === 'admin' ? '/admin' : '/agent'} className="flex flex-col">
            <Wordmark protecClassName="text-white" wiseClassName="text-brand-green" className="text-xl" />
            <span className="text-[11px] font-medium uppercase tracking-wide text-white/50">
              {subtitle}
            </span>
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-white/70 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn('nav-item', isActive(item) && 'nav-item-active')}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden />
                <span className="flex-1">{item.label}</span>
                {item.badge ? (
                  <span className="badge badge-solid-green">{item.badge}</span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-3">
          <button
            type="button"
            onClick={signOut}
            className="nav-item w-full rounded-md border-l-0"
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" aria-hidden />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
