// ============================================================
// POST /api/quote/apply-click — record intent to apply from a quote
// ============================================================
// Public. Stamps apply_clicked_at, advances the linked lead, and logs the
// activity. Returns the path to continue (application intake is Session 10).
import { NextResponse, type NextRequest } from 'next/server';
import { applyClickSchema } from '@/lib/validations';
import { createAdminSupabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = applyClickSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const { quoteId, carrierCode } = parsed.data;
    const supabase = createAdminSupabase();

    const { data: quote } = await supabase
      .from('quotes')
      .select('id, lead_id, apply_clicked_at')
      .eq('id', quoteId)
      .maybeSingle();

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found.' }, { status: 404 });
    }

    if (!quote.apply_clicked_at) {
      await supabase
        .from('quotes')
        .update({ apply_clicked_at: new Date().toISOString() })
        .eq('id', quote.id);
    }
    if (quote.lead_id) {
      await supabase
        .from('leads')
        .update({ status: 'application_started' })
        .eq('id', quote.lead_id);
    }

    await supabase.from('activity_log').insert({
      action: 'quote.apply_clicked',
      entity_type: 'quote',
      entity_id: quote.id,
      description: `Apply clicked — carrier ${carrierCode}`,
      metadata: { carrier_code: carrierCode },
    });

    return NextResponse.json({ success: true, data: { next: '/contact' } });
  } catch (error) {
    console.error('[quote/apply-click] Unexpected error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
