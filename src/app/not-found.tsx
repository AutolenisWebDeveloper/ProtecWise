import Link from 'next/link';
import { Logo } from '@/components/layout/logo';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-surface px-6 text-center">
      <Logo height={52} />
      <div>
        <p className="font-mono text-5xl font-bold text-brand-navy">404</p>
        <h1 className="mt-3 text-h2">We couldn&rsquo;t find that page</h1>
        <p className="mt-2 max-w-md text-body text-[var(--pw-muted)]">
          The page you&rsquo;re looking for may have moved or no longer exists. Let&rsquo;s get you
          back on track.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/" className="btn btn-outline">
          Back to home
        </Link>
        <Link href="/quote/select" className="btn btn-accent">
          Get a quote
        </Link>
      </div>
    </main>
  );
}
