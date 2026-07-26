# ProtecWise

Life Insurance Brokerage Operating Platform — consumer sales, brokerage operations, and agent recruiting.

> Read `CLAUDE.md` at the start of every session before writing any code.

## Stack

Next.js 14 (App Router, TS strict) · Tailwind + shadcn/ui · Supabase · Resend + React Email · Twilio · TanStack Table · React Hook Form + Zod · Zustand · Recharts · @react-pdf/renderer · Vercel · pnpm.

## Getting started

```bash
pnpm install
cp .env.example .env.local   # then fill in credentials
pnpm dev                     # http://localhost:3000
```

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start the dev server |
| `pnpm build` | Production build |
| `pnpm lint` | ESLint |
| `pnpm test` | Vitest unit tests |
| `pnpm test:e2e` | Playwright E2E tests |
| `pnpm db:migrate` | Push Supabase migrations |
| `pnpm db:types` | Generate DB TypeScript types |

## Project docs

- `CLAUDE.md` — project brain (architecture, rules, build status)
- `tech-stack-packages.md` — full dependency rationale
- `build-sequence.md` — session-by-session build plan
- `skills/` — specialized skills (frontend, api, database, compliance)
