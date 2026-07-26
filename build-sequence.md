# PROTECWISE — CLAUDE CODE BUILD SEQUENCE
## Session-by-Session Ordered Build Plan
### Follow this order exactly — each phase depends on the previous

---

## HOW TO USE THIS WITH CLAUDE CODE

Each session, tell Claude Code:
> "Open CLAUDE.md first, then build [specific item from this list]"

Claude Code builds one complete feature at a time.
Never ask for multiple unrelated features in one session.
Always verify the previous session's work before starting new features.

---

## PHASE 1 — FOUNDATION (Sessions 1–4)
*Nothing else can be built until this is complete.*

### Session 1 — Project Initialization
```
Prompt: "Initialize the ProtecWise project. Read CLAUDE.md first.
Run these commands in order:
1. pnpm create next-app@latest protecwise --typescript --tailwind --eslint --app --src-dir --import-alias '@/*'
2. cd protecwise
3. pnpm dlx shadcn@latest init (select: Default, Zinc, CSS variables yes)
4. Install all packages from tech-stack-packages.md
5. Create the exact folder structure defined in CLAUDE.md
6. Set up tailwind.config.ts with brand colors
7. Set up globals.css with brand CSS variables and font imports
8. Create .env.local with all 15 environment variable placeholders
9. Create .env.example
10. Create vercel.json with cron job definitions
Verify: pnpm dev runs without errors"

IMPORTANT: Add these to .gitignore (Next.js does this automatically, verify):
.env.local
proxy/.env
```

### Session 2 — Database Schema
```
Prompt: "Create all Supabase migrations for ProtecWise. Read CLAUDE.md first.
Create these migration files in /supabase/migrations/ in this exact order:

001_extensions.sql         — uuid-ossp, pgcrypto, pg_trgm
002_profiles.sql           — extends auth.users, roles enum
003_agents.sql             — full agent record
004_clients.sql            — client accounts
005_candidates.sql         — recruiting candidates
006_households.sql         — household/family grouping for CRM
007_contacts.sql           — contact records linked to households
008_carriers.sql           — carrier registry
009_carrier_rules.sql      — product_rules + state_rules tables
010_agent_carrier.sql      — permissions + preferences tables
011_leads.sql              — lead records
012_opportunities.sql      — CRM opportunity pipeline
013_quotes.sql             — quote records with versioning
014_applications.sql       — 8-step intake records
015_documents.sql          — document storage records
016_tasks.sql              — task management
017_calendar_events.sql    — in-platform calendar
018_message_threads.sql    — secure messaging threads
019_messages.sql           — individual messages
020_commissions.sql        — commission tracking
021_compliance.sql         — compliance records
022_recruiting_pipeline.sql — recruiting CRM
023_workflow_rules.sql     — automation rules
024_notifications.sql      — notification records
025_activity_log.sql       — all activity tracking
026_email_log.sql          — all email tracking
027_client_auth_tokens.sql — magic link tokens
028_password_resets.sql    — password reset tokens
029_rls_policies.sql       — ALL row level security policies
030_indexes.sql            — ALL performance indexes
031_views.sql              — monthly_quote_count and other views

After creating all files:
Run: pnpm supabase db push
Run: pnpm supabase gen types typescript --local > src/types/supabase.ts
Verify: All 29+ tables created, types file generated"
```

### Session 3 — Core Library
```
Prompt: "Build the core library files for ProtecWise. Read CLAUDE.md first.
Create these files completely — no stubs:

src/lib/supabase.ts        — server/client/middleware client factory
src/lib/auth.ts            — session helpers, role validation, requireRole()
src/lib/carriers.ts        — buildCOMPINC() full 5-step filtering function
src/lib/email.ts           — all Resend send functions (22 email types)
src/lib/sms.ts             — Twilio send functions with TCPA consent check
src/lib/validations/       — Zod schemas for every form in the platform
src/types/index.ts         — all shared TypeScript interfaces
src/middleware.ts          — RBAC routing for all 5 portal areas

Verify: TypeScript compiles with zero errors (pnpm tsc --noEmit)"
```

### Session 4 — Shared Layout Components
```
Prompt: "Build all shared layout components for ProtecWise. Read CLAUDE.md first.
Create these completely:

components/layout/PublicHeader.tsx    — full nav with Products dropdown, Client Portal link, Get a Quote CTA
components/layout/PublicFooter.tsx    — all 4 columns, legal links
components/layout/AgentSidebar.tsx    — navy sidebar, all nav items with icons, active states
components/layout/AdminSidebar.tsx    — darker navy, nav items with pending badges
components/layout/ClientHeader.tsx    — client portal header with magic link auth
components/layout/CandidateHeader.tsx — candidate portal header
components/layout/RecruitingHeader.tsx — public recruiting site header

Also create:
app/not-found.tsx          — custom 404
app/error.tsx              — global error boundary
app/loading.tsx            — global loading state
app/(public)/layout.tsx    — public site shell
app/agent/layout.tsx       — agent portal shell (with sidebar)
app/admin/layout.tsx       — admin portal shell
app/client/layout.tsx      — client portal shell
app/candidates/layout.tsx  — candidate portal shell

Verify: All pages render layout correctly at 375px and 1280px"
```

---

## PHASE 2 — CONSUMER PLATFORM (Sessions 5–14)

### Session 5 — Public Marketing Site
```
Prompt: "Build the complete public marketing site for ProtecWise. Read CLAUDE.md first.
Build these pages fully — no placeholder content:

app/(public)/page.tsx                    — homepage (all 7 sections)
app/(public)/products/term-life/page.tsx
app/(public)/products/decreasing-term/page.tsx
app/(public)/products/term-to-100/page.tsx
app/(public)/products/whole-life/page.tsx
app/(public)/products/universal-life/page.tsx
app/(public)/contact/page.tsx
app/(public)/privacy/page.tsx
app/(public)/terms/page.tsx

Brand: #1B3D8B navy, #4AAE2E green, logo at /public/protecwiselogo.jpg
Hero headline: 'Protecting What' then 'Matters Most' (green)
Verify: All 9 pages render, links work, mobile at 375px"
```

### Session 6 — CompuLife Proxy + Carrier System
```
Prompt: "Build the CompuLife integration for ProtecWise. Read CLAUDE.md first.
Build completely:

proxy/server.js                          — Express proxy server, injects auth ID, validates PROXY_SECRET
app/api/compulife/proxy/route.ts         — Next.js proxy route (never expose to browser)
app/api/compulife/states/route.ts        — cached 24hr
app/api/compulife/logos/route.ts         — cached 24hr
app/api/compulife/carriers/route.ts      — cached 24hr
src/lib/carriers.ts                      — buildCOMPINC() all 5 steps
app/api/admin/carriers/seed/route.ts     — sync from CompuLife CompanyList

Verify:
- proxy/server.js starts with node proxy/server.js
- /api/compulife/states returns state list
- buildCOMPINC() correctly builds COMPINC parameter
- Deactivated carrier does not appear in test quote"
```

### Session 7 — Quote Flow
```
Prompt: "Build the complete quote flow for ProtecWise. Read CLAUDE.md first.
Build all quote pages and API routes:

app/(public)/quote/select/page.tsx       — product family selection (5 cards)
app/(public)/quote/page.tsx              — quote input form (all fields)
app/(public)/quote/results/[quoteId]/page.tsx — results with carrier cards, badges
app/(public)/quote/view/[shareToken]/page.tsx — shared quote view
app/(public)/quote/view/[shareToken]/modify/page.tsx — modify quote
app/api/quote/run/route.ts               — calls buildCOMPINC + proxy + creates lead
app/api/quote/apply-click/route.ts
app/api/quote/[quoteId]/route.ts
app/api/quote/shared/[shareToken]/route.ts
app/api/quote/save-email/route.ts

Verify:
- Full quote flow works end-to-end
- buildCOMPINC() is called in /api/quote/run
- Best Value + Lowest Annual badges appear correctly
- Quote copy email sent on creation"
```

### Session 8 — Insurance Needs Calculator
```
Prompt: "Build the insurance needs calculator for ProtecWise. Read CLAUDE.md first.
This is an interactive tool that helps clients determine how much coverage they need.

Create:
app/(public)/needs-calculator/page.tsx
app/api/needs-calculator/calculate/route.ts

Calculator collects:
- Annual income (how many years to replace: 10, 15, 20, 25, 30)
- Outstanding debts (mortgage, car loans, credit cards, student loans)
- Final expenses estimate (default $15,000)
- Existing life insurance coverage
- Savings/investments (subtract from need)
- Children's education fund goal
- Spouse income replacement years

Calculation: (income × years) + debts + final expenses + education - existing coverage - savings

Output:
- Recommended coverage amount
- Recommended term length based on youngest child age and mortgage term
- 'Get a Quote for $[amount]' CTA → /quote?coverage=[calculated]&product=level_term
- Save result to needs_analysis_results table (linked to lead if email provided)

Verify: Calculation is accurate, CTA pre-fills quote form correctly"
```

### Session 9 — Client Portal
```
Prompt: "Build the complete client portal for ProtecWise. Read CLAUDE.md first.
Build all client pages with magic link authentication:

app/(auth)/client/login/page.tsx
app/(auth)/client/auth/verify/page.tsx
app/client/page.tsx                      — main dashboard
app/client/quotes/page.tsx
app/client/applications/[id]/page.tsx
app/client/messages/page.tsx             — secure messaging (Supabase Realtime)
app/client/documents/page.tsx            — document uploads
app/client/profile/page.tsx
app/api/client/auth/magic-link/route.ts
app/api/client/auth/verify/route.ts
app/api/client/me/route.ts
app/api/client/quotes/route.ts
app/api/client/applications/route.ts
app/api/client/applications/[id]/route.ts
app/api/client/messages/route.ts
app/api/client/documents/route.ts
app/api/client/profile/route.ts

Verify:
- Magic link email sent and received
- Dashboard shows correct quotes and applications
- Real-time messaging works (send/receive)
- Document upload works to Supabase Storage"
```

### Session 10 — Application Intake (8 Steps)
```
Prompt: "Build the complete 8-step application intake for ProtecWise. Read CLAUDE.md first.
This is the most critical user flow in the platform.

Build:
app/(public)/apply/[applicationId]/step/[step]/page.tsx — dynamic step router
app/(public)/apply/[applicationId]/confirmation/page.tsx
app/(public)/apply/[applicationId]/saved/page.tsx
app/(public)/apply/resume/[resumeToken]/page.tsx

API routes:
app/api/applications/[id]/route.ts
app/api/applications/[id]/step/[n]/route.ts  — autosave
app/api/applications/[id]/submit/route.ts
app/api/applications/[id]/save-exit/route.ts
app/api/applications/resume/[token]/route.ts

Step components (create in components/application/):
Step1QuoteConfirmation.tsx
Step2PersonalInfo.tsx
Step3Beneficiaries.tsx
Step4CoverageContext.tsx
Step5HealthOverview.tsx
Step6FinancialDraft.tsx
Step7Disclosures.tsx
Step8ReviewSubmit.tsx
StepProgressBar.tsx     — 8-step visual progress
ApplicationAutosave.tsx — 1.5s debounce, Saving.../Saved indicator

Requirements:
- PHI in step 5 encrypted at rest
- Banking info in step 6 encrypted at rest
- Step 7 disclosures require scroll to bottom before checkboxes enable
- Autosave works on every input change (1.5s debounce)
- Save & Exit sends resume email and redirects to /apply/[id]/saved
- Resume token validates expiry and redirects to correct step

Verify: Complete all 8 steps, submit, receive confirmation email"
```

### Session 11 — Auth Pages
```
Prompt: "Build all authentication pages for ProtecWise. Read CLAUDE.md first.

app/(auth)/login/page.tsx               — agent/admin email+password
app/(auth)/register/page.tsx            — new agent self-registration
app/(auth)/forgot-password/page.tsx     — agents only
app/(auth)/reset-password/page.tsx      — token validation + new password

API routes:
app/api/auth/forgot-password/route.ts
app/api/auth/reset-password/route.ts

All use Supabase Auth. Password reset sends Email 22.
Login page shows 'Forgot Password?' link.
After reset: redirect to /login?message=password-updated
Login shows success banner when message=password-updated in URL.

Verify: Full reset flow works, login works for agents and admins"
```

### Session 12 — Email System (All 22+ Templates)
```
Prompt: "Build the complete email system for ProtecWise. Read CLAUDE.md first.
Build all email templates in src/components/emails/ using React Email.
Build all send functions in src/lib/email.ts.

Templates to build (all must use brand colors #1B3D8B + #4AAE2E + logo):
01_QuoteCopyEmail.tsx
02_QuoteReminder1Email.tsx
03_QuoteReminder2Email.tsx
04_QuoteReminder3Email.tsx
05_ApplicationStartEmail.tsx
06_ApplicationResumeEmail.tsx
07_ApplicationAbandonment1Email.tsx
08_ApplicationAbandonment2Email.tsx
09_QuoteAbandonment1Email.tsx
10_QuoteAbandonment2Email.tsx
11_ApplicationSubmittedEmail.tsx
12_AgentQuoteSendEmail.tsx
13_AgentNewLeadEmail.tsx
14_AgentApplicationNotifyEmail.tsx
15_AgentActivationEmail.tsx
16_NewAgentAdminEmail.tsx
17_CarrierApprovedEmail.tsx
18_CarrierDeniedEmail.tsx
19_EoExpiryWarningEmail.tsx
20_ClientMagicLinkEmail.tsx
21_ClientWelcomeEmail.tsx
22_PasswordResetEmail.tsx
23_RecruitingFollowup1Email.tsx    ← recruiting-specific
24_CandidateApplicationEmail.tsx   ← recruiting-specific
25_InterviewScheduledEmail.tsx     ← recruiting-specific

Requirements:
- Every template: branded header, logo, CTA button, unsubscribe footer
- Every send function: check email_opt_out before sending
- Every send: log to email_log with resend_message_id
- Frequency throttle: max 1 automated email per lead per 24hr

Verify: Send each email type via test, verify received and logged"
```

### Session 13 — SMS System
```
Prompt: "Build the SMS system for ProtecWise using Twilio. Read CLAUDE.md first.

Create src/lib/sms.ts with these functions:
- sendQuoteReminderSMS(leadId, message)
- sendApplicationReminderSMS(applicationId)
- sendAppointmentReminderSMS(eventId)
- sendAgentNewLeadSMS(agentId, leadData)
- sendRecruitingFollowupSMS(candidateId)

Requirements (TCPA compliance):
- NEVER send SMS without checking sms_consent = true on the lead/candidate record
- NEVER send SMS between 8pm and 8am local time (check timezone)
- Always store SMS sends in a sms_log table (create this migration)
- Always provide opt-out instructions in first SMS: 'Reply STOP to unsubscribe'
- Respect STOP requests — set sms_opt_out = true in database

Add sms_consent and sms_opt_out fields to leads, candidates tables if not already present.

Create app/api/sms/opt-out/route.ts — Twilio webhook for STOP replies.

Verify: SMS sends correctly, TCPA fields enforced before every send"
```

### Session 14 — Cron Jobs
```
Prompt: "Build all Vercel cron jobs for ProtecWise. Read CLAUDE.md first.

Create these cron routes:
app/api/cron/email-sequences/route.ts    — daily 14:00 UTC
  - Quote reminders (day 2, 5, 10)
  - Application abandonment (day 2, 5)
  - Quote abandonment (day 2, 5)
  - 24hr frequency throttle enforcement

app/api/cron/eo-expiry-alerts/route.ts   — weekly Monday 09:00 UTC
  - E&O certificates expiring within 30 days

app/api/cron/recruiting-follow/route.ts  — daily 10:00 UTC
  - Recruiting follow-up sequences (day 2, 5, 10, 30)
  - Interview reminder SMS (24hr before)

app/api/cron/commission-alerts/route.ts  — weekly Tuesday 09:00 UTC
  - Upcoming commission payouts
  - Chargeback risk alerts (policies in grace period)

All cron routes:
- Validate Authorization: Bearer [CRON_SECRET] header
- Return summary JSON with counts
- Log all sends to email_log / sms_log

Verify: Test each cron by hitting the route with correct auth header"
```

---

## PHASE 3 — BROKERAGE OPERATIONS (Sessions 15–28)

### Session 15 — Agent Portal Base
```
Build: Agent dashboard, navigation, profile, basic metrics cards
```

### Session 16 — Agent Onboarding (7 Steps)
```
Build: Complete 7-step onboarding flow with carrier appointment submission
```

### Session 17 — Carrier Management System
```
Build: Admin carrier management, agent carrier permissions, buildCOMPINC integration
```

### Session 18 — Lead Management CRM
```
Build: Lead list, lead detail, add lead, status updates, activity log, notes
```

### Session 19 — Household CRM
```
Build: Household records, contact management, relationship mapping,
       household summary view (all policies, applications, contacts in one household)
```

### Session 20 — Opportunity Pipeline
```
Build: Kanban board (dnd-kit), pipeline stages, opportunity cards,
       stage transitions, value tracking, close date forecasting
```

### Session 21 — Needs Analysis Tool (Agent-Side)
```
Build: Full needs analysis form for agents to run with clients,
       coverage gap analysis, product recommendation engine,
       printable/emailable needs analysis report (react-pdf)
```

### Session 22 — Quote Management (Agent Portal)
```
Build: Agent quote builder, send to client, quote list, version history
```

### Session 22b — Forms Library Integration
```
Prompt: "Read CLAUDE.md and skills/protecwise-forms/SKILL.md.
Build the complete forms library integration:

app/agent/forms/page.tsx              — full-page iframe embed with loading + fallback
components/forms/FormsLibraryFallback.tsx — fallback component when iframe fails
app/api/agent/forms/iframe-failure/route.ts — logs failure + notifies admin
app/api/agent/applications/[id]/forms-status/route.ts — updates forms status

Also add to agent application detail (/agent/applications/[applicationId]):
- Forms Execution section with status dropdown
- Forms Status history (opened_at, sent_at, submitted_at timestamps)
- 'Open Forms Library' button → modal sheet with iframe
- Forms tracking displays on client-facing application detail (/client/applications/[id])

Forms URL from env: NEXT_PUBLIC_COMPULIFE_FORMS_URL
ID=1354 is ProtecWise's account — never change this parameter.

Verify:
- iframe loads at /agent/forms
- Fallback shows and direct link works when iframe errors
- Failure is logged to activity_log
- Forms status updates save and display timestamps
- Mobile shows direct link instead of iframe at < 768px"
```

### Session 23 — Task Management
```
Build: Task list, task creation, assignment, due dates, priorities,
       task templates, automated task creation from workflow rules,
       tasks linked to leads/applications/opportunities
```

### Session 24 — In-Platform Calendar (FullCalendar)
```
Build: Month/week/day views, appointment creation, client/agent events,
       appointment reminders (SMS + email), no-show tracking,
       integration with scheduling from client portal
```

### Session 25 — Secure Messaging
```
Build: Agent ↔ client threads (Supabase Realtime), message compose (Tiptap),
       file attachment in messages, read receipts, notification on new message
```

### Session 26 — Document Center
```
Build: Document upload (Supabase Storage), document categories,
       version control, access permissions, document request workflow,
       document status tracking (requested → uploaded → reviewed → approved)
```

### Session 27 — Commission Tracking
```
Build: Commission schedule by carrier/product/agent tier,
       commission statement import (CSV), projected vs. actual,
       chargeback tracking, commission dashboard, 1099 data export
```

### Session 28 — Compliance Tracking
```
Build: Agent license tracking (all states, expiry alerts),
       E&O tracking (already in onboarding, expand here),
       carrier appointment status, compliance calendar,
       required training completion tracking, audit log viewer
```

### Session 29 — Workflow Automation Engine
```
Build: Rule builder UI (trigger → condition → action),
       built-in triggers: lead created, quote viewed, application step completed, etc.,
       built-in actions: send email, send SMS, create task, update status, assign agent,
       workflow rule storage, execution engine (runs on cron + event triggers)
```

### Session 30 — Marketing Campaigns
```
Build: Campaign builder, audience segmentation (by status, product, state, agent),
       email campaign composition (Tiptap), SMS campaigns,
       campaign scheduling, send, open/click tracking, unsubscribe management
```

### Session 31 — Referral Management
```
Build: Referral partner profiles, unique referral links (/ref/[code]),
       referral attribution (UTM + link), referral dashboard,
       referral commission tracking, referral partner portal (read-only)
```

### Session 32 — Agent Productivity + Reporting
```
Build: Agent performance dashboard (quotes, applications, placements per period),
       conversion rate analytics, leaderboard, activity metrics,
       report builder (date range, agent filter, export to CSV/PDF)
```

---

## PHASE 4 — RECRUITING PLATFORM (Sessions 33–38)

### Session 33 — Recruiting Public Website
```
Prompt: "Build the complete public recruiting website for ProtecWise.

Routes under app/recruiting/:
/recruiting                     — recruiting homepage
/recruiting/why-join-us
/recruiting/compensation
/recruiting/training
/recruiting/licensing
/recruiting/faq
/recruiting/success-stories
/recruiting/events
/recruiting/apply             — Apply Now workflow (multi-step)
/recruiting/referral          — agent referral program

Design: Same brand colors as main site but with 'career' energy.
Apply Now is a multi-step form: basic info → background → licensing status → motivation.
On submit: creates candidate record, sends acknowledgment email.

Verify: All pages render, Apply Now submits and creates candidate record"
```

### Session 34 — Candidate Portal
```
Build: Candidate login (email+password), application status dashboard,
       document upload (resume, licenses), questionnaire completion,
       interview scheduling (from recruiter-created slots),
       onboarding checklist, communication history with recruiter
```

### Session 35 — Recruiting CRM
```
Build: Candidate pipeline (Kanban with dnd-kit — same pattern as opportunity pipeline),
       stages: Applied → Screening → Interview → Offer → Background → Licensing → Onboarding → Active,
       recruiter assignment, candidate notes, activity history,
       bulk actions (email all in stage), pipeline analytics
```

### Session 36 — Interview Scheduling
```
Build: Recruiter creates available slots (FullCalendar),
       candidate selects slot from candidate portal,
       confirmation emails + SMS to both,
       interview reminders (24hr before, 1hr before),
       no-show tracking, reschedule workflow
```

### Session 37 — Recruiting Automation
```
Build: Follow-up sequences (day 2/5/10/30 for non-responsive candidates),
       stage-based triggers (move to Interview → send prep email),
       offer letter generation (react-pdf with candidate data),
       background check status updates,
       licensing progress tracking (manual entry + alerts)
```

### Session 38 — Agent Onboarding (Post-Hire)
```
Build: Onboarding checklist (personal info, licensing, E&O, carrier appointments,
       banking, tax forms W-9, training assignments, tech setup),
       progress tracking, mentor assignment, office assignment,
       production readiness checklist, account provisioning workflow
```

---

## PHASE 5 — ADMIN + CROSS-CUTTING (Sessions 39–44)

### Session 39 — Admin System (All Modules)
```
Build: Admin dashboard with all badges and metrics,
       agent management + activation,
       carrier management (full — seed, rules, permissions),
       admin lead/application oversight,
       admin analytics,
       admin recruiting oversight,
       system settings (agency info, email config, SMS config)
```

### Session 40 — Analytics Dashboards
```
Build: Executive dashboard (all 3 divisions in one view),
       consumer platform analytics (funnel, conversion, quote volume),
       brokerage operations analytics (pipeline, revenue, agent performance),
       recruiting analytics (pipeline conversion, time-to-hire, source attribution)
```

### Session 41 — Audit System
```
Build: Complete activity_log viewer (searchable, filterable by entity/action/user),
       compliance audit reports,
       data export for compliance review,
       admin-only access
```

### Session 42 — Notification Center
```
Build: In-app notification bell (polling every 60s),
       notification types: new lead, quote viewed, app submitted, carrier approved,
       mark as read, notification preferences (email + SMS + in-app per type),
       agent notification settings page
```

### Session 43 — Security Hardening
```
Build: API rate limiting on all public routes,
       CSRF protection,
       input sanitization verification,
       RLS policy audit (verify no data leaks between roles),
       file upload security (type + size validation server-side),
       secrets exposure scan (grep for env vars in client bundles),
       session timeout configuration
```

### Session 44 — Testing + Launch Prep
```
Build: Vitest unit tests for all lib functions (buildCOMPINC, email, sms, validations),
       Playwright E2E tests for critical flows:
         - Full quote flow (select → results → apply → confirmation)
         - Client magic link auth
         - Agent onboarding (all 7 steps)
         - Application intake (all 8 steps)
         - Recruiting Apply Now flow
       Fix all failing tests
       Run: pnpm tsc --noEmit (zero TypeScript errors)
       Run: pnpm build (zero build errors)
       Deploy to Vercel
```

---

## QUICK REFERENCE — WHAT EACH SESSION PRODUCES

| Session | Phase | Output |
|---|---|---|
| 1 | Foundation | Initialized project with all packages |
| 2 | Foundation | All 29+ database tables + RLS + types |
| 3 | Foundation | Core lib functions + middleware |
| 4 | Foundation | All shared layout components |
| 5 | Consumer | Public marketing site (9 pages) |
| 6 | Consumer | CompuLife proxy + carrier permission system |
| 7 | Consumer | Complete quote flow (6 pages) |
| 8 | Consumer | Insurance needs calculator |
| 9 | Consumer | Client portal (6 pages + magic link) |
| 10 | Consumer | 8-step application intake |
| 11 | Consumer | Auth pages (login, register, password reset) |
| 12 | Consumer | All 25 email templates |
| 13 | Consumer | SMS system (TCPA compliant) |
| 14 | Consumer | All 4 Vercel cron jobs |
| 15–32 | Brokerage | Full brokerage operations (18 sessions) |
| 33–38 | Recruiting | Full recruiting platform (6 sessions) |
| 39–44 | Admin | Admin system, analytics, security, testing (6 sessions) |
| **Total** | | **44 sessions → production-ready platform** |

---

## RULES FOR EVERY SESSION

1. Start every session: "Read CLAUDE.md before writing any code"
2. Never write placeholder code — every function must be complete
3. Every API route must have: auth check → validation → database write → response
4. Every UI page must have: loading state → empty state → error state → populated state
5. Update CLAUDE.md BUILD STATUS at the end of every session
6. Run `pnpm tsc --noEmit` at the end of every session — fix all TypeScript errors before stopping
7. If a session runs long — stop at a complete, working state (not mid-feature)

---

## STARTING COMMAND FOR CLAUDE CODE

Paste this at the start of your very first Claude Code session:

```
Read CLAUDE.md in the project root before doing anything else.
This is Session 1 of the ProtecWise build.

Task: Initialize the project completely per the tech-stack-packages.md file.
- Create the Next.js app with pnpm
- Install all packages listed in tech-stack-packages.md
- Set up tailwind.config.ts with brand colors
- Set up globals.css with brand CSS variables
- Create the complete folder structure from CLAUDE.md
- Create .env.local with all placeholder variables
- Create vercel.json
- Verify pnpm dev runs without errors

Do not start building any features yet.
Only initialize the project foundation.
Report what was created when done.
```
