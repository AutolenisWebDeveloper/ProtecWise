// ============================================================
// GET /api/compulife/states — CompuLife StateList (cached 24h)
// ============================================================
// Public reference data for the quote form's state dropdown. The successful
// response is cached for a day (via unstable_cache) to conserve the CompuLife
// request budget; errors are never cached.
import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { callCompuLifeProxy, CompuLifeError } from '@/lib/compulife';

const getStates = unstable_cache(() => callCompuLifeProxy('StateList'), ['compulife-states'], {
  revalidate: 86400,
});

export async function GET() {
  try {
    const data = await getStates();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error instanceof CompuLifeError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[compulife/states] Unexpected error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
