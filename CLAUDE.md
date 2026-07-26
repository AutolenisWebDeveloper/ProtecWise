# ProtecWise — Claude Code Project Brain
# Read this file at the start of every session before writing any code.
---
## WHAT THIS IS
ProtecWise is a complete Life Insurance Brokerage Operating Platform built for an
independent life insurance brokerage (not a carrier). It has three business divisions:
1. **Consumer Sales Platform** — public website, quoting, client portal, application intake
2. **Brokerage Operations Platform** — agent CRM, pipeline, needs analysis, compliance, commissions
3. **Agent Recruiting Platform** — recruiting website, candidate portal, recruiting CRM
The platform's responsibility ends when a completed application is submitted to the carrier.
We do not build underwriting engines, policy administration, claims, or premium collection.
---
## TECHNOLOGY STACK — NEVER DEVIATE
```
Framework:        Next.js 14 (App Router) — TypeScript strict mode
Styling:          Tailwind CSS + shadcn/ui
Database:         Supabase (PostgreSQL + Auth + Storage + Realtime)
Email:            Resend + React Email
SMS:              Twilio
Calendar:         @fullcalendar/react (in-platform) + optional Calendly embed
Data tables:      TanStack Table v8
Forms:            React Hook Form + Zod
State:            Zustand (complex portal state only)
Charts:           Recharts
PDF:              @react-pdf/renderer
E-signature:      Custom native system — signature_pad (canvas) + pdf-lib (injection) + Web Crypto API (hashing)
Search:           Supabase full-text search
Real-time:        Supabase Realtime (messaging + live updates)
Cron:             Vercel Cron Jobs
Deployment:       Vercel
Package manager:  pnpm
Quote engine:     CompuLife API (via fixed-IP proxy server in /proxy)
Error tracking:   Sentry
Analytics:        Vercel Analytics
Testing:          Vitest (unit) + Playwright (E2E)
```
---
## BRAND COLORS — USE EVERYWHERE
```css
--brand-navy:        #1B3D8B;   /* "Protec" — primary color, headers, sidebars, headings */
--brand-green:       #4AAE2E;   /* "Wise"   — CTAs, success, accent, Best Value badge */
--brand-blue:        #4A9ED6;   /* Shield   — secondary, info states, links */
--brand-navy-hover:  #142D6A;
--brand-green-hover: #3A9020;
--brand-navy-tint:   #E8EEF9;
--brand-green-tint:  #EBF6E5;
--brand-blue-tint:   #EDF5FC;
```
Logo file: `/public/protecwiselogo.png` — always use this file, never recreate the logo.
Two-tone wordmark: "Protec" in #1B3D8B, "Wise" in #4AAE2E.
---
## ARCHITECTURE RULES
### File structure
```
protecwise/
├── CLAUDE.md
├── proxy/                    ← CompuLife fixed-IP proxy (separate Node.js app)
│   └── server.js
├── supabase/
│   └── migrations/           ← numbered SQL files, run in order
├── src/
│   ├── app/
│   │   ├── (public)/         ← consumer-facing, no auth required
│   │   ├── (auth)/           ← login, register, reset password
│   │   ├── client/           ← client portal (magic link auth)
│   │   ├── agent/            ← agent portal + all brokerage ops
│   │   ├── admin/            ← admin system
│   │   ├── recruiting/       ← public recruiting website
│   │   ├── candidates/       ← candidate portal
│   │   └── api/              ← ALL API routes here
│   ├── components/
│   │   ├── ui/               ← shadcn/ui base (never modify these)
│   │   ├── layout/           ← headers, sidebars, footers
│   │   ├── forms/            ← reusable form fields with RHF
│   │   ├── tables/           ← TanStack table wrappers
│   │   ├── charts/           ← Recharts wrappers
│   │   └── emails/           ← React Email templates (all 22+)
│   ├── lib/
│   │   ├── supabase.ts       ← client factory (server/client/middleware)
│   │   ├── carriers.ts       ← buildCOMPINC() — MUST be called before every quote
│   │   ├── email.ts          ← all Resend send functions
│   │   ├── sms.ts            ← all Twilio send functions
│   │   ├── auth.ts           ← session helpers + role checks
│   │   └── validations/      ← Zod schemas organized by domain
│   ├── hooks/                ← custom React hooks
│   ├── stores/               ← Zustand stores (CRM state, calendar, messaging)
│   └── types/                ← shared TypeScript interfaces
```
### Naming conventions
- Files: `kebab-case.tsx`
- Components: `PascalCase`
- Hooks: `useFeatureName.ts`
- Stores: `useFeatureStore.ts`
- API routes: `app/api/[domain]/[action]/route.ts`
- Database migrations: `001_description.sql`, `002_description.sql`
### Data fetching pattern
- Server components fetch directly via Supabase server client
- Client components use SWR or react-query for client-side fetching
- API routes use Supabase route handler client
- Never fetch from the client directly to CompuLife — always via `/api/compulife/proxy`
---
## COMPULIFE FORMS LIBRARY — ARCHITECTURE
ProtecWise's carrier application forms are served via the CompuLife Forms Library:
```
URL: https://www.goforforms.com/FORMS/FormsEngine.php?ID=1354
Account ID: 1354 (ProtecWise-specific — never change this)
Stored in: NEXT_PUBLIC_COMPULIFE_FORMS_URL environment variable
```
### Critical Architecture Rules
**This is an iframe embed — NOT an API. This distinction is absolute.**
```
What goforforms.com IS:
  ✓ A web page that displays carrier PDF application forms
  ✓ Filterable by carrier, state, product category (inside the iframe)
  ✓ Allows agents to search, view, download, and email carrier forms
  ✓ Embeddable in any page via <iframe src="...">
What goforforms.com is NOT:
  ✗ A REST API — cannot query it programmatically
  ✗ A carrier database — cannot pull form availability into our DB
  ✗ Automatable — cannot detect which forms exist or are missing
  ✗ Cross-origin readable — cannot read its DOM from our app
```
### How It Appears in the Platform
**Three locations where the iframe is embedded:**
1. **`/agent/forms`** — Full-page embed (900px height minimum), primary access point
2. **Agent application detail** — Modal overlay when agent clicks "Open Forms Library"
3. **Agent lead detail** — Quick access button opens `/agent/forms` in new tab
### iframe Implementation
```tsx
// Always use the env var — never hardcode the URL
const FORMS_URL = process.env.NEXT_PUBLIC_COMPULIFE_FORMS_URL;
<iframe
  src={FORMS_URL}
  width="100%"
  height="900"
  style={{ border: 'none', minHeight: '900px' }}
  title="ProtecWise Carrier Forms Library"
  allow="downloads"
/>
```
### Fallback When iframe Fails to Load
```tsx
// Detect iframe load failure with onError + timeout pattern
// If iframe fails:
// 1. Show professional message: "Forms library temporarily unavailable."
// 2. Provide direct link: <a href={FORMS_URL} target="_blank">Open in new tab →</a>
// 3. Log to activity_log: {action: 'forms_iframe_failed', entity_type: 'agent'}
// 4. Send admin notification email
```
### What Agents Do With This
```
Quote completes → Agent selects carrier → Agent opens Forms Library
→ Searches/filters by carrier name in the iframe
→ Downloads or emails the application PDF
→ Sends PDF to client for completion
→ Agent tracks forms status in application detail:
   Not Started → Forms Opened → Forms Sent → Waiting on Client → Submitted
```
## CRITICAL CONSTRAINTS
### CompuLife API
- Authorization ID is locked to ONE server IP address
- Vercel serverless = rotating IPs = incompatible with CompuLife directly
- ALL CompuLife calls → `/api/compulife/proxy` → `proxy/server.js` (fixed-IP host)
- `proxy/server.js` injects the auth ID server-side
- `COMPULIFEAUTHORIZATIONID` must NEVER appear in browser network calls
- Call `buildCOMPINC()` from `lib/carriers.ts` before EVERY quote request
### Carrier permission system (non-negotiable)
- Every quote result must pass through carrier permission filtering
- `buildCOMPINC()` runs 5 filters: global active → client visible → product family → state → agent permissions
- Raw CompuLife carrier list must never be shown to clients or agents unfiltered
- Store `compinc_used` on every quote record
### Authentication model
- Agents/Admins: Supabase Auth email + password
- Clients: Magic link only (no password)
- Candidates: Email + password (recruiting portal)
- All roles defined in `profiles.role`: 'admin' | 'agent' | 'client' | 'candidate' | 'recruiter'
### Never do these things
- Never use `any` TypeScript type
- Never call CompuLife from the browser
- Never show raw CompuLife carrier data without filtering
- Never write placeholder code or TODO comments
- Never use `alert()` — always use toast/inline errors
- Never hardcode colors — always use CSS variables
- Never put secrets in client-side code
---
## DATABASE — 25+ TABLES
Core tables (migrations must be run in this order):
1. profiles (extends auth.users)
2. agents
3. clients
4. candidates
5. carriers
6. carrier_product_rules
7. carrier_state_rules
8. agent_carrier_permissions
9. agent_carrier_preferences
10. leads
11. households
12. contacts
13. opportunities
14. quotes
15. applications
16. documents
17. tasks
18. calendar_events
19. messages
20. message_threads
21. commissions
22. compliance_records
23. recruiting_pipeline
24. workflow_automations
25. activity_log
26. email_log
27. notifications
28. client_auth_tokens
29. password_resets
All tables have RLS enabled. All writes go through typed API routes.
---
## ENVIRONMENT VARIABLES
```bash
# CompuLife API
# Registered deployment IP: 34.16.56.64 (Google Cloud — this IP is locked to the auth ID)
# ALL quote requests must originate from this IP — Vercel cannot call CompuLife directly
COMPULIFE_PROXY_URL=http://34.16.56.64:3001
# DEV auth ID — 500 request limit, development/testing only, never commit to git
# COMPULIFE_AUTH_ID=66b12312b
# PRODUCTION auth ID — obtain from CompuLife before going live
COMPULIFE_AUTH_ID=
COMPULIFE_REGISTERED_IP=34.16.56.64
COMPULIFE_MONTHLY_QUOTE_SOFT_LIMIT=1000
COMPULIFE_MONTHLY_QUOTE_HARD_LIMIT=1150
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
# Resend
RESEND_API_KEY=
RESEND_FROM_EMAIL=quotes@protecwise.com
# Twilio
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
# App
NEXT_PUBLIC_APP_URL=https://protecwise.com
NEXT_PUBLIC_CALENDLY_URL=
NEXT_PUBLIC_AGENCY_PHONE=
# Admin
ADMIN_EMAIL=admin@protecwise.com
CRON_SECRET=
PROXY_SECRET=
# CompuLife Forms Library (carrier application forms — iframe embed only)
# This is ProtecWise's specific account URL — ID=1354 is the account identifier
# This is NOT an API — it is an iframe embed only. Cannot be queried programmatically.
NEXT_PUBLIC_COMPULIFE_FORMS_URL=https://www.goforforms.com/FORMS/FormsEngine.php?ID=1354
# E-Signature (custom native — no third-party service needed)
ESIGN_DOCUMENT_SECRET=        # Used to HMAC-sign audit trail hashes for tamper detection
# Sentry
SENTRY_DSN=
```
---
## BUILD STATUS — UPDATE THIS EACH SESSION
```
[ ] Phase 1 — Foundation
    [x] Project init + packages
    [x] Database migrations (all tables)         ← Session 2 (001–031, 29 tables, RLS, indexes, views)
    [~] Supabase config (auth, storage, RLS)     ← RLS policies done; auth/storage config pending
    [x] Core lib (supabase, auth, types)         ← Session 3 (supabase, auth, carriers/buildCOMPINC, email, sms, validations)
    [x] Middleware (RBAC)                         ← Session 3 (5-portal RBAC via @supabase/ssr)
    [x] Shared layout components                 ← Session 4 (public header/footer, agent/admin sidebars, client/candidate/recruiting headers, 6 layout shells)
    [x] Design system (brand colors, typography) ← Session 4 (typography, premium numbers, buttons, badges, inputs, sidebar nav in globals.css)
    [x] Error/loading/404 pages                  ← Session 4 (not-found, error boundary, loading)
[ ] Phase 2 — Consumer Platform (Division 1)
    [ ] Public marketing site + product pages
    [ ] CompuLife proxy server
    [ ] Carrier permission system (buildCOMPINC)
    [ ] Quote flow (select → form → results → share)
    [ ] Client portal (magic link auth)
    [ ] Insurance needs calculator
    [ ] Application intake (8 steps, autosave)
    [ ] Secure client messaging
    [ ] Email automation (22 templates, Resend)
    [ ] SMS notifications (Twilio)
    [ ] Vercel cron jobs
[ ] Phase 3 — Brokerage Operations (Division 2)
    [ ] Agent portal base + navigation
    [ ] Agent onboarding (7 steps)
    [ ] Carrier management system
    [ ] Lead management CRM
    [ ] Household CRM
    [ ] Contact management
    [ ] Opportunity pipeline
    [ ] Needs analysis tool
    [ ] Product recommendation engine
    [ ] Task management
    [ ] In-platform calendar (FullCalendar)
    [ ] Secure messaging (agent ↔ client)
    [ ] Document center
    [ ] Commission tracking
    [ ] Compliance tracking
    [ ] Workflow automation engine
    [ ] Marketing campaigns
    [ ] Referral management
    [ ] Agent productivity dashboards
    [ ] Reporting + analytics
[ ] Phase 4 — Recruiting Platform (Division 3)
    [ ] Recruiting public website
    [ ] Career pages + Apply Now
    [ ] Candidate portal (apply, track, upload, schedule)
    [ ] Recruiting CRM (pipeline management)
    [ ] Interview scheduling
    [ ] Recruiting automation + follow-up sequences
    [ ] Agent onboarding workflow
    [ ] Production readiness checklist
[ ] Phase 5 — Admin + Cross-cutting
    [ ] Admin system (all modules)
    [ ] Analytics dashboards
    [ ] Audit system
    [ ] Integration framework
    [ ] Content management
    [ ] Security hardening
    [ ] E2E testing (Playwright)
    [ ] Performance optimization
```
---
## SESSION WORKFLOW
At the start of each session:
1. Read this CLAUDE.md
2. Check BUILD STATUS above
3. Ask user which phase/feature to work on
4. Verify the relevant schema tables exist before writing UI
5. Build completely — no placeholders
At the end of each session:
1. Update BUILD STATUS checkboxes above
2. Note any blocking issues
---
## KEY BUSINESS RULES
- Platform responsibility ends at application submission to carrier
- System may receive carrier status updates but does not perform underwriting
- All health data (PHI) must be encrypted at rest
- Banking/financial data must be encrypted at rest
- All user actions must be logged to activity_log
- All emails must be logged to email_log with resend_message_id
- Agents can only quote carriers they are appointed with AND admin has approved
- CompuLife API subscription: 1,200 quotes/month limit
  - Soft alert (admin banner): 1,000 quotes → COMPULIFE_MONTHLY_QUOTE_SOFT_LIMIT
  - Hard block (disable public form): 1,150 quotes → COMPULIFE_MONTHLY_QUOTE_HARD_LIMIT
  - Cached quote results served from DB cost $0 — cache aggressively
  - Dev ID (66b12312b): 500 lifetime requests, does not count toward monthly limit
- TCPA compliance required for all SMS — consent must be captured before sending
- CAN-SPAM compliance required for all email — unsubscribe in every automated email
---
## PLATFORM OBJECTIVE (from specification)
Build a complete enterprise-grade Life Insurance Brokerage Platform.
Primary responsibilities:
- Generate consumer leads
- Educate consumers
- Allow consumers to compare life insurance options
- Perform insurance needs analysis
- Match clients with appropriate products
- Connect clients with licensed agents
- Allow agents to prepare recommendations
- Collect all required application information
- Collect supporting documents
- Capture required disclosures and consents
- Support electronic signatures where applicable
- Validate application completeness
- Submit completed applications to selected carrier
NOT responsible for: underwriting, issuing policies, administering policies,
processing claims, collecting premiums, or servicing carrier-owned policy records.
---
## SKILLS — READ BEFORE BUILDING
Four specialized skills are stored in `/skills/` in this project.
Claude Code must read the relevant skill before building that type of work.
### When to read which skill
| You are about to build... | Read this skill first |
|---|---|
| Any page, component, layout, copy, animation | `skills/protecwise-frontend/SKILL.md` |
| Any API route handler | `skills/protecwise-api/SKILL.md` |
| Any database migration, Supabase query, RLS policy | `skills/protecwise-database/SKILL.md` |
| Health data handling, SMS, email marketing, disclosures, AML | `skills/protecwise-compliance/SKILL.md` |
| Any e-signature capture, disclosure scrolling, signature PDF injection, audit trail | `skills/protecwise-esignature/SKILL.md` |
| The forms library iframe, forms status tracking, forms fallback, agent forms workflow | `skills/protecwise-forms/SKILL.md` |
### Skill summary
**protecwise-frontend** — The design identity and quality standard for all UI.
Brand colors, typography (Inter + JetBrains Mono for numbers), button styles,
badge colors, form patterns, motion rules, copy voice, and the self-critique
checklist to run before finishing any component. Non-negotiable for visual quality.
**protecwise-api** — The exact pattern for every route handler: auth check →
role check → Zod validation → database operation → activity log → response format.
Also covers CompuLife proxy call pattern, file upload validation, email/SMS
sending via lib functions (never direct).
**protecwise-database** — Migration file format, table structure standard
(UUID primary key, status CHECK constraint, updated_at trigger on every table),
RLS policy patterns by role, index requirements, encryption for PHI, JSONB
type definitions, and common mistakes.
**protecwise-forms** — CompuLife Forms Library iframe implementation (URL: `https://www.goforforms.com/FORMS/FormsEngine.php?ID=1354`, Account ID: 1354). Three embed locations, forms status tracking, fallback component, mobile handling, iframe failure logging, and the complete agent forms execution workflow.
**protecwise-compliance** — HIPAA PHI handling, TCPA SMS consent and quiet hours,
CAN-SPAM unsubscribe requirements, insurance regulatory disclosure requirements,
replacement business workflow, e-signature legal capture requirements, DNC,
and data retention rules.
---
## FRONTEND DESIGN — IMPECCABLE STANDARD
This project uses the `frontend-design` skill as the design philosophy baseline,
extended by `skills/protecwise-frontend/SKILL.md` for ProtecWise-specific standards.
### When building any UI, read BOTH in order:
1. First: `skills/protecwise-frontend/SKILL.md` — ProtecWise brand, colors, components
2. Then apply the design principles from the `frontend-design` skill:
   - **The hero is a thesis** — open with the most characteristic thing in the subject's world
   - **Typography carries personality** — Inter + JetBrains Mono (numbers) is non-negotiable
   - **Structure is information** — never number things that aren't sequences
   - **Spend boldness in one place** — the shield motif + premium number treatment IS the signature
   - **Self-critique before shipping** — run the checklist in protecwise-frontend/SKILL.md
### What "impeccable" means on this project:
```
Impeccable = every component passes ALL of these before it ships:
□ Uses exact brand colors (#1B3D8B navy, #4AAE2E green — NOT generic blue or teal)
□ Financial numbers use JetBrains Mono with decimal at 65% opacity
□ All copy is verb-first, sentence case, no filler words
□ Every interactive state exists: default, hover, focus, active, disabled, loading
□ Every data state exists: loading, empty, error, populated
□ Every form field has: label, helper text, error state, success state
□ Mobile-first at 375px — nothing clips, overflows, or becomes unusable
□ Touch targets minimum 44×44px
□ Reduced motion respected (prefers-reduced-motion media query)
□ Logo always from /public/protecwiselogo.png — never recreated
□ No placeholder copy — real copy, real data, real states
```
---
## SUPERPOWERS — WHAT GIVES THIS BUILD EXTRAORDINARY CAPABILITY
The "superpowers" of this Claude Code build come from five compounding advantages:
### Superpower 1 — Persistent Context (CLAUDE.md)
Claude Code reads this file at the start of every session. It never loses context
about the project, never forgets the brand colors, never reinvents architecture
decisions. 44 sessions behave like one continuous engineer with perfect memory.
### Superpower 2 — Domain Skills (4 SKILL.md files)
Each skill makes Claude Code an expert in that domain before writing a single line:
- `protecwise-frontend` → Enterprise UI quality without trial and error
- `protecwise-api` → Every route follows the exact same battle-tested pattern
- `protecwise-database` → Every migration, table, and query is production-correct
- `protecwise-compliance` → HIPAA, TCPA, CAN-SPAM built in from day 1, not patched later
### Superpower 3 — Typed Everything (TypeScript strict + Zod + Supabase types)
The entire stack is fully typed end-to-end:
- Database schema → auto-generated TypeScript types (`pnpm supabase gen types`)
- API inputs → Zod schemas that match the TypeScript types
- API responses → TypeScript interfaces consumed by React components
- Result: zero type-mismatch bugs between database, API, and UI
### Superpower 4 — Zero-Compromise Architecture
The carrier permission system (`buildCOMPINC()`) is enforced at the library level,
not the UI level. Compliance rules are in the database (RLS policies), not just
the application code. Email/SMS sending functions check opt-out at the library
level before every send. These constraints cannot be bypassed accidentally.
### Superpower 5 — Session-by-Session Quality Gates
Each session in the build sequence ends with:
- `pnpm tsc --noEmit` — zero TypeScript errors before moving on
- Visual review at 375px and 1280px — no responsive failures accumulate
- CLAUDE.md build status updated — no completed work gets accidentally repeated
---
## SKILL CREATOR — HOW TO EXTEND THIS PROJECT'S SKILLS
When you need to add new capability to Claude Code for this project, create a new skill.
### When to create a new skill
- A new recurring task type appears (e.g., building recruiting emails, PDF reports)
- A pattern needs to be standardized across multiple sessions
- A complex domain has rules Claude Code keeps getting wrong
- A third-party integration has specific patterns (Stripe, Twilio, etc.)
### Skill creation process (for this project)
**Step 1 — Define the skill**
Answer these before writing:
1. What should Claude Code do differently when this skill is loaded?
2. What prompts/tasks should trigger reading this skill?
3. What specific code patterns, constraints, or standards does it enforce?
4. What mistakes does it prevent?
**Step 2 — Create the file**
```
skills/
└── protecwise-[domain]/
    └── SKILL.md
```
```markdown
---
name: protecwise-[domain]
description: >
  [What it does] for ProtecWise. Use this skill whenever [specific triggers].
  Do not build [X] without reading this skill first.
---
# ProtecWise [Domain] Skill
## [Section 1 — Core pattern or standard]
[Concrete code examples, not abstractions]
## [Section 2 — Specific rules]
[Rules with DO/DON'T examples]
## [Section 3 — Common mistakes]
[What goes wrong without this skill]
```
**Step 3 — Add it to CLAUDE.md**
Add a row to the skills routing table:
```
| You are about to build... | Read this skill first |
|---|---|
| [New domain] | `skills/protecwise-[domain]/SKILL.md` |
```
**Step 4 — Test it**
In the next Claude Code session, tell it: "Read CLAUDE.md and the relevant skill,
then build [the thing the skill covers]." Check that the output matches the skill's
standards. Revise the skill if it doesn't.
### Candidate skills to create as the project grows
```
protecwise-recruiting     — recruiting email templates, pipeline patterns
protecwise-pdf            — react-pdf report patterns, pdf-lib form injection
protecwise-realtime       — Supabase Realtime channel patterns for messaging
protecwise-calendar       — FullCalendar patterns, availability logic
protecwise-commission     — commission calculation rules, chargeback logic
protecwise-esignature     — Custom e-signature system patterns (already built — read this skill)
```
