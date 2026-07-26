# COMPULIFE API — PROTECWISE SETUP GUIDE
## Everything needed to configure and run the CompuLife quote engine

---

## YOUR ACCOUNT DETAILS

| Field | Value |
|---|---|
| **Company** | COMPULIFE Software, Inc. |
| **Contact** | Jeremiah Kuhn |
| **Registered Deployment IP** | `34.16.56.64` |
| **Dev Authorization ID** | `66b12312b` |
| **Dev Request Limit** | 500 total (shared across all dev calls) |
| **API Docs** | https://docs.compulife.com |
| **Sample Files** | https://compulifeapi.com/files/compulife-api-samples.zip |

---

## CRITICAL: HOW THE IP LOCK WORKS

CompuLife authenticates EVERY request by matching the Authorization ID to
the registered outbound IP address. If the IP doesn't match, the call fails silently.

```
Your registered IP: 34.16.56.64
This IP must be the OUTBOUND IP of every CompuLife API call.

Vercel serverless functions = rotating IPs = WILL FAIL
That is why the proxy server on 34.16.56.64 is mandatory.

Request flow:
Next.js app (Vercel) → proxy/server.js (34.16.56.64) → compulifeapi.com
```

**34.16.56.64 is a Google Cloud Platform IP.** This is your proxy server host.
All API calls that reach CompuLife must originate from this IP.

---

## TWO AUTH IDs — UNDERSTAND THE DIFFERENCE

### Development ID: `66b12312b`
- For testing and development ONLY
- Does NOT count against your 1,200/month limit
- Limited to **500 total requests** (lifetime — across all dev calls, not monthly)
- Use during build sessions to conserve your production quota
- NEVER put this in production — swap before go-live
- When 500 runs out, contact Jeremiah Kuhn for a fresh dev ID

### Production ID (separate from dev ID)
- Your real authorization ID — different from `66b12312b`
- Counts against your **1,200 quote/month** subscription limit
- Registered to IP `34.16.56.64` — will fail from any other IP
- Store ONLY in:
  - `/home/protecwise/proxy/.env` on the GCP server (as `COMPULIFE_AUTH_ID=`)
  - Vercel environment variables (if ever needed — but prefer proxy-side only)
- NEVER share in chat, email, Slack, or any message
- NEVER commit to git — verify `.gitignore` covers `proxy/.env`
- NEVER log it — `proxy/server.js` logs only the last 4 characters

---

## PROXY SERVER SETUP ON 34.16.56.64

The proxy server must run continuously on the GCP instance at 34.16.56.64.
Here are the exact steps to set it up:

### Step 1 — SSH into the GCP instance
```bash
# From your local machine
gcloud compute ssh [instance-name] --project=[project-id] --zone=[zone]
# OR using standard SSH if you have the key:
ssh user@34.16.56.64
```

### Step 2 — Install Node.js (if not installed)
```bash
# On Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version  # verify
```

### Step 3 — Create the proxy directory and files
```bash
mkdir -p /home/protecwise/proxy
cd /home/protecwise/proxy
```

Create `server.js`:
```javascript
// /home/protecwise/proxy/server.js
const express = require('express');
const app = express();
app.use(express.json());

const AUTH_ID = process.env.COMPULIFE_AUTH_ID;
const PROXY_SECRET = process.env.PROXY_SECRET;
const REGISTERED_IP = '34.16.56.64';  // locked — do not change

if (!AUTH_ID) { console.error('FATAL: COMPULIFE_AUTH_ID not set'); process.exit(1); }
if (!PROXY_SECRET) { console.error('FATAL: PROXY_SECRET not set'); process.exit(1); }

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Main quote proxy endpoint
app.post('/quote', async (req, res) => {
  // Validate shared secret — only allow calls from Vercel
  if (req.headers['x-proxy-secret'] !== PROXY_SECRET) {
    console.warn(`[proxy] Unauthorized request from ${req.ip}`);
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { requestType, params } = req.body;

  if (!requestType || !params) {
    return res.status(400).json({ error: 'requestType and params are required' });
  }

  // Inject auth credentials server-side — never exposed to client
  params.COMPULIFEAUTHORIZATIONID = AUTH_ID;
  params.REMOTE_IP = REGISTERED_IP;

  const url = `https://www.compulifeapi.com/api/${requestType}/?COMPULIFE=${encodeURIComponent(JSON.stringify(params))}`;

  try {
    console.log(`[proxy] ${requestType} request — ${new Date().toISOString()}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(15000),  // 15s timeout
    });

    if (!response.ok) {
      console.error(`[proxy] CompuLife returned ${response.status}`);
      return res.status(502).json({
        error: 'Quote engine returned an error. Please try again.'
      });
    }

    const data = await response.json();

    // Log basic success info (never log auth data)
    console.log(`[proxy] ${requestType} success — ${Date.now()}ms`);

    res.json(data);

  } catch (err) {
    if (err.name === 'TimeoutError') {
      console.error('[proxy] CompuLife request timed out');
      return res.status(504).json({ error: 'Quote engine timed out. Please try again.' });
    }
    console.error('[proxy] Unexpected error:', err.message);
    res.status(502).json({ error: 'Quote engine unavailable. Please try again.' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[proxy] ProtecWise CompuLife proxy running on port ${PORT}`);
  console.log(`[proxy] Outbound IP: ${REGISTERED_IP}`);
  console.log(`[proxy] Auth ID: ***${AUTH_ID.slice(-4)}`);  // log last 4 only
});
```

Create `package.json`:
```json
{
  "name": "protecwise-compulife-proxy",
  "version": "1.0.0",
  "description": "Fixed-IP proxy for CompuLife API calls",
  "scripts": {
    "start": "node server.js",
    "dev": "COMPULIFE_AUTH_ID=66b12312b PROXY_SECRET=dev-secret node server.js"
  },
  "dependencies": {
    "express": "^4.18.0"
  }
}
```

Create `.env`:
```bash
# /home/protecwise/proxy/.env
# NEVER commit this file to git

# Development (500 request limit):
# COMPULIFE_AUTH_ID=66b12312b

# Production (set when live):
COMPULIFE_AUTH_ID=

# Must match PROXY_SECRET in your Vercel/Next.js env vars
PROXY_SECRET=generate-a-strong-random-secret-here

PORT=3001
```

### Step 4 — Install and start
```bash
cd /home/protecwise/proxy
npm install

# Load env and test
source .env
node server.js &

# Test health check
curl http://localhost:3001/health
# Expected: {"status":"ok","timestamp":"..."}

# Test from Vercel side (replace with actual values):
curl -X POST http://34.16.56.64:3001/quote \
  -H "Content-Type: application/json" \
  -H "x-proxy-secret: your-proxy-secret" \
  -d '{"requestType": "StateList", "params": {}}'
```

### Step 5 — Keep it running with PM2
```bash
# Install PM2 process manager
npm install -g pm2

# Start with PM2
cd /home/protecwise/proxy
pm2 start server.js --name protecwise-proxy --env production

# Auto-restart on server reboot
pm2 startup
pm2 save

# Monitor logs
pm2 logs protecwise-proxy
pm2 status
```

### Step 6 — Open firewall port on GCP
```bash
# In GCP Console → VPC Network → Firewall Rules
# OR via gcloud CLI:
gcloud compute firewall-rules create protecwise-proxy-3001 \
  --action=ALLOW \
  --direction=INGRESS \
  --rules=tcp:3001 \
  --source-ranges=[YOUR_VERCEL_IPS]  # restrict to Vercel IP ranges for security
  # OR --source-ranges=0.0.0.0/0 for open (less secure, simpler for now)
```

---

## NEXT.JS API ROUTE — `/api/compulife/proxy`

```typescript
// src/app/api/compulife/proxy/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const PROXY_URL = process.env.COMPULIFE_PROXY_URL;
  const PROXY_SECRET = process.env.PROXY_SECRET;

  if (!PROXY_URL || !PROXY_SECRET) {
    console.error('[compulife/proxy] Missing COMPULIFE_PROXY_URL or PROXY_SECRET');
    return NextResponse.json(
      { error: 'Quote engine not configured. Contact support.' },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();

    const proxyResponse = await fetch(`${PROXY_URL}/quote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-proxy-secret': PROXY_SECRET,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(20000),
    });

    if (!proxyResponse.ok) {
      const errorData = await proxyResponse.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || 'Quote engine error.' },
        { status: proxyResponse.status }
      );
    }

    const data = await proxyResponse.json();
    return NextResponse.json(data);

  } catch (err: any) {
    if (err.name === 'TimeoutError') {
      return NextResponse.json(
        { error: 'Quote engine timed out. Please try again.' },
        { status: 504 }
      );
    }
    console.error('[compulife/proxy] Error:', err.message);
    return NextResponse.json(
      { error: 'Quote engine unavailable. Please try again.' },
      { status: 502 }
    );
  }
}
```

---

## ENVIRONMENT VARIABLES — BOTH LOCATIONS

### On the GCP proxy server (`/home/protecwise/proxy/.env`)
```bash
COMPULIFE_AUTH_ID=66b12312b   # dev — swap for production ID when live
PROXY_SECRET=your-strong-random-secret
PORT=3001
```

### In your Next.js `.env.local` (Vercel environment variables)
```bash
COMPULIFE_PROXY_URL=http://34.16.56.64:3001
PROXY_SECRET=your-strong-random-secret   # must match proxy server
COMPULIFE_REGISTERED_IP=34.16.56.64
COMPULIFE_MONTHLY_QUOTE_SOFT_LIMIT=1000
COMPULIFE_MONTHLY_QUOTE_HARD_LIMIT=1150
```

**The `PROXY_SECRET` must be identical on both servers.**
Generate with: `openssl rand -hex 32`

---

## VERIFYING THE CONNECTION END-TO-END

Run this test sequence before any development work:

### Test 1 — Proxy server is running
```bash
curl http://34.16.56.64:3001/health
# Expected: {"status":"ok","timestamp":"2024-..."}
```

### Test 2 — Proxy auth works
```bash
# Without secret — should fail
curl -X POST http://34.16.56.64:3001/quote \
  -H "Content-Type: application/json" \
  -d '{"requestType": "StateList", "params": {}}'
# Expected: {"error":"Unauthorized"}

# With correct secret — should succeed
curl -X POST http://34.16.56.64:3001/quote \
  -H "Content-Type: application/json" \
  -H "x-proxy-secret: your-proxy-secret" \
  -d '{"requestType": "StateList", "params": {}}'
# Expected: JSON array of states
```

### Test 3 — CompuLife auth ID is working
```bash
# This call requires COMPULIFEAUTHORIZATIONID (dev ID: 66b12312b)
# The proxy injects it — you don't need to send it
curl -X POST http://34.16.56.64:3001/quote \
  -H "Content-Type: application/json" \
  -H "x-proxy-secret: your-proxy-secret" \
  -d '{
    "requestType": "request",
    "params": {
      "BirthMonth": "6",
      "Birthday": "15",
      "BirthYear": "1985",
      "Sex": "M",
      "Smoker": "N",
      "Health": "PP",
      "CompRating": "1",
      "NewCategory": "5",
      "FaceAmount": "500000",
      "ModeUsed": "M",
      "State": "44",
      "ZipCode": "75001",
      "ErrOnMissingZipCode": "ON",
      "SortOverride1": "A"
    }
  }'
# Expected: Compulife_ComparisonResults array with carriers and premiums
```

### Test 4 — From Next.js (via /api/compulife/proxy)
```bash
curl -X POST https://your-app.vercel.app/api/compulife/proxy \
  -H "Content-Type: application/json" \
  -d '{"requestType": "StateList", "params": {}}'
# Expected: Same state list
```

All 4 tests must pass before starting Session 7 (Quote Flow) of the build sequence.

---

## DEV ID BUDGET — 500 REQUESTS

The dev ID (`66b12312b`) has 500 lifetime requests. Budget them carefully.

| Activity | Estimated Calls | Running Total |
|---|---|---|
| Initial proxy health + auth tests | 10 | 10 |
| StateList + CompanyList + LogoList (cache warmup) | 5 | 15 |
| Quote form development (Session 7) | 50 | 65 |
| Carrier permission system testing | 20 | 85 |
| Agent portal quote builder testing | 30 | 115 |
| Application intake quote snapshot tests | 10 | 125 |
| Needs calculator → quote pre-fill tests | 10 | 135 |
| Recruiting and admin quote tests | 15 | 150 |
| QA + bug fixes | 50 | 200 |
| **Buffer remaining** | — | **300 left** |

**Cache strategy — saves ~80% of dev calls:**
```typescript
// These 3 endpoints are static data — cache for 24 hours
// GET /api/compulife/states → NextResponse with revalidate: 86400
// GET /api/compulife/logos  → NextResponse with revalidate: 86400
// GET /api/compulife/carriers → NextResponse with revalidate: 86400

// ONLY the /api/request (comparison quote) and /api/sidebyside
// consume meaningful quota — they run live on every user quote request
```

**When dev ID runs out:** Contact Jeremiah Kuhn at CompuLife for a new dev ID.
Do NOT switch to production ID during development — protect your 1,200/month limit.

---

## PRODUCTION MONTHLY LIMIT — 1,200 QUOTES/MONTH

Your subscription allows 1,200 quote comparisons per calendar month.

| Threshold | Value | Action |
|---|---|---|
| Soft alert | 1,000 quotes | Amber banner in admin dashboard |
| Hard block | 1,150 quotes | Disable public quote form, show capacity message |
| Subscription limit | 1,200 quotes | CompuLife may reject further calls |
| Buffer | 50 quotes | Space between hard block and actual limit |

**At current traffic:**
- 1,200 quotes/month = 40 quotes/day = ~1.7 quotes/hour
- This is sufficient for MVP and early growth
- Contact CompuLife to upgrade tier when approaching consistent 1,000+/month

**What counts as one quote:**
- Each `/api/request` call to CompuLife = 1 quote
- Quote modifications that re-run = 1 additional quote
- Agent-sent quotes that re-run on modification = 1 additional quote
- Cached results served from database = 0 (free — use extensively)

**Maximize your quota — cache aggressively:**
```typescript
// After a quote runs, store full results in the quotes table
// On the shared quote view (/quote/view/[shareToken]):
// → Serve from database, NOT a new API call
// On quote modification:
// → Only call CompuLife if inputs actually changed
// On agent re-viewing a quote they already ran:
// → Serve from database
```

---

## WHAT HAPPENS WHEN AUTH FAILS

If CompuLife receives a call from the wrong IP or with a wrong auth ID, it either:
- Returns empty results (not an error — just no data)
- Returns an auth error message in the JSON

**Always add this check in quote API routes:**
```typescript
const data = await proxyResponse.json();

// Check for CompuLife auth failure
if (!data.Compulife_ComparisonResults) {
  if (data.error || data.ErrorCode) {
    console.error('[quote/run] CompuLife error:', data);
    return NextResponse.json(
      { error: 'Quote engine authentication failed. Contact support.' },
      { status: 500 }
    );
  }
  // Empty results (valid response, no carriers match)
  return NextResponse.json(
    { error: 'No quotes available for this profile. Try different inputs.' },
    { status: 422 }
  );
}
```

---

## PRODUCTION CHECKLIST

Before going live, verify with CompuLife:
- [ ] Production Authorization ID obtained from CompuLife
- [ ] Production ID registered to `34.16.56.64` (confirm with Jeremiah Kuhn)
- [ ] Dev ID (`66b12312b`) removed from all production env vars
- [ ] Proxy server running on PM2 with auto-restart enabled
- [ ] Port 3001 open on GCP firewall for Vercel IP ranges
- [ ] Test 4 (end-to-end from Vercel through proxy to CompuLife) passing
- [ ] Monthly soft limit (1000) and hard limit (1150) set correctly in env vars
- [ ] Admin dashboard showing monthly quote count widget
- [ ] `.env.local` and proxy `.env` are both in `.gitignore`

---

## CONTACT COMPULIFE SUPPORT

For production auth ID, IP changes, or billing:

**Jeremiah Kuhn**
COMPULIFE Software, Inc.
1509 Paradise Camp Road
Harrodsburg, KY 40330

API Documentation: https://docs.compulife.com
Sample Code: https://compulifeapi.com/files/compulife-api-samples.zip
