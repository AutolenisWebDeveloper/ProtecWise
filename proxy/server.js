// ============================================================
// ProtecWise CompuLife proxy — runs on the fixed-IP GCP host (34.16.56.64)
// ============================================================
// Why this exists: CompuLife locks the Authorization ID to ONE outbound IP.
// Vercel's serverless IPs rotate, so all CompuLife calls must originate here.
// This server injects the auth ID server-side (never exposed to the browser)
// and only accepts requests carrying the shared PROXY_SECRET.
//
// Deploy: see /COMPULIFE_SETUP.md. Run with PM2. Never commit proxy/.env.

const express = require('express');
const app = express();
app.use(express.json());

const AUTH_ID = process.env.COMPULIFE_AUTH_ID;
const PROXY_SECRET = process.env.PROXY_SECRET;
const REGISTERED_IP = '34.16.56.64'; // locked — do not change

if (!AUTH_ID) {
  console.error('FATAL: COMPULIFE_AUTH_ID not set');
  process.exit(1);
}
if (!PROXY_SECRET) {
  console.error('FATAL: PROXY_SECRET not set');
  process.exit(1);
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Main proxy endpoint — forwards any CompuLife requestType with injected auth.
app.post('/quote', async (req, res) => {
  // Only allow calls carrying the shared secret (i.e. from our Next.js server).
  if (req.headers['x-proxy-secret'] !== PROXY_SECRET) {
    console.warn(`[proxy] Unauthorized request from ${req.ip}`);
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { requestType, params } = req.body || {};
  if (!requestType || !params) {
    return res.status(400).json({ error: 'requestType and params are required' });
  }

  // Inject auth credentials server-side — never exposed to the client.
  params.COMPULIFEAUTHORIZATIONID = AUTH_ID;
  params.REMOTE_IP = REGISTERED_IP;

  const url = `https://www.compulifeapi.com/api/${encodeURIComponent(
    requestType,
  )}/?COMPULIFE=${encodeURIComponent(JSON.stringify(params))}`;

  try {
    console.log(`[proxy] ${requestType} request — ${new Date().toISOString()}`);
    const started = Date.now();

    const response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      console.error(`[proxy] CompuLife returned ${response.status}`);
      return res
        .status(502)
        .json({ error: 'Quote engine returned an error. Please try again.' });
    }

    const data = await response.json();
    console.log(`[proxy] ${requestType} success — ${Date.now() - started}ms`);
    res.json(data);
  } catch (err) {
    if (err && err.name === 'TimeoutError') {
      console.error('[proxy] CompuLife request timed out');
      return res.status(504).json({ error: 'Quote engine timed out. Please try again.' });
    }
    console.error('[proxy] Unexpected error:', err && err.message);
    res.status(502).json({ error: 'Quote engine unavailable. Please try again.' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[proxy] ProtecWise CompuLife proxy running on port ${PORT}`);
  console.log(`[proxy] Outbound IP: ${REGISTERED_IP}`);
  console.log(`[proxy] Auth ID: ***${AUTH_ID.slice(-4)}`); // last 4 only, never the full id
});
