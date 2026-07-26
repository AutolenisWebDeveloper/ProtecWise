import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildCOMPINC } from './carriers';
import { createAdminSupabase } from './supabase';

vi.mock('./supabase', () => ({ createAdminSupabase: vi.fn() }));

type Row = Record<string, unknown>;

interface QueryBuilder {
  select: (columns?: string) => QueryBuilder;
  eq: (column: string, value: unknown) => QueryBuilder;
  in: (column: string, values: readonly unknown[]) => QueryBuilder;
  then: (resolve: (result: { data: Row[]; error: null }) => void) => void;
}

/** Minimal in-memory Supabase double that honors select/eq/in and is awaitable. */
function fakeClient(tables: Record<string, Row[]>): ReturnType<typeof createAdminSupabase> {
  const client = {
    from(table: string): QueryBuilder {
      let rows: Row[] = [...(tables[table] ?? [])];
      const builder: QueryBuilder = {
        select: () => builder,
        eq: (column, value) => {
          rows = rows.filter((r) => r[column] === value);
          return builder;
        },
        in: (column, values) => {
          const set = new Set(values);
          rows = rows.filter((r) => set.has(r[column]));
          return builder;
        },
        then: (resolve) => resolve({ data: rows, error: null }),
      };
      return builder;
    },
  };
  return client as unknown as ReturnType<typeof createAdminSupabase>;
}

const FIXTURES: Record<string, Row[]> = {
  carriers: [
    { id: 'c1', compulife_id: 'CL1', name: 'Alpha', is_active: true, is_client_visible: true },
    { id: 'c2', compulife_id: 'CL2', name: 'Beta', is_active: false, is_client_visible: true }, // deactivated
    { id: 'c3', compulife_id: 'CL3', name: 'Gamma', is_active: true, is_client_visible: false }, // hidden from clients
    { id: 'c4', compulife_id: 'CL4', name: 'Delta', is_active: true, is_client_visible: true },
    { id: 'c5', compulife_id: null, name: 'NoId', is_active: true, is_client_visible: true }, // no CompuLife id
  ],
  carrier_product_rules: [
    { carrier_id: 'c1', product_family: 'level_term', is_active: true },
    { carrier_id: 'c3', product_family: 'level_term', is_active: true },
    { carrier_id: 'c4', product_family: 'level_term', is_active: true },
    { carrier_id: 'c5', product_family: 'level_term', is_active: true },
    { carrier_id: 'c1', product_family: 'whole_life', is_active: true },
  ],
  carrier_state_rules: [
    { carrier_id: 'c1', state: 'TX', is_active: true },
    { carrier_id: 'c3', state: 'TX', is_active: true },
    { carrier_id: 'c4', state: 'TX', is_active: true },
  ],
  agent_carrier_permissions: [
    { agent_id: 'a1', carrier_id: 'c1', status: 'approved' },
    { agent_id: 'a1', carrier_id: 'c4', status: 'pending' }, // not approved
  ],
};

beforeEach(() => {
  vi.mocked(createAdminSupabase).mockReturnValue(fakeClient(FIXTURES));
});

describe('buildCOMPINC', () => {
  it('client context: excludes deactivated + non-client-visible + no-id carriers', async () => {
    const result = await buildCOMPINC({
      productFamily: 'level_term',
      state: 'TX',
      context: 'client',
    });
    expect(result).not.toBeNull();
    // c2 deactivated, c3 not client-visible, c5 has no compulife id → only c1 + c4 remain.
    expect(result?.carrierIds.sort()).toEqual(['c1', 'c4']);
    expect(result?.compinc).toBe('CL1,CL4');
  });

  it('agent context: applies approved appointments (c3 visible, but only c1 approved)', async () => {
    const result = await buildCOMPINC({
      productFamily: 'level_term',
      state: 'TX',
      context: 'agent',
      agentId: 'a1',
    });
    // agent context ignores client-visible (c3 stays through step 2) but filter 5
    // keeps only carriers the agent is APPROVED for → c1 (c4 is only 'pending').
    expect(result?.carrierIds).toEqual(['c1']);
    expect(result?.compinc).toBe('CL1');
  });

  it('returns null when no carrier is available in the state', async () => {
    const result = await buildCOMPINC({
      productFamily: 'level_term',
      state: 'CA', // no state rules
      context: 'client',
    });
    expect(result).toBeNull();
  });

  it('returns null when no carrier offers the product family', async () => {
    const result = await buildCOMPINC({
      productFamily: 'universal_life', // no product rules
      state: 'TX',
      context: 'client',
    });
    expect(result).toBeNull();
  });

  it('throws when agent context is missing an agentId', async () => {
    await expect(
      buildCOMPINC({ productFamily: 'level_term', state: 'TX', context: 'agent' }),
    ).rejects.toThrow(/agentId is required/);
  });
});
