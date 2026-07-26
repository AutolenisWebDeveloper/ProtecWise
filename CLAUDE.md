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
E-signature:      pdf-lib (field injection) + DocuSign API (production)
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

Logo file: `/public/protecwiselogo.jpg` — always use this file, never recreate the logo.
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
# CompuLife
COMPULIFE_PROXY_URL=
COMPULIFE_AUTH_ID=
COMPULIFE_MONTHLY_QUOTE_SOFT_LIMIT=500
COMPULIFE_MONTHLY_QUOTE_HARD_LIMIT=1000

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

# DocuSign (optional, Phase 2)
DOCUSIGN_CLIENT_ID=
DOCUSIGN_CLIENT_SECRET=
DOCUSIGN_ACCOUNT_ID=

# Sentry
SENTRY_DSN=
```

---

## BUILD STATUS — UPDATE THIS EACH SESSION

```
[ ] Phase 1 — Foundation
    [ ] Project init + packages
    [ ] Database migrations (all tables)
    [ ] Supabase config (auth, storage, RLS)
    [ ] Core lib (supabase, auth, types)
    [ ] Middleware (RBAC)
    [ ] Shared layout components
    [ ] Design system (brand colors, typography)
    [ ] Error/loading/404 pages

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
- CompuLife API costs $480–$1,500/year based on volume — enforce monthly limits
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
| Health data handling, SMS, email marketing, disclosures, e-signatures, AML | `skills/protecwise-compliance/SKILL.md` |

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

**protecwise-compliance** — HIPAA PHI handling, TCPA SMS consent and quiet hours,
CAN-SPAM unsubscribe requirements, insurance regulatory disclosure requirements,
replacement business workflow, e-signature legal capture requirements, DNC,
and data retention rules.

