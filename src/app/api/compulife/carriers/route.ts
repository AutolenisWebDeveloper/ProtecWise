// ============================================================
// GET /api/compulife/carriers — raw CompuLife CompanyList (ADMIN ONLY)
// ============================================================
// Returns the unfiltered CompuLife company list. This must NEVER be exposed to
// clients or agents (per the carrier-permission rules) — it's for admin carrier
// management and the seed workflow only.
import { NextResponse } from 'next/server';
import { getSessionContext } from '@/lib/auth';
import { callCompuLifeProxy, CompuLifeError } from '@/lib/compulife';

export const dynamic = 'force-dynamic'; // admin-only; reads the session cookie

export async function GET() {
  try {
    const { user, profile } = await getSessionContext();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data = await callCompuLifeProxy('CompanyList');
    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error instanceof CompuLifeError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[compulife/carriers] Unexpected error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
