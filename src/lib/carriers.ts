// ============================================================
// Carrier permission system — buildCOMPINC()
// ============================================================
// NON-NEGOTIABLE: every quote must pass through this filter. The raw CompuLife
// carrier list is never shown to a client or agent unfiltered. buildCOMPINC()
// returns the COMPINC parameter (the comma-separated list of allowed CompuLife
// company ids) plus the carrier UUIDs used, which the caller stores on the
// quote record as `compinc_used`.
//
// Five filters, applied in order:
//   1. global active        → carriers.is_active = true
//   2. client visible       → carriers.is_client_visible = true   (context 'client' only)
//   3. product family       → carrier_product_rules (family, is_active)
//   4. state                → carrier_state_rules (2-letter state, is_active)
//   5. agent permissions    → agent_carrier_permissions (agent, status 'approved')  (context 'agent' only)

import { createAdminSupabase } from './supabase';
import type { ProductFamily } from '@/types';

export interface BuildCompincInput {
  /** Product family being quoted. */
  productFamily: ProductFamily;
  /** 2-letter USPS state code (matches carrier_state_rules.state). */
  state: string;
  /** 'client' applies the client-visible filter; 'agent' applies agent permissions. */
  context: 'client' | 'agent';
  /** Required when context === 'agent'. */
  agentId?: string;
}

export interface CompincCarrier {
  id: string; // ProtecWise carrier UUID
  compulifeId: string; // CompuLife company id (used in COMPINC)
  name: string;
}

export interface BuildCompincResult {
  /** Comma-separated CompuLife company ids for the CompuLife COMPINC param. */
  compinc: string;
  /** ProtecWise carrier UUIDs that passed all filters (store for audit). */
  carrierIds: string[];
  /** The carriers that passed, for display / logging. */
  carriers: CompincCarrier[];
}

/**
 * Build the COMPINC carrier-filter for a quote. Returns null when no carrier
 * survives all filters (caller should surface "no approved carriers" — never
 * fall back to the unfiltered CompuLife list).
 */
export async function buildCOMPINC(
  input: BuildCompincInput,
): Promise<BuildCompincResult | null> {
  const { productFamily, state, context, agentId } = input;

  if (context === 'agent' && !agentId) {
    throw new Error('buildCOMPINC: agentId is required when context is "agent"');
  }

  const supabase = createAdminSupabase();

  // Filter 1 (+2) — global active, and client-visible for the public context.
  let carrierQuery = supabase
    .from('carriers')
    .select('id, compulife_id, name')
    .eq('is_active', true);

  if (context === 'client') {
    carrierQuery = carrierQuery.eq('is_client_visible', true);
  }

  const { data: activeCarriers, error: carriersError } = await carrierQuery;
  if (carriersError) throw carriersError;
  if (!activeCarriers || activeCarriers.length === 0) return null;

  // Only carriers with a CompuLife id can appear in a COMPINC list.
  let allowed = new Map<string, CompincCarrier>();
  for (const c of activeCarriers) {
    if (c.compulife_id) {
      allowed.set(c.id, { id: c.id, compulifeId: c.compulife_id, name: c.name });
    }
  }
  if (allowed.size === 0) return null;

  // Filter 3 — product family availability.
  const { data: productRules, error: productError } = await supabase
    .from('carrier_product_rules')
    .select('carrier_id')
    .eq('product_family', productFamily)
    .eq('is_active', true)
    .in('carrier_id', Array.from(allowed.keys()));
  if (productError) throw productError;
  allowed = intersect(allowed, productRules?.map((r) => r.carrier_id));
  if (allowed.size === 0) return null;

  // Filter 4 — state availability.
  const { data: stateRules, error: stateError } = await supabase
    .from('carrier_state_rules')
    .select('carrier_id')
    .eq('state', state)
    .eq('is_active', true)
    .in('carrier_id', Array.from(allowed.keys()));
  if (stateError) throw stateError;
  allowed = intersect(allowed, stateRules?.map((r) => r.carrier_id));
  if (allowed.size === 0) return null;

  // Filter 5 — agent appointment approved by admin.
  if (context === 'agent' && agentId) {
    const { data: permissions, error: permError } = await supabase
      .from('agent_carrier_permissions')
      .select('carrier_id')
      .eq('agent_id', agentId)
      .eq('status', 'approved')
      .in('carrier_id', Array.from(allowed.keys()));
    if (permError) throw permError;
    allowed = intersect(allowed, permissions?.map((r) => r.carrier_id));
    if (allowed.size === 0) return null;
  }

  const carriers = Array.from(allowed.values());
  return {
    compinc: carriers.map((c) => c.compulifeId).join(','),
    carrierIds: carriers.map((c) => c.id),
    carriers,
  };
}

/** Keep only the carriers whose ids appear in `keepIds`. */
function intersect(
  current: Map<string, CompincCarrier>,
  keepIds: string[] | undefined,
): Map<string, CompincCarrier> {
  const keep = new Set(keepIds ?? []);
  const next = new Map<string, CompincCarrier>();
  current.forEach((carrier, id) => {
    if (keep.has(id)) next.set(id, carrier);
  });
  return next;
}
