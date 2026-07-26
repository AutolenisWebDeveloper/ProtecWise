---
name: protecwise-database
description: >
  Supabase database patterns, migration writing standards, RLS policy templates,
  and query optimization rules for ProtecWise. Use this skill whenever writing
  a database migration, creating a new table, writing a Supabase query, setting
  up RLS policies, or generating TypeScript types. Do not write any database
  code for ProtecWise without reading this first.
---

# ProtecWise Database Skill

## Migration File Standards

Every migration file follows this pattern:
```
supabase/migrations/NNN_description.sql
```
- `NNN` = 3-digit zero-padded number (001, 002, ... 099, 100)
- Migrations run in ascending numeric order
- Each file is idempotent: use `IF NOT EXISTS`, `ON CONFLICT DO NOTHING`
- Every migration includes a comment block at the top

```sql
-- ============================================================
-- Migration NNN: description
-- Created: YYYY-MM-DD
-- Purpose: What this migration does and why
-- Depends on: migration NNN (if applicable)
-- ============================================================
```

## Table Structure Standard

Every table in ProtecWise follows this pattern:

```sql
CREATE TABLE table_name (
  -- Primary key — always UUID
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Foreign keys (if applicable)
  foreign_id UUID REFERENCES other_table(id) ON DELETE CASCADE,

  -- Status column (if applicable)
  status TEXT NOT NULL DEFAULT 'value' CHECK (status IN ('a', 'b', 'c')),

  -- Business columns
  -- ...

  -- JSONB for flexible/nested data
  metadata JSONB DEFAULT '{}',

  -- Audit columns — EVERY table gets these
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Updated_at trigger — EVERY table gets this
CREATE OR REPLACE TRIGGER set_updated_at
  BEFORE UPDATE ON table_name
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

Create the trigger function once in migration 001:
```sql
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## RLS Policy Patterns

Enable RLS on EVERY table. Then apply the right policy pattern:

### Pattern 1 — Own record (profiles, clients, agents)
```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

-- User sees only their own record
CREATE POLICY "table_own_record" ON table_name
  FOR ALL
  USING (user_id = auth.uid());
```

### Pattern 2 — Agent sees own + Admin sees all
```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;

CREATE POLICY "table_agent_or_admin" ON table_name
  FOR ALL
  USING (
    agent_id IN (
      SELECT id FROM agents WHERE user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### Pattern 3 — Client sees own (by email)
```sql
CREATE POLICY "table_client_own" ON table_name
  FOR SELECT
  USING (
    email = (
      SELECT email FROM auth.users WHERE id = auth.uid()
    )
  );
```

### Pattern 4 — Admin only (write)
```sql
CREATE POLICY "table_admin_write" ON table_name
  FOR INSERT UPDATE DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "table_auth_read" ON table_name
  FOR SELECT
  USING (auth.uid() IS NOT NULL);
```

### Pattern 5 — Service role bypasses all (cron jobs, admin operations)
```typescript
// In server code that needs to bypass RLS:
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);
// Use supabaseAdmin ONLY in server-side code (API routes, cron jobs)
// NEVER expose service role key to client
```

## Index Standards

Create indexes for every:
- Foreign key column
- Status column used in WHERE clauses
- Token/lookup columns (share_token, resume_token, unsubscribe_token)
- Email columns used for lookups
- Date columns used in range queries
- Composite columns used together in WHERE

```sql
-- Foreign key index
CREATE INDEX idx_quotes_lead_id ON quotes(lead_id);
CREATE INDEX idx_quotes_agent_id ON quotes(agent_id);

-- Lookup index
CREATE INDEX idx_quotes_share_token ON quotes(share_token);

-- Status + date composite (for cron queries)
CREATE INDEX idx_quotes_reminders ON quotes(created_at, reminder_1_sent_at)
  WHERE apply_clicked_at IS NULL;

-- Full-text search (for CRM search)
CREATE INDEX idx_leads_fts ON leads
  USING gin(to_tsvector('english', coalesce(full_name,'') || ' ' || coalesce(email,'')));
```

## Query Patterns

### Standard CRUD (Supabase client)
```typescript
// SELECT with type safety
const { data, error } = await supabase
  .from('leads')
  .select('id, full_name, email, status, created_at')
  .eq('agent_id', agentId)
  .order('created_at', { ascending: false })
  .limit(50);

// INSERT and return the new record
const { data, error } = await supabase
  .from('leads')
  .insert({ full_name, email, agent_id, source: 'website' })
  .select()
  .single();

// UPSERT by email (lead creation from quote)
const { data, error } = await supabase
  .from('leads')
  .upsert(
    { email, full_name, agent_id, source },
    { onConflict: 'email', ignoreDuplicates: false }
  )
  .select()
  .single();

// UPDATE and return
const { data, error } = await supabase
  .from('leads')
  .update({ status: 'quoted', updated_at: new Date().toISOString() })
  .eq('id', leadId)
  .eq('agent_id', agentId) // always scope to agent for security
  .select()
  .single();
```

### Pagination (for large lists)
```typescript
const { data, error, count } = await supabase
  .from('leads')
  .select('*', { count: 'exact' })
  .eq('agent_id', agentId)
  .range(page * pageSize, (page + 1) * pageSize - 1)
  .order('created_at', { ascending: false });
```

### Full-text search (CRM search)
```typescript
const { data } = await supabase
  .from('leads')
  .select('*')
  .textSearch('full_name', searchQuery, { type: 'websearch' })
  .eq('agent_id', agentId)
  .limit(20);
```

### Realtime subscription (messaging)
```typescript
const channel = supabase
  .channel(`messages-${threadId}`)
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `thread_id=eq.${threadId}`,
    },
    (payload) => {
      setMessages(prev => [...prev, payload.new as Message]);
    }
  )
  .subscribe();

// Always unsubscribe on component unmount
return () => { supabase.removeChannel(channel); };
```

## Encryption for PHI and Financial Data

```sql
-- Enable pgcrypto extension (in migration 001)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Encrypted columns use TEXT type (encrypted value stored as base64)
-- Mark them clearly in the schema
CREATE TABLE applications (
  -- ...
  ssn_last_four_encrypted TEXT,        -- ENCRYPTED: pgcrypto symmetric
  bank_account_encrypted TEXT,         -- ENCRYPTED: pgcrypto symmetric
  bank_routing_encrypted TEXT,         -- ENCRYPTED: pgcrypto symmetric
  -- ...
);
```

```typescript
// Encrypt before storing
const encrypted = Buffer.from(
  JSON.stringify(plaintext)
).toString('base64'); // Simple approach for prototype
// Production: use pgcrypto pgp_sym_encrypt with ENCRYPTION_KEY env var

// Decrypt for authorized access
const decrypted = JSON.parse(
  Buffer.from(encrypted, 'base64').toString('utf8')
);
```

## TypeScript Types

Always generate types after schema changes:
```bash
pnpm supabase gen types typescript --local > src/types/supabase.ts
```

Extend generated types with domain types:
```typescript
// src/types/index.ts
import type { Database } from './supabase';

export type Lead = Database['public']['Tables']['leads']['Row'];
export type LeadInsert = Database['public']['Tables']['leads']['Insert'];
export type LeadUpdate = Database['public']['Tables']['leads']['Update'];

export type Quote = Database['public']['Tables']['quotes']['Row'];
// ... all tables

// Domain types built from DB types
export type QuoteWithLead = Quote & {
  leads: Pick<Lead, 'full_name' | 'email' | 'phone'>;
};
```

## JSONB Column Standards

When a column stores structured data as JSONB, define its TypeScript type explicitly:

```typescript
// src/types/index.ts

// applications.step_2_personal_info
export interface PersonalInfoStep {
  legal_first_name: string;
  legal_middle_name?: string;
  legal_last_name: string;
  date_of_birth: string;      // ISO date string
  gender: 'M' | 'F';
  marital_status: 'single' | 'married' | 'divorced' | 'widowed';
  ssn_last_four_encrypted?: string;
  phone: string;              // E.164 format
  email: string;
  current_address: Address;
  mailing_address?: Address;
  citizenship: 'us_citizen' | 'permanent_resident' | 'other';
  drivers_license_number?: string;
  drivers_license_state?: string;
}

// Use in API routes with Zod validation that matches:
const PersonalInfoSchema = z.object({
  legal_first_name: z.string().min(1),
  // ...
});
```

## Common Mistakes to Avoid

1. **Never** query without WHERE when scoped data is expected — always add agent_id or email filter
2. **Never** store sensitive data (SSN, banking) in plaintext
3. **Never** skip the `updated_at` trigger — every table needs it
4. **Never** use `select('*')` in production — always specify columns
5. **Always** check for error before using data: `if (error) throw error`
6. **Always** add index on foreign keys — Supabase doesn't do this automatically
7. **Always** use `single()` when expecting one record — it throws if 0 or 2+ are returned
8. **Always** scope queries to the authenticated entity (agent, client, candidate)
