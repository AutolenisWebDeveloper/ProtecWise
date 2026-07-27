// ============================================================
// POST /api/quote/save-email — email a saved quote to the visitor
// ============================================================
// Public. Links the quote to a lead (creating one if needed) and sends the
// quote-copy email. Used when someone quotes without entering an email first.
import { NextResponse } from 'next/server';
import { saveQuoteEmailSchema } from '@/lib/validations';
import { createAdminSupabase } from '@/lib/supabase';
import { sendEmail } from '@/lib/email';
import type { QuoteResult } from '@/lib/quote';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || '';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = saveQuoteEmailSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const { quoteId, email } = parsed.data;
    const supabase = createAdminSupabase();

    const { data: quote } = await supabase
      .from('quotes')
      .select('id, share_token, product_family, results, lead_id')
      .eq('id', quoteId)
      .maybeSingle();

    if (!quote) {
      return NextResponse.json({ error: 'Quote not found.' }, { status: 404 });
    }

    // Attach a lead (reuse the quote's lead, else find/create by email).
    let leadId = quote.lead_id;
    if (!leadId) {
      const { data: existing } = await supabase
        .from('leads')
        .select('id')
        .eq('email', email)
        .maybeSingle();
      if (existing) {
        leadId = existing.id;
      } else {
        const { data: created } = await supabase
          .from('leads')
          .insert({ email, source: 'quote', status: 'quoted', product_interest: quote.product_family })
          .select('id')
          .single();
        leadId = created?.id ?? null;
      }
      await supabase.from('quotes').update({ lead_id: leadId }).eq('id', quote.id);
    }

    const results = (Array.isArray(quote.results) ? quote.results : []) as unknown as QuoteResult[];
    const sent = await sendEmail({
      to: email,
      subject: 'Your ProtecWise quote',
      template: '01_QuoteCopyEmail',
      transactional: true,
      leadId: leadId ?? undefined,
      html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;">
        <h1 style="color:#1B3D8B;">Your quote is saved</h1>
        <p style="color:#4A5568;">View your full comparison any time:</p>
        <p><a href="${APP_URL}/quote/view/${quote.share_token}" style="background:#4AAE2E;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;">View your quote</a></p>
        <p style="color:#718096;font-size:12px;">${results.length} carrier${results.length === 1 ? '' : 's'} compared · ProtecWise LLC</p>
      </div>`,
    });

    if (sent.sent) {
      await supabase
        .from('quotes')
        .update({ quote_email_sent_at: new Date().toISOString() })
        .eq('id', quote.id);
    }

    return NextResponse.json({
      success: true,
      message: sent.sent ? 'Quote sent — check your inbox.' : 'Quote saved.',
    });
  } catch (error) {
    console.error('[quote/save-email] Unexpected error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
