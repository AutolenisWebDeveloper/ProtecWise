// ============================================================
// GET /api/quote/shared/[shareToken] — fetch a shared quote
// ============================================================
// Public read via the share token. Records viewed_at (drives the reminder
// sequence). Returns safe fields only.
import { NextResponse } from 'next/server';
import { createAdminSupabase } from '@/lib/supabase';

const SAFE_COLUMNS =
  'id, product_family, results, carrier_count, lowest_annual_premium, best_value_carrier, share_token, input, status, expires_at, created_at, viewed_at';

export async function GET(_req: Request, { params }: { params: { shareToken: string } }) {
  const supabase = createAdminSupabase();
  const { data, error } = await supabase
    .from('quotes')
    .select(SAFE_COLUMNS)
    .eq('share_token', params.shareToken)
    .maybeSingle();

  if (error) {
    console.error('[quote/shared] DB error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: 'Quote not found.' }, { status: 404 });
  }

  // Stamp the first view (used by the quote-reminder cron).
  if (!data.viewed_at) {
    await supabase
      .from('quotes')
      .update({ viewed_at: new Date().toISOString() })
      .eq('id', data.id);
  }

  return NextResponse.json({ success: true, data });
}
