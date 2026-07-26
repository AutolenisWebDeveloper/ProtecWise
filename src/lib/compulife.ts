// ============================================================
// CompuLife — server-side proxy client
// ============================================================
// The ONLY way the app talks to CompuLife. Calls the fixed-IP proxy
// (COMPULIFE_PROXY_URL) with the shared PROXY_SECRET; the proxy injects the
// auth ID and forwards to compulifeapi.com. Never call CompuLife from the
// browser — always go through a server route that uses this helper.

/** Error carrying an HTTP status so routes can map it to a response. */
export class CompuLifeError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'CompuLifeError';
    this.status = status;
  }
}

/** CompuLife requestType values the platform uses. */
export type CompuLifeRequestType =
  | 'StateList'
  | 'CompanyList'
  | 'CompanyLogoList'
  | 'CompanyProductList'
  | 'CategoryList'
  | 'request'
  | 'sidebyside'
  | 'ip';

/**
 * Call the fixed-IP CompuLife proxy. Throws CompuLifeError (with an HTTP
 * status) on misconfiguration, timeout, or a non-2xx proxy response.
 */
export async function callCompuLifeProxy<T = unknown>(
  requestType: CompuLifeRequestType,
  params: Record<string, unknown> = {},
): Promise<T> {
  const proxyUrl = process.env.COMPULIFE_PROXY_URL;
  const secret = process.env.PROXY_SECRET;

  if (!proxyUrl || !secret) {
    throw new CompuLifeError('Quote engine is not configured. Contact support.', 503);
  }

  let res: Response;
  try {
    res = await fetch(`${proxyUrl}/quote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-proxy-secret': secret },
      body: JSON.stringify({ requestType, params }),
      signal: AbortSignal.timeout(20000),
      cache: 'no-store',
    });
  } catch (err) {
    if (err instanceof Error && err.name === 'TimeoutError') {
      throw new CompuLifeError('Quote engine timed out. Please try again.', 504);
    }
    throw new CompuLifeError('Quote engine unavailable. Please try again.', 502);
  }

  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new CompuLifeError(data.error ?? 'Quote engine error.', res.status);
  }

  return (await res.json()) as T;
}
