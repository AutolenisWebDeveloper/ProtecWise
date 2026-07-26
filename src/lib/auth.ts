// ============================================================
// Auth helpers — session, profile, role checks, requireRole()
// ============================================================
// For Server Components, Route Handlers, and Server Actions. Client-side
// components read auth via createBrowserSupabase() directly.
//
// Roles: 'admin' | 'agent' | 'client' | 'candidate' | 'recruiter'

import { redirect } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { createServerSupabase } from './supabase';
import type { Agent, Profile, UserRole } from '@/types';

/** The authenticated user + their profile (role), or nulls when signed out. */
export interface SessionContext {
  user: User | null;
  profile: Profile | null;
}

/** Current auth user (verified against Supabase Auth), or null. */
export async function getUser(): Promise<User | null> {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** Current user's profile row (includes role), or null when signed out. */
export async function getProfile(): Promise<Profile | null> {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  return data ?? null;
}

/** User + profile together in one call. */
export async function getSessionContext(): Promise<SessionContext> {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, profile: null };

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return { user, profile: profile ?? null };
}

/** True when the profile's role is one of `roles`. */
export function hasRole(profile: Profile | null, roles: UserRole | UserRole[]): boolean {
  if (!profile) return false;
  const allowed = Array.isArray(roles) ? roles : [roles];
  return allowed.includes(profile.role);
}

/**
 * Require an authenticated user. Redirects to `loginPath` when signed out.
 * Use in Server Components / pages. Returns the user when present.
 */
export async function requireAuth(loginPath = '/login'): Promise<User> {
  const user = await getUser();
  if (!user) redirect(loginPath);
  return user;
}

/**
 * Require a specific role (or one of several). Redirects signed-out users to
 * `loginPath`, and wrong-role users to their own portal home. Returns the
 * user + profile when the check passes. Use in Server Components / pages.
 */
export async function requireRole(
  roles: UserRole | UserRole[],
  loginPath = '/login',
): Promise<{ user: User; profile: Profile }> {
  const { user, profile } = await getSessionContext();
  if (!user) redirect(loginPath);
  if (!profile || !hasRole(profile, roles)) redirect(roleHome(profile?.role));
  return { user, profile };
}

/** The current user's agent record (agents.user_id = auth.uid()), or null. */
export async function getCurrentAgent(): Promise<Agent | null> {
  const supabase = createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase.from('agents').select('*').eq('user_id', user.id).single();
  return data ?? null;
}

/** The portal landing path for a role (default: public home). */
export function roleHome(role: UserRole | null | undefined): string {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'agent':
    case 'recruiter':
      return '/agent';
    case 'client':
      return '/client';
    case 'candidate':
      return '/candidates';
    default:
      return '/';
  }
}
