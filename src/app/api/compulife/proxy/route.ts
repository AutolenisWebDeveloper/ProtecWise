// ============================================================
// POST /api/compulife/proxy — low-level CompuLife passthrough
// ============================================================
// Server-side forwarder to the fixed-IP proxy. Requires an authenticated
// session so it can't be used as an open quota drain. PUBLIC consumer quotes
// must go through /api/quote/run (Session 7), which enforces buildCOMPINC and
// the monthly quote limits. Never call CompuLife from the browser directly.
import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { getUser } from '@/lib/auth';
import { callCompuLifeProxy, CompuLifeError, type CompuLifeRequestType } from '@/lib/compulife';

export const dynamic = 'force-dynamic'; // reads the session cookie

const RequestSchema = z.object({
  requestType: z.enum([
    'StateList',
    'CompanyList',
    'CompanyLogoList',
    'CompanyProductList',
    'CategoryList',
    'request',
    'sidebyside',
    'ip',
  ]),
  params: z.record(z.unknown()).default({}),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = RequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const data = await callCompuLifeProxy(
      parsed.data.requestType as CompuLifeRequestType,
      parsed.data.params,
    );
    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error instanceof CompuLifeError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[compulife/proxy] Unexpected error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
