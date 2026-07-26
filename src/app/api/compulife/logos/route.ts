// ============================================================
// GET /api/compulife/logos — CompuLife CompanyLogoList (cached 24h)
// ============================================================
// Carrier logo URLs, shown alongside quote results. The successful response is
// cached for a day (via unstable_cache); errors are never cached.
import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { callCompuLifeProxy, CompuLifeError } from '@/lib/compulife';

const getLogos = unstable_cache(() => callCompuLifeProxy('CompanyLogoList'), ['compulife-logos'], {
  revalidate: 86400,
});

export async function GET() {
  try {
    const data = await getLogos();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error instanceof CompuLifeError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[compulife/logos] Unexpected error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
