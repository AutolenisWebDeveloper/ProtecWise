---
name: protecwise-api
description: >
  The standard pattern for every API route in the ProtecWise platform.
  Use this skill whenever writing ANY Next.js API route handler — quote runs,
  application saves, agent actions, admin operations, cron jobs, or auth flows.
  Do not write a route handler without reading this skill first. It defines
  auth, validation, error handling, response format, and activity logging
  patterns that every route must follow.
---

# ProtecWise API Route Skill

## Every Route Follows This Exact Pattern

```typescript
// app/api/[domain]/[action]/route.ts

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { Database } from '@/types/supabase';

// 1. Define the request schema with Zod
const RequestSchema = z.object({
  fieldName: z.string().min(1, 'Field name is required'),
  // add all fields
});

export async function POST(req: NextRequest) {
  try {
    // 2. Auth check — always first
    const supabase = createRouteHandlerClient<Database>({ cookies });
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError || !session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 3. Role check (if route is role-specific)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profile?.role !== 'agent') {  // or 'admin', 'client', etc.
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 4. Parse and validate request body
    const body = await req.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { fieldName } = parsed.data;

    // 5. Business logic + database operation
    const { data, error } = await supabase
      .from('table_name')
      .insert({ field_name: fieldName })
      .select()
      .single();

    if (error) {
      console.error('[route-name] DB error:', error);
      return NextResponse.json(
        { error: 'Operation failed. Please try again.' },
        { status: 500 }
      );
    }

    // 6. Log to activity_log (for all write operations)
    await supabase.from('activity_log').insert({
      entity_type: 'entity_type',
      entity_id: data.id,
      actor_id: session.user.id,
      actor_type: profile.role,
      action: 'action_name',
      metadata: { relevant: 'context' }
    });

    // 7. Return typed success response
    return NextResponse.json({ success: true, data }, { status: 201 });

  } catch (error) {
    console.error('[route-name] Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
```

## Auth Patterns by Route Type

### Public route (no auth required)
```typescript
// Quote run, shared quote view, unsubscribe
// Do NOT call getSession() — skip auth check entirely
// Still validate all inputs with Zod
```

### Client route
```typescript
if (profile?.role !== 'client') {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
// Scope all queries to client's email:
// .eq('email', session.user.email)
```

### Agent route
```typescript
if (profile?.role !== 'agent') {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
// Get agent record for agent_id:
const { data: agent } = await supabase
  .from('agents')
  .select('id, status')
  .eq('user_id', session.user.id)
  .single();

if (agent?.status !== 'active') {
  return NextResponse.json({ error: 'Account not active' }, { status: 403 });
}
// Scope all queries to agent.id
```

### Admin route
```typescript
if (profile?.role !== 'admin') {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
// Admins see everything — no scoping required
// Use supabase with service role for operations that bypass RLS
```

### Cron route
```typescript
// Always the very first check — before any other logic
const authHeader = req.headers.get('Authorization');
if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
// Use service role client for cron operations
import { createClient } from '@supabase/supabase-js';
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

## CompuLife Quote Routes — Special Pattern

```typescript
// ALWAYS before any CompuLife API call:
import { buildCOMPINC } from '@/lib/carriers';

const compinc = await buildCOMPINC({
  productFamily: parsed.data.productFamily,
  stateCode: STATE_CODES[parsed.data.state],
  context: 'client', // or 'agent'
  agentId: agent?.id, // required when context='agent'
});

if (!compinc) {
  return NextResponse.json(
    { error: 'No approved carriers available for this product and state. Please contact us.' },
    { status: 422 }
  );
}

// Check monthly quote limit BEFORE calling proxy
const { data: quoteCounts } = await supabase
  .from('monthly_quote_count')
  .select('total_quotes')
  .single();

const limit = parseInt(process.env.COMPULIFE_MONTHLY_QUOTE_HARD_LIMIT || '1000');
if ((quoteCounts?.total_quotes ?? 0) >= limit) {
  return NextResponse.json(
    { error: 'Quote system temporarily at capacity. Please contact us directly.' },
    { status: 429 }
  );
}

// Call proxy (NEVER call CompuLife directly from Vercel)
// Proxy is running on 34.16.56.64 — the IP registered with CompuLife
// Dev auth ID: 66b12312b (500 request limit — development only)
// Production auth ID: stored in COMPULIFE_AUTH_ID on proxy server
const proxyResponse = await fetch(`${process.env.COMPULIFE_PROXY_URL}/quote`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-proxy-secret': process.env.PROXY_SECRET!,
  },
  body: JSON.stringify({
    requestType: 'request',
    params: {
      // proxy/server.js injects COMPULIFEAUTHORIZATIONID and REMOTE_IP automatically
      // DO NOT send these from Next.js — they are server-side secrets on the proxy
      COMPINC: compinc,
      // ... all other CompuLife params
    }
  }),
  signal: AbortSignal.timeout(20000),
});

// ALWAYS check for CompuLife auth failure — empty results ≠ no carriers
const quoteData = await proxyResponse.json();
if (!quoteData.Compulife_ComparisonResults) {
  console.error('[quote/run] CompuLife returned no results:', quoteData);
  return NextResponse.json(
    { error: 'No quotes available for this profile. Try different inputs or contact an advisor.' },
    { status: 422 }
  );
}
```

## Response Format Standards

```typescript
// Success (200/201):
{ success: true, data: T }

// Success with message (202):
{ success: true, message: 'Quote sent to client.' }

// Validation error (400):
{ error: 'Validation failed', details: ZodFlattenedError }

// Auth error (401):
{ error: 'Unauthorized' }

// Permission error (403):
{ error: 'Forbidden' }

// Not found (404):
{ error: 'Resource not found.' }

// Business logic error (422):
{ error: 'Specific business reason.' }

// Rate limit (429):
{ error: 'Specific capacity message.' }

// Server error (500):
{ error: 'An unexpected error occurred.' }
// NEVER expose raw database errors to client
// ALWAYS log the full error to console with route name prefix: [quote/run]
```

## Activity Logging — When to Log

Log to `activity_log` for ALL of these:
```typescript
// Write operations that change important state:
'quote_created' | 'quote_viewed' | 'quote_modified'
'apply_clicked' | 'application_started' | 'application_step_completed'
'application_submitted' | 'application_abandoned'
'lead_created' | 'lead_status_changed' | 'lead_assigned'
'agent_activated' | 'agent_suspended' | 'agent_onboarding_step'
'carrier_activated' | 'carrier_deactivated'
'carrier_permission_approved' | 'carrier_permission_denied'
'document_uploaded' | 'document_requested'
'message_sent'
'task_created' | 'task_completed'
'candidate_applied' | 'candidate_stage_changed'
'commission_recorded' | 'compliance_updated'
```

Do NOT log read operations (GET requests) unless specifically required for audit.

## File Upload Routes

```typescript
// Always validate server-side (not just client-side):
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

const formData = await req.formData();
const file = formData.get('file') as File;

if (!file) {
  return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
}
if (!ALLOWED_TYPES.includes(file.type)) {
  return NextResponse.json({ error: 'Invalid file type. Upload a PDF, JPG, PNG, or WebP.' }, { status: 400 });
}
if (file.size > MAX_SIZE_BYTES) {
  return NextResponse.json({ error: 'File too large. Maximum size is 10MB.' }, { status: 400 });
}

// Upload to Supabase Storage
const { data, error } = await supabase.storage
  .from('documents')
  .upload(`${folder}/${agentId}/${nanoid()}.${extension}`, file, {
    contentType: file.type,
    upsert: false,
  });
```

## Email Sending in Routes

```typescript
import { sendQuoteCopyEmail } from '@/lib/email';

// Always use the typed send function from lib/email.ts
// Never call Resend directly in route handlers
// The send function handles: opt-out check, frequency throttle, logging

await sendQuoteCopyEmail({
  to: lead.email,
  leadName: lead.full_name,
  shareToken: quote.share_token,
  topResults: parsedResults.slice(0, 3),
  isNewClient: isNewClient,
});
```

## SMS in Routes

```typescript
import { sendQuoteReminderSMS } from '@/lib/sms';

// Always use the typed send function from lib/sms.ts
// The send function handles: TCPA consent check, quiet hours, logging
// NEVER call Twilio directly in route handlers

await sendQuoteReminderSMS({
  leadId: lead.id,
  phone: lead.phone,
  message: `Hi ${firstName}, your ProtecWise quote is waiting. View it: ${url}`,
});
```
