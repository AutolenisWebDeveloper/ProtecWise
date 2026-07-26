// ============================================================
// POST /api/quote/run — run a consumer quote end-to-end
// ============================================================
// Public route. Enforces the monthly CompuLife hard limit, builds the carrier
// filter (buildCOMPINC), calls the fixed-IP proxy, parses + badges the results,
// creates a lead (if an email was given) and the quote record, and emails a
// copy. NEVER calls CompuLife from the browser.
import { NextResponse, type NextRequest } from 'next/server';
import { quoteInputSchema } from '@/lib/validations';
import { buildCOMPINC } from '@/lib/carriers';
import { callCompuLifeProxy, CompuLifeError } from '@/lib/compulife';
import { toCompuLifeParams, parseQuoteResults, computeBadges } from '@/lib/quote';
import { createAdminSupabase } from '@/lib/supabase';
import { sendEmail } from '@/lib/email';
import type { Json } from '@/types/supabase';

export const dynamic = 'force-dynamic';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || '';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = quoteInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 },
      );
    }
    const input = parsed.data;
    const supabase = createAdminSupabase();

    // 1. Monthly hard-limit guard (cached quote views cost $0; live runs count).
    const hardLimit = parseInt(process.env.COMPULIFE_MONTHLY_QUOTE_HARD_LIMIT || '1150', 10);
    const { data: usage } = await supabase
      .from('current_month_quote_usage')
      .select('quote_count')
      .maybeSingle();
    if ((usage?.quote_count ?? 0) >= hardLimit) {
      return NextResponse.json(
        { error: 'Our quote system is briefly at capacity. Please contact us and we’ll help directly.' },
        { status: 429 },
      );
    }

    // 2. Carrier permission filter — never quote the raw CompuLife list.
    const compinc = await buildCOMPINC({
      productFamily: input.productFamily,
      state: input.state,
      context: 'client',
    });
    if (!compinc) {
      return NextResponse.json(
        { error: 'No carriers are available for this product in your state yet. Please contact us.' },
        { status: 422 },
      );
    }

    // 3. Run the quote via the fixed-IP proxy.
    let raw: unknown;
    try {
      raw = await callCompuLifeProxy('request', toCompuLifeParams(input, compinc.compinc));
    } catch (error) {
      if (error instanceof CompuLifeError) {
        return NextResponse.json({ error: error.message }, { status: error.status });
      }
      throw error;
    }

    // 4. Parse + badge. Empty results ≠ auth failure — treat as "no match".
    const badged = computeBadges(parseQuoteResults(raw));
    if (badged.results.length === 0) {
      return NextResponse.json(
        { error: 'No quotes matched this profile. Try different inputs or contact an advisor.' },
        { status: 422 },
      );
    }
    const bestValue = badged.results.find((r) => r.isBestValue);

    // 5. Create a lead when we have an email to follow up with.
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;
    let leadId: string | null = null;
    if (input.email) {
      const { data: lead } = await supabase
        .from('leads')
        .insert({
          full_name: [input.firstName, input.lastName].filter(Boolean).join(' ') || null,
          first_name: input.firstName ?? null,
          last_name: input.lastName ?? null,
          email: input.email,
          phone: input.phone ?? null,
          state: input.state,
          source: 'quote',
          product_interest: input.productFamily,
          coverage_amount: input.coverageAmount,
          status: 'quoted',
          sms_consent: input.smsConsent,
          sms_consent_at: input.smsConsent ? new Date().toISOString() : null,
          sms_consent_ip: input.smsConsent ? ip : null,
        })
        .select('id')
        .single();
      leadId = lead?.id ?? null;
    }

    // 6. Store the quote (results cached in DB → free re-views).
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .insert({
        lead_id: leadId,
        product_family: input.productFamily,
        input: input as unknown as Json,
        results: badged.results as unknown as Json,
        compinc_used: compinc.compinc,
        carrier_count: badged.results.length,
        lowest_annual_premium: badged.lowestAnnualPremium,
        best_value_carrier: bestValue?.carrierName ?? null,
        status: 'active',
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select('id, share_token')
      .single();

    if (quoteError || !quote) {
      console.error('[quote/run] DB error:', quoteError);
      return NextResponse.json({ error: 'We couldn’t save your quote. Please try again.' }, { status: 500 });
    }

    // 7. Email a copy of the quote (if requested). Template lands in Session 12.
    if (input.email) {
      const sent = await sendEmail({
        to: input.email,
        subject: 'Your ProtecWise quote is ready',
        template: '01_QuoteCopyEmail',
        transactional: true,
        leadId: leadId ?? undefined,
        html: quoteCopyHtml({
          name: input.firstName,
          shareUrl: `${APP_URL}/quote/view/${quote.share_token}`,
          topResults: badged.results.slice(0, 3),
        }),
      });
      if (sent.sent) {
        await supabase
          .from('quotes')
          .update({ quote_email_sent_at: new Date().toISOString() })
          .eq('id', quote.id);
      }
    }

    // 8. Audit.
    await supabase.from('activity_log').insert({
      action: 'quote.created',
      entity_type: 'quote',
      entity_id: quote.id,
      description: `Quote run — ${input.productFamily}, ${badged.results.length} carriers`,
      ip_address: ip,
      metadata: { compinc_used: compinc.compinc, carrier_count: badged.results.length },
    });

    return NextResponse.json(
      { success: true, data: { quoteId: quote.id, shareToken: quote.share_token } },
      { status: 201 },
    );
  } catch (error) {
    console.error('[quote/run] Unexpected error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}

/** Minimal branded quote-copy email (the React Email template arrives in Session 12). */
function quoteCopyHtml(opts: {
  name?: string;
  shareUrl: string;
  topResults: { carrierName: string; monthlyPremium: number | null; annualPremium: number }[];
}): string {
  const rows = opts.topResults
    .map(
      (r) =>
        `<tr><td style="padding:8px 0;color:#1A202C;">${r.carrierName}</td>` +
        `<td style="padding:8px 0;text-align:right;font-family:monospace;color:#1B3D8B;">$${(
          r.monthlyPremium ?? r.annualPremium / 12
        ).toFixed(2)}/mo</td></tr>`,
    )
    .join('');
  return `<div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;">
    <h1 style="color:#1B3D8B;">Your quote is ready${opts.name ? `, ${opts.name}` : ''}</h1>
    <p style="color:#4A5568;">Here are your top matches. View the full comparison any time:</p>
    <table style="width:100%;border-collapse:collapse;">${rows}</table>
    <p style="margin-top:24px;">
      <a href="${opts.shareUrl}" style="background:#4AAE2E;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;">View your quote</a>
    </p>
    <p style="color:#718096;font-size:12px;margin-top:24px;">ProtecWise LLC · Protecting what matters most.</p>
  </div>`;
}
