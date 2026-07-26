# ProtecWise CompuLife proxy

A tiny Express server that must run on the **fixed-IP host registered with
CompuLife** (`34.16.56.64`). CompuLife locks the Authorization ID to one
outbound IP; Vercel's serverless IPs rotate, so every CompuLife call is routed
Next.js → **this proxy** → `compulifeapi.com`.

See [`/COMPULIFE_SETUP.md`](../COMPULIFE_SETUP.md) for the full deploy guide
(SSH, Node install, PM2, GCP firewall) and the end-to-end connection tests.

## Quick start (on the proxy host)

```bash
cd /home/protecwise/proxy
cp .env.example .env        # fill in COMPULIFE_AUTH_ID + PROXY_SECRET
npm install
node server.js             # or: pm2 start server.js --name protecwise-proxy
curl http://localhost:3001/health   # -> {"status":"ok",...}
```

## Contract

- `GET  /health` → `{ status: "ok", timestamp }`
- `POST /quote`  → requires header `x-proxy-secret: <PROXY_SECRET>`, body
  `{ requestType, params }`. The proxy injects `COMPULIFEAUTHORIZATIONID` and
  `REMOTE_IP`, calls `https://www.compulifeapi.com/api/<requestType>/`, and
  returns the JSON.

`requestType` values used by the platform: `StateList`, `CompanyList`,
`CompanyLogoList`, `request` (quote comparison), `ip` (verify outbound IP).

## Security

- `.env` is git-ignored — never commit the auth ID or proxy secret.
- The server logs only the **last 4 characters** of the auth ID.
- Requests without a valid `x-proxy-secret` are rejected with `401`.
