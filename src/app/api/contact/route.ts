// ============================================================
// POST /api/contact — public contact form submission
// Creates a website lead and logs the activity. No auth (public route);
// all input is Zod-validated; writes use the service-role client.
// ============================================================
import { NextResponse, type NextRequest } from 'next/server';
import { contactFormSchema } from '@/lib/validations';
import { createAdminSupabase } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = contactFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { name, email, phone, state, topic, message } = parsed.data;
    const supabase = createAdminSupabase();

    const { data: lead, error } = await supabase
      .from('leads')
      .insert({
        full_name: name,
        email,
        phone: phone ? phone : null,
        state: state ?? null,
        source: 'website',
        source_detail: `Contact form — ${topic}`,
        notes: message,
      })
      .select('id')
      .single();

    if (error) {
      console.error('[api/contact] DB error:', error);
      return NextResponse.json(
        { error: 'We couldn’t send your message. Please try again.' },
        { status: 500 },
      );
    }

    await supabase.from('activity_log').insert({
      action: 'lead.contact_submitted',
      entity_type: 'lead',
      entity_id: lead.id,
      description: `Contact form — ${topic}`,
      metadata: { topic },
    });

    return NextResponse.json(
      { success: true, message: 'Thanks — an advisor will be in touch soon.' },
      { status: 201 },
    );
  } catch (error) {
    console.error('[api/contact] Unexpected error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
