// ============================================================
// Middleware — session refresh + RBAC routing for all 5 portals
// ============================================================
// Roles (profiles.role): admin | agent | client | candidate | recruiter
//
// Portal areas:
//   /admin/*      → admin only
//   /agent/*      → agent, recruiter, or admin
//   /client/*     → client (magic-link) or admin
//   /candidates/* → candidate or admin
// Everything else (public site, quote flow, recruiting site, auth pages,
// /api) is open here — API routes enforce their own auth per the api skill.

import { NextResponse, type NextRequest } from 'next/server';
import { createMiddlewareSupabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

type Role = Database['public']['Enums']['user_role'];

/** Where each role lands after login / when it hits a portal it may not use. */
const ROLE_HOME: Record<Role, string> = {
  admin: '/admin',
  agent: '/agent',
  recruiter: '/agent',
  client: '/client',
  candidate: '/candidates',
};

/** Protected prefixes → the roles allowed, and the login to send guests to. */
const PROTECTED: Array<{ prefix: string; allow: Role[]; login: string }> = [
  { prefix: '/admin', allow: ['admin'], login: '/login' },
  { prefix: '/agent', allow: ['agent', 'recruiter', 'admin'], login: '/login' },
  { prefix: '/client', allow: ['client', 'admin'], login: '/client/login' },
  { prefix: '/candidates', allow: ['candidate', 'admin'], login: '/candidates/login' },
];

export async function middleware(request: NextRequest) {
  const { supabase, response } = createMiddlewareSupabase(request);

  // Refresh the session (also populates the auth cookie on `response`).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const rule = PROTECTED.find(
    (r) => pathname === r.prefix || pathname.startsWith(`${r.prefix}/`),
  );

  // Public / auth / API route — nothing to gate, just return the refreshed session.
  if (!rule) return response;

  // Not signed in → send to the correct login with a return path.
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = rule.login;
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Signed in → check role.
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle<{ role: Role }>();

  const role = profile?.role;

  if (!role || !rule.allow.includes(role)) {
    // Authenticated but wrong portal → bounce to their own home.
    const url = request.nextUrl.clone();
    url.pathname = role ? ROLE_HOME[role] : rule.login;
    url.search = '';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // Run on everything except Next internals and static files.
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
};
