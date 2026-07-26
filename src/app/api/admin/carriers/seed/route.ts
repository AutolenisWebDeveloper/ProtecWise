// ============================================================
// POST /api/admin/carriers/seed — sync CompuLife CompanyList → carriers
// ============================================================
// Admin-only. Fetches the CompuLife company list via the fixed-IP proxy and
// upserts each company into the carriers table (by compulife_id). Existing
// rows keep their admin-set flags (is_active / is_client_visible / rules) —
// the upsert only refreshes compulife_id + name.
import { NextResponse } from 'next/server';
import { getSessionContext } from '@/lib/auth';
import { createAdminSupabase } from '@/lib/supabase';
import { callCompuLifeProxy, CompuLifeError } from '@/lib/compulife';

export const dynamic = 'force-dynamic'; // admin-only; reads the session cookie

interface NormalizedCompany {
  compulifeId: string;
  name: string;
}

/**
 * CompuLife's CompanyList response shape is not strongly documented, so extract
 * the id + name defensively from the most likely field names, across array or
 * wrapped-object responses.
 */
function normalizeCompanies(payload: unknown): NormalizedCompany[] {
  const list: unknown[] = Array.isArray(payload)
    ? payload
    : ((): unknown[] => {
        if (payload && typeof payload === 'object') {
          const obj = payload as Record<string, unknown>;
          for (const key of ['CompanyList', 'Companies', 'companies', 'data', 'results']) {
            if (Array.isArray(obj[key])) return obj[key] as unknown[];
          }
        }
        return [];
      })();

  const out: NormalizedCompany[] = [];
  for (const raw of list) {
    if (!raw || typeof raw !== 'object') continue;
    const item = raw as Record<string, unknown>;
    const id =
      pickString(item, ['CompanyCode', 'companyCode', 'Code', 'code', 'id', 'ID']) ?? '';
    const name =
      pickString(item, ['CompanyName', 'companyName', 'Company', 'company', 'name', 'Name']) ?? '';
    if (id && name) out.push({ compulifeId: id, name });
  }
  return out;
}

function pickString(obj: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (typeof value === 'number') return String(value);
  }
  return null;
}

export async function POST() {
  try {
    const { user, profile } = await getSessionContext();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const payload = await callCompuLifeProxy('CompanyList');
    const companies = normalizeCompanies(payload);

    if (companies.length === 0) {
      return NextResponse.json(
        { error: 'CompuLife returned no companies to seed. Check the proxy connection.' },
        { status: 422 },
      );
    }

    const supabase = createAdminSupabase();
    const { error } = await supabase.from('carriers').upsert(
      companies.map((c) => ({ compulife_id: c.compulifeId, name: c.name })),
      { onConflict: 'compulife_id', ignoreDuplicates: false },
    );

    if (error) {
      console.error('[admin/carriers/seed] DB error:', error);
      return NextResponse.json({ error: 'Failed to save carriers. Please try again.' }, { status: 500 });
    }

    await supabase.from('activity_log').insert({
      actor_id: user.id,
      actor_role: 'admin',
      action: 'carriers.seeded',
      entity_type: 'carrier',
      description: `Seeded ${companies.length} carriers from CompuLife`,
      metadata: { count: companies.length },
    });

    return NextResponse.json({ success: true, data: { count: companies.length } }, { status: 200 });
  } catch (error) {
    if (error instanceof CompuLifeError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[admin/carriers/seed] Unexpected error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
