---
name: protecwise-forms
description: >
  CompuLife Forms Library implementation for ProtecWise. Use this skill whenever
  building: the /agent/forms page, the forms modal in agent application detail,
  forms status tracking in the application workflow, the forms fallback experience,
  or any feature that touches carrier application PDF forms. The forms library
  is an iframe embed — not an API — and this skill defines exactly how to implement
  it, what it can and cannot do, and how to handle every edge case.
---

# ProtecWise Forms Library Skill

## What This Is

The CompuLife Forms Library is a web service that provides access to carrier
application forms for every carrier CompuLife supports.

```
ProtecWise URL: https://www.goforforms.com/FORMS/FormsEngine.php?ID=1354
Account ID:     1354 (ProtecWise-specific — never change this number)
Access method:  iframe embed only
Authentication: None required — the URL with ID=1354 is the access credential
Server-side:    Not needed — iframe loads directly in browser
```

## What It Does and Does Not Do

```
DOES:
✓ Display carrier application forms
✓ Filter by carrier name (inside the iframe)
✓ Filter by state (inside the iframe)
✓ Filter by form category (inside the iframe)
✓ Allow agents to search for specific forms
✓ Allow download of carrier PDFs
✓ Allow email of forms to client or agent
✓ Update automatically when CompuLife adds/changes forms

DOES NOT:
✗ Provide an API — cannot query form availability programmatically
✗ Return data to our application — cross-origin, no DOM access
✗ Tell us which carriers have forms available
✗ Tell us if a specific form is missing
✗ Accept URL parameters to pre-filter by carrier
✗ Work as a data source for our carrier registry
```

## Three Places It Appears in the Platform

### Location 1 — `/agent/forms` — Primary Forms Page

Full-page embed for agents. This is where agents go after selecting a
carrier from quote results to find and download the application forms.

```tsx
// src/app/agent/forms/page.tsx
'use client';
import { useState } from 'react';

export default function AgentFormsPage() {
  const [iframeError, setIframeError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const FORMS_URL = process.env.NEXT_PUBLIC_COMPULIFE_FORMS_URL!;

  return (
    <div className="flex flex-col h-full">
      {/* Page header */}
      <div className="flex items-center justify-between p-6 border-b border-[#E2E8F0]">
        <div>
          <h1 className="text-xl font-bold text-[#1B3D8B]">
            Carrier Application Forms
          </h1>
          <p className="text-sm text-[#718096] mt-1">
            Search, filter, and download carrier application forms.
            Use the carrier name or state filter to find the right forms.
          </p>
        </div>
        {/* Direct link fallback always visible */}
        <a
          href={FORMS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-[#1B3D8B] underline"
        >
          Open in new tab ↗
        </a>
      </div>

      {/* Loading state */}
      {isLoading && !iframeError && (
        <div className="flex items-center justify-center py-16 text-[#718096]">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-[#1B3D8B] border-t-transparent
                            rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm">Loading forms library...</p>
          </div>
        </div>
      )}

      {/* Fallback when iframe fails */}
      {iframeError && (
        <FormsLibraryFallback formsUrl={FORMS_URL} />
      )}

      {/* The iframe */}
      {!iframeError && (
        <iframe
          src={FORMS_URL}
          width="100%"
          style={{
            border: 'none',
            flex: 1,
            minHeight: '900px',
            display: isLoading ? 'none' : 'block',
          }}
          title="ProtecWise Carrier Application Forms Library"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setIframeError(true);
            // Log and notify admin
            handleIframeFailure();
          }}
        />
      )}
    </div>
  );
}

async function handleIframeFailure() {
  try {
    await fetch('/api/agent/forms/iframe-failure', { method: 'POST' });
  } catch {
    // Silent — failure logging shouldn't break UX
  }
}
```

### Location 2 — Application Detail Modal

When an agent reviews an application and needs to pull up carrier forms
without leaving the page, open the forms library in a modal/sheet.

```tsx
// In AgentApplicationDetail component:
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

const [formsOpen, setFormsOpen] = useState(false);
const FORMS_URL = process.env.NEXT_PUBLIC_COMPULIFE_FORMS_URL!;

// Trigger button in forms execution section:
<button
  onClick={() => setFormsOpen(true)}
  className="btn-primary"
>
  Open Forms Library
</button>

// The sheet:
<Sheet open={formsOpen} onOpenChange={setFormsOpen}>
  <SheetContent side="right" className="w-full sm:max-w-3xl p-0">
    <SheetHeader className="p-6 border-b border-[#E2E8F0]">
      <SheetTitle className="text-[#1B3D8B]">Carrier Application Forms</SheetTitle>
      <p className="text-sm text-[#718096]">
        Search for <strong>{application.carrier_snapshot}</strong> forms below.
      </p>
    </SheetHeader>
    <iframe
      src={FORMS_URL}
      width="100%"
      height="100%"
      style={{ border: 'none', minHeight: '80vh' }}
      title="Carrier Forms Library"
    />
  </SheetContent>
</Sheet>
```

### Location 3 — Lead Detail Quick Access

```tsx
// In AgentLeadDetail component action panel:
<a
  href={process.env.NEXT_PUBLIC_COMPULIFE_FORMS_URL}
  target="_blank"
  rel="noopener noreferrer"
  className="btn-outline w-full"
>
  Open Forms Library ↗
</a>
```

---

## Forms Status Tracking

The forms status lives on the `applications` table, not in the forms library
(which we cannot query). Agents manually update status as they work.

```typescript
// applications.forms_status field:
type FormsStatus = 
  | 'not_started'       // Application submitted, forms not yet accessed
  | 'forms_opened'      // Agent opened the forms library
  | 'forms_sent'        // Agent sent forms to client
  | 'waiting_on_client' // Waiting for client to complete/return forms
  | 'submitted'         // Application submitted to carrier

// Status display in agent application detail:
const FORMS_STATUS_LABELS = {
  not_started:       { label: 'Not Started',        color: 'gray'   },
  forms_opened:      { label: 'Forms Opened',        color: 'blue'   },
  forms_sent:        { label: 'Forms Sent',          color: 'amber'  },
  waiting_on_client: { label: 'Waiting on Client',   color: 'amber'  },
  submitted:         { label: 'Submitted to Carrier', color: 'green'  },
};
```

### Status Update API Route

```typescript
// PATCH /api/agent/applications/[id]/forms-status
// Called when agent updates the dropdown

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  // ... auth checks ...

  const { forms_status } = await req.json();

  // Timestamp fields based on new status
  const timestamps: Record<string, string | null> = {};
  if (forms_status === 'forms_opened' && !application.forms_opened_at) {
    timestamps.forms_opened_at = new Date().toISOString();
  }
  if (forms_status === 'forms_sent' && !application.forms_sent_at) {
    timestamps.forms_sent_at = new Date().toISOString();
  }
  if (forms_status === 'submitted' && !application.forms_submitted_at) {
    timestamps.forms_submitted_at = new Date().toISOString();
    // Update lead status to 'submitted' and log activity
  }

  await supabase
    .from('applications')
    .update({ forms_status, ...timestamps })
    .eq('id', params.id)
    .eq('agent_id', agentId);

  await logActivity('application', params.id, agentId, 'agent', 'forms_status_updated',
    { from: application.forms_status, to: forms_status });

  return NextResponse.json({ success: true });
}
```

---

## Fallback Component

```tsx
// src/components/forms/FormsLibraryFallback.tsx
interface FormsLibraryFallbackProps {
  formsUrl: string;
}

export function FormsLibraryFallback({ formsUrl }: FormsLibraryFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
      {/* Warning icon */}
      <div className="w-16 h-16 bg-[#FEF3E2] rounded-full flex items-center
                      justify-center mb-6">
        <span className="text-2xl">⚠️</span>
      </div>

      <h3 className="text-lg font-semibold text-[#1B3D8B] mb-2">
        Forms Library Temporarily Unavailable
      </h3>
      <p className="text-sm text-[#718096] max-w-md mb-8">
        The carrier forms library could not load. This is usually a temporary issue.
        You can access it directly using the link below.
      </p>

      {/* Primary action — open in new tab */}
      <a
        href={formsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-[#1B3D8B] text-white
                   px-6 py-3 rounded-lg font-medium hover:bg-[#142D6A] transition-colors
                   mb-4"
      >
        Open Forms Library in New Tab ↗
      </a>

      {/* Secondary action — contact support */}
      <p className="text-xs text-[#718096]">
        If this persists, contact{' '}
        <a href="mailto:support@protecwise.com" className="underline">
          ProtecWise support
        </a>
      </p>
    </div>
  );
}
```

---

## API Route — Iframe Failure Logging

```typescript
// src/app/api/agent/forms/iframe-failure/route.ts

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: agent } = await supabase
    .from('agents').select('id').eq('user_id', session.user.id).single();

  // Log the failure
  await supabase.from('activity_log').insert({
    entity_type: 'agent',
    entity_id: agent?.id,
    actor_id: session.user.id,
    actor_type: 'system',
    action: 'forms_iframe_failed',
    metadata: {
      url: process.env.NEXT_PUBLIC_COMPULIFE_FORMS_URL,
      user_agent: req.headers.get('user-agent'),
      timestamp: new Date().toISOString(),
    }
  });

  // Send admin notification (fire and forget)
  sendFormsFailureAlert(session.user.email || 'unknown').catch(console.error);

  return NextResponse.json({ logged: true });
}
```

---

## Agent Workflow — Full Forms Execution Flow

```
1. Client completes 8-step application intake and submits
2. Agent receives Email 14: "Client submitted their application"
3. Agent opens application in agent portal
4. Agent reviews step data (needs, beneficiaries, health overview, etc.)
5. Agent clicks "Open Forms Library" in Forms Execution section
6. Agent searches for [carrier name] in the goforforms iframe
7. Agent filters by client's state if multiple versions available
8. Agent downloads the carrier application PDF
9. Agent completes agency/agent sections of the PDF
10. Agent sends PDF to client via email with completion instructions
   → Agent updates forms_status to 'forms_sent'
11. Client completes their sections and returns signed PDF
   → Agent updates forms_status to 'waiting_on_client' → 'forms_sent' resolved
12. Agent reviews completed application for NIGO issues
13. Agent submits to carrier (via carrier portal, email, or fax)
   → Agent updates forms_status to 'submitted'
   → Lead status updates to 'submitted'
14. Platform scope ends here — carrier handles underwriting
```

---

## Environment Variable

```bash
# .env.local and Vercel environment variables
NEXT_PUBLIC_COMPULIFE_FORMS_URL=https://www.goforforms.com/FORMS/FormsEngine.php?ID=1354

# The ID=1354 is ProtecWise's account identifier
# NEXT_PUBLIC prefix is required — this URL is used client-side in the iframe
# This URL is not sensitive — it is publicly accessible with the ID embedded
```

---

## Mobile Considerations

The goforforms iframe is designed for desktop use. On mobile (375px):
- The iframe renders but may require horizontal scrolling inside it
- Provide prominent "Open in new tab ↗" link above the iframe on mobile
- Detect mobile and show the fallback + direct link instead of embedding:

```tsx
const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

if (isMobile) {
  return (
    <div className="p-6 text-center">
      <p className="text-sm text-[#718096] mb-4">
        The forms library works best on desktop.
        Open it in your mobile browser:
      </p>
      <a href={FORMS_URL} target="_blank" className="btn-primary">
        Open Forms Library ↗
      </a>
    </div>
  );
}
```
