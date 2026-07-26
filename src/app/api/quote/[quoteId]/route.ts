// ============================================================
// GET /api/quote/[quoteId] — fetch a quote (safe fields only)
// ============================================================
// Public: quote ids are unguessable UUIDs. Returns the comparison data, never
// lead PII. Serves cached DB results — no CompuLife call, no quota cost.
import { NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase';

const SAFE_COLUMNS =
  'id, product_family, results, compinc_used, carrier_count, lowest_annual_premium, best_value_carrier, share_token, input, status, expires_at, created_at';

export async function GET(_req: Request, { params }: { params: { quoteId: string } }) {
  const supabase = createAdminSupabase();
  const { data, error } = await supabase
    .from('quotes')
    .select(SAFE_COLUMNS)
    .eq('id', params.quoteId)
    .maybeSingle();

  if (error) {
    console.error('[quote/get] DB error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: 'Quote not found.' }, { status: 404 });
  }
  return NextResponse.json({ success: true, data });
}
