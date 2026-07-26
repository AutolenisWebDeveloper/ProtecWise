'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface for diagnostics (Sentry is wired in a later hardening pass).
    console.error('[app/error]', error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-surface px-6 text-center">
      <div>
        <h1 className="text-h2">Something interrupted this page</h1>
        <p className="mt-2 max-w-md text-body text-[var(--pw-muted)]">
          We couldn&rsquo;t finish loading. This is usually temporary — try again, and if it keeps
          happening, contact us.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={reset} className="btn btn-accent">
          Try again
        </button>
        <Link href="/" className="btn btn-outline">
          Back to home
        </Link>
      </div>
    </main>
  );
}
