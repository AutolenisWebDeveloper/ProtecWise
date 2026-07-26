# PROTECWISE — COMPLETE TECH STACK
## Every Package, Why It's Chosen, How to Install

---

## INITIALIZE PROJECT

```bash
# Create Next.js app with all options
pnpm create next-app@latest protecwise \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"

cd protecwise

# Initialize shadcn/ui
pnpm dlx shadcn@latest init
# Select: Default style, Zinc base color, CSS variables: yes
```

---

## CORE DEPENDENCIES

### UI Framework
```bash
pnpm add \
  @radix-ui/react-accordion \
  @radix-ui/react-alert-dialog \
  @radix-ui/react-avatar \
  @radix-ui/react-checkbox \
  @radix-ui/react-dialog \
  @radix-ui/react-dropdown-menu \
  @radix-ui/react-label \
  @radix-ui/react-popover \
  @radix-ui/react-progress \
  @radix-ui/react-radio-group \
  @radix-ui/react-scroll-area \
  @radix-ui/react-select \
  @radix-ui/react-separator \
  @radix-ui/react-slider \
  @radix-ui/react-slot \
  @radix-ui/react-switch \
  @radix-ui/react-tabs \
  @radix-ui/react-toast \
  @radix-ui/react-tooltip \
  class-variance-authority \
  clsx \
  tailwind-merge \
  lucide-react
```
**Why:** shadcn/ui components are built on Radix UI primitives — fully accessible, unstyled, customizable with Tailwind. Lucide for consistent icons.

### shadcn/ui Components (run after init)
```bash
pnpm dlx shadcn@latest add \
  button card input label textarea select checkbox \
  radio-group switch slider progress badge separator \
  avatar dropdown-menu dialog alert-dialog sheet \
  popover tooltip toast tabs accordion scroll-area \
  table form calendar command combobox
```

---

## DATABASE & AUTH

```bash
pnpm add \
  @supabase/supabase-js \
  @supabase/ssr \
  @supabase/auth-helpers-nextjs
```
**Why:** Supabase provides PostgreSQL + Auth + Storage + Realtime in one platform. `@supabase/ssr` is the modern server-side rendering integration. `auth-helpers-nextjs` for App Router middleware.

```bash
# Supabase CLI (for local dev and migrations)
pnpm add -D supabase

# Initialize Supabase in project
pnpm supabase init
```

---

## FORMS & VALIDATION

```bash
pnpm add \
  react-hook-form \
  @hookform/resolvers \
  zod
```
**Why:** React Hook Form is performant (no re-renders on every keystroke). Zod gives TypeScript-first schema validation. `@hookform/resolvers` connects them. All 8 application intake steps use this combination.

---

## DATA TABLES

```bash
pnpm add \
  @tanstack/react-table
```
**Why:** TanStack Table v8 is the most capable headless table library. Handles sorting, filtering, pagination, column visibility, row selection for all CRM tables (leads, applications, agents, carriers, candidates). Enterprise-grade.

---

## CHARTS & ANALYTICS

```bash
pnpm add \
  recharts
```
**Why:** Recharts is React-native (not a wrapper around Chart.js or D3). Composable API. Works well with Tailwind. Used for all analytics dashboards, agent productivity, commission charts.

---

## EMAIL

```bash
pnpm add \
  resend \
  @react-email/components \
  @react-email/render
```
**Why:** Resend is the best modern email API. React Email gives JSX-based email templates that render to HTML automatically. Used for all 22+ email templates.

---

## SMS

```bash
pnpm add \
  twilio
```
**Why:** Twilio is the industry standard. Used for appointment reminders, application status updates, recruiting follow-ups. Must implement TCPA consent before any SMS send.

---

## CALENDAR

```bash
pnpm add \
  @fullcalendar/react \
  @fullcalendar/daygrid \
  @fullcalendar/timegrid \
  @fullcalendar/list \
  @fullcalendar/interaction \
  @fullcalendar/core
```
**Why:** FullCalendar is the most complete calendar component library for React. Supports month/week/day views, drag-and-drop, event creation inline. Used for agent calendar, appointment scheduling, recruiting interview scheduling.

---

## REAL-TIME & MESSAGING

Supabase Realtime handles this (already installed). No additional package needed.

```typescript
// Pattern for secure messaging (agent ↔ client)
const channel = supabase
  .channel(`thread-${threadId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `thread_id=eq.${threadId}`
  }, handleNewMessage)
  .subscribe();
```

---

## STATE MANAGEMENT

```bash
pnpm add \
  zustand \
  immer
```
**Why:** Zustand is lightweight, TypeScript-first, no boilerplate. Use for complex client-side state: CRM filters, calendar view state, message drafts, multi-step form progress. `immer` for immutable state updates.

---

## FILE UPLOADS & DOCUMENTS

```bash
pnpm add \
  @supabase/storage-js
```
Already included in `@supabase/supabase-js`. No extra package needed.

```bash
# PDF generation (for application summaries, reports)
pnpm add \
  @react-pdf/renderer

# PDF manipulation (for e-signature field injection)
pnpm add \
  pdf-lib
```
**Why:** `@react-pdf/renderer` creates PDFs from React components (reports, application summaries). `pdf-lib` manipulates existing carrier PDF forms for field injection and e-signature preparation.

---

## DATE & TIME

```bash
pnpm add \
  date-fns \
  date-fns-tz
```
**Why:** date-fns is modular (only import what you use), TypeScript-native, tree-shakeable. `date-fns-tz` for timezone handling in calendar and appointment scheduling. Never use moment.js.

---

## HTTP CLIENT

No additional package needed. Use native `fetch` with Next.js caching features.

---

## NOTIFICATIONS (Toast)

```bash
pnpm add \
  sonner
```
**Why:** Sonner is the cleanest toast notification library. Works with Next.js App Router. Used for all success/error/loading toast messages across all portals.

---

## DRAG AND DROP (CRM Pipeline)

```bash
pnpm add \
  @dnd-kit/core \
  @dnd-kit/sortable \
  @dnd-kit/utilities
```
**Why:** dnd-kit is the most accessible drag-and-drop library. Used for Kanban-style CRM pipeline boards (opportunity pipeline, recruiting pipeline) and sortable lists.

---

## RICH TEXT EDITOR (Notes, Emails, Messaging)

```bash
pnpm add \
  @tiptap/react \
  @tiptap/pm \
  @tiptap/starter-kit \
  @tiptap/extension-placeholder \
  @tiptap/extension-character-count \
  @tiptap/extension-link
```
**Why:** Tiptap is the most flexible headless rich text editor. Used for agent notes, secure message composition, email campaign composition, recruiting email templates.

---

## SEARCH

```bash
pnpm add \
  cmdk
```
**Why:** cmdk powers Command+K search interface. Used for global search across CRM (leads, applications, agents, candidates, carriers). shadcn/ui's command component is built on this.

---

## PHONE NUMBER & INPUT FORMATTING

```bash
pnpm add \
  react-phone-number-input \
  libphonenumber-js
```
**Why:** Proper phone input with country flag, format validation. Required for TCPA compliance (must store phone numbers in E.164 format for Twilio).

---

## CURRENCY & NUMBER FORMATTING

```bash
pnpm add \
  numeral
```
**Why:** Clean currency and number formatting for premium amounts, commission figures, coverage amounts. `$1,000,000` not `1000000`.

---

## UTILITIES

```bash
pnpm add \
  nanoid \
  uuid

pnpm add -D \
  @types/uuid
```
**Why:** `nanoid` for generating short, URL-safe IDs (share tokens, resume tokens). `uuid` for any UUID generation client-side when needed.

---

## SENTRY (Error Tracking)

```bash
pnpm add \
  @sentry/nextjs

# Run wizard to configure
pnpm dlx @sentry/wizard@latest -i nextjs
```
**Why:** Production error tracking. Captures server-side and client-side errors with full stack traces and session replay.

---

## DEV DEPENDENCIES

```bash
pnpm add -D \
  vitest \
  @vitejs/plugin-react \
  @testing-library/react \
  @testing-library/user-event \
  @testing-library/jest-dom \
  jsdom \
  playwright \
  @playwright/test \
  prettier \
  prettier-plugin-tailwindcss \
  @types/node
```

---

## COMPLETE package.json

```json
{
  "name": "protecwise",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest",
    "test:e2e": "playwright test",
    "test:ui": "vitest --ui",
    "db:migrate": "supabase db push",
    "db:reset": "supabase db reset",
    "db:types": "supabase gen types typescript --local > src/types/supabase.ts",
    "email:dev": "email dev --dir src/components/emails"
  },
  "dependencies": {
    "next": "14.2.0",
    "react": "^18",
    "react-dom": "^18",
    "typescript": "^5",
    "@supabase/supabase-js": "^2",
    "@supabase/ssr": "^0.5",
    "@supabase/auth-helpers-nextjs": "^0.10",
    "react-hook-form": "^7",
    "@hookform/resolvers": "^3",
    "zod": "^3",
    "@tanstack/react-table": "^8",
    "recharts": "^2",
    "resend": "^3",
    "@react-email/components": "^0.0.20",
    "@react-email/render": "^1",
    "twilio": "^5",
    "@fullcalendar/react": "^6",
    "@fullcalendar/daygrid": "^6",
    "@fullcalendar/timegrid": "^6",
    "@fullcalendar/list": "^6",
    "@fullcalendar/interaction": "^6",
    "@fullcalendar/core": "^6",
    "zustand": "^5",
    "immer": "^10",
    "@react-pdf/renderer": "^3",
    "pdf-lib": "^1",
    "date-fns": "^3",
    "date-fns-tz": "^3",
    "sonner": "^1",
    "@dnd-kit/core": "^6",
    "@dnd-kit/sortable": "^8",
    "@dnd-kit/utilities": "^3",
    "@tiptap/react": "^2",
    "@tiptap/pm": "^2",
    "@tiptap/starter-kit": "^2",
    "@tiptap/extension-placeholder": "^2",
    "@tiptap/extension-character-count": "^2",
    "@tiptap/extension-link": "^2",
    "cmdk": "^1",
    "react-phone-number-input": "^3",
    "libphonenumber-js": "^1",
    "numeral": "^2",
    "nanoid": "^5",
    "uuid": "^10",
    "lucide-react": "^0.400.0",
    "class-variance-authority": "^0.7",
    "clsx": "^2",
    "tailwind-merge": "^2",
    "@sentry/nextjs": "^8"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "@types/uuid": "^10",
    "@types/numeral": "^2",
    "supabase": "^1",
    "autoprefixer": "^10",
    "postcss": "^8",
    "tailwindcss": "^3",
    "eslint": "^8",
    "eslint-config-next": "14.2.0",
    "prettier": "^3",
    "prettier-plugin-tailwindcss": "^0.6",
    "vitest": "^1",
    "@vitejs/plugin-react": "^4",
    "@testing-library/react": "^14",
    "@testing-library/user-event": "^14",
    "@testing-library/jest-dom": "^6",
    "jsdom": "^24",
    "playwright": "^1",
    "@playwright/test": "^1"
  }
}
```

---

## TAILWIND CONFIG

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors from ProtecWise logo
        brand: {
          navy:         '#1B3D8B',
          'navy-hover': '#142D6A',
          'navy-tint':  '#E8EEF9',
          green:        '#4AAE2E',
          'green-hover':'#3A9020',
          'green-tint': '#EBF6E5',
          blue:         '#4A9ED6',
          'blue-hover': '#2A7FB8',
          'blue-tint':  '#EDF5FC',
        },
        // shadcn/ui CSS variable bridge
        border:      'hsl(var(--border))',
        input:       'hsl(var(--input))',
        ring:        'hsl(var(--ring))',
        background:  'hsl(var(--background))',
        foreground:  'hsl(var(--foreground))',
        primary: {
          DEFAULT:    'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT:    'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT:    'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT:    'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;
```

Add this package:
```bash
pnpm add tailwindcss-animate
```

---

## GLOBALS.CSS BRAND INTEGRATION

```css
/* src/app/globals.css */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* shadcn/ui tokens mapped to ProtecWise brand */
    --background: 0 0% 100%;
    --foreground: 220 26% 14%;
    --primary: 222 68% 32%;         /* #1B3D8B brand navy */
    --primary-foreground: 0 0% 100%;
    --secondary: 207 63% 57%;       /* #4A9ED6 brand blue */
    --secondary-foreground: 0 0% 100%;
    --accent: 101 58% 42%;          /* #4AAE2E brand green */
    --accent-foreground: 0 0% 100%;
    --muted: 220 14% 96%;
    --muted-foreground: 220 9% 46%;
    --border: 220 13% 91%;
    --input: 220 13% 91%;
    --ring: 222 68% 32%;
    --radius: 0.5rem;

    /* Brand direct CSS vars */
    --brand-navy:       #1B3D8B;
    --brand-navy-hover: #142D6A;
    --brand-navy-tint:  #E8EEF9;
    --brand-green:      #4AAE2E;
    --brand-green-hover:#3A9020;
    --brand-green-tint: #EBF6E5;
    --brand-blue:       #4A9ED6;
    --brand-blue-hover: #2A7FB8;
    --brand-blue-tint:  #EDF5FC;
  }
}
```

---

## MCP SERVERS FOR CLAUDE CODE

Connect these MCP servers to your Claude Code session for maximum capability:

### Essential for this project
```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@supabase/mcp-server-supabase@latest",
                "--access-token", "YOUR_SUPABASE_ACCESS_TOKEN"]
    }
  }
}
```

**Supabase MCP** — lets Claude Code run migrations, query schema, manage tables directly.

### Useful integrations
- **Twilio MCP** — reference for SMS API calls
- **Vercel MCP** — deploy and manage environment variables
- **Resend MCP** — email template management

---

## SHADCN/UI BRAND CUSTOMIZATION

After running `shadcn init`, update `components.json`:
```json
{
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "zinc",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

---

## SUPABASE LOCAL DEVELOPMENT

```bash
# Start Supabase locally
pnpm supabase start

# Apply migrations
pnpm supabase db push

# Generate TypeScript types from schema
pnpm supabase gen types typescript --local > src/types/supabase.ts

# Reset database (careful!)
pnpm supabase db reset

# View local Supabase Studio
# Opens at http://127.0.0.1:54323
```

---

## PROXY SERVER SETUP

```bash
# Create proxy directory
mkdir proxy && cd proxy

# Initialize
npm init -y
npm install express

# Create server.js (see CLAUDE.md for full code)
# Deploy to Railway, Render, or DigitalOcean App Platform
# Must have STATIC outbound IP address
# Register that IP with CompuLife for the auth ID
```

---

## VERCEL DEPLOYMENT

```json
// vercel.json
{
  "crons": [
    { "path": "/api/cron/email-sequences",   "schedule": "0 14 * * *" },
    { "path": "/api/cron/eo-expiry-alerts",  "schedule": "0 9 * * 1" },
    { "path": "/api/cron/recruiting-follow", "schedule": "0 10 * * *" },
    { "path": "/api/cron/commission-alerts", "schedule": "0 9 * * 2" }
  ]
}
```

---

## TESTING SETUP

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
});
```

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  use: { baseURL: 'http://localhost:3000' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 13'] } },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```
