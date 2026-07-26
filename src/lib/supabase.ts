// ============================================================
// Supabase client factory — server / browser / middleware / admin
// ============================================================
// ProtecWise uses @supabase/ssr (the current, supported SSR integration).
// - createBrowserSupabase(): client components
// - createServerSupabase(): server components + route handlers (RLS as the user)
// - createMiddlewareSupabase(): edge middleware (refreshes the auth cookie)
// - createAdminSupabase(): service role, bypasses RLS — SERVER ONLY, never shipped
//   to the browser. Use only in trusted server code (public quote flow, cron, admin ops).

import { createBrowserClient, createServerClient, type CookieOptions } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from '@/types/supabase';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

/** Client-component browser client. Safe to expose — uses the anon key + RLS. */
export function createBrowserSupabase() {
  return createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
}

/**
 * Server client for Server Components, Route Handlers, and Server Actions.
 * Reads/writes the auth cookie so RLS runs as the signed-in user.
 */
export function createServerSupabase() {
  const cookieStore = cookies();

  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set({ name, value, ...options }),
          );
        } catch {
          // `set` throws when called from a Server Component render. That is
          // expected — the middleware refreshes the session cookie instead.
        }
      },
    },
  });
}

/**
 * Middleware client. Returns the client plus the response whose cookies were
 * updated, so the caller can return it to persist a refreshed session.
 */
export function createMiddlewareSupabase(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set({ name, value, ...options }),
        );
      },
    },
  });

  return { supabase, response };
}

/**
 * Service-role client — bypasses RLS. SERVER-ONLY.
 * Never import this into a client component. Use for the public quote flow,
 * cron jobs, magic-link/token verification, and admin operations.
 */
export function createAdminSupabase() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  return createClient<Database>(SUPABASE_URL, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
