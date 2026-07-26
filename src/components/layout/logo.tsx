import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * ProtecWise logo lockup (the shield + wordmark PNG). Use on light chrome
 * (public header, footer, client/candidate/recruiting headers). Always sourced
 * from /public/protecwiselogo.png — never recreated.
 */
export function Logo({
  height = 44,
  href = '/',
  priority = false,
  className,
}: {
  height?: number;
  href?: string | null;
  priority?: boolean;
  className?: string;
}) {
  const img = (
    <Image
      src="/protecwiselogo.png"
      alt="ProtecWise — Life & Health Insurance"
      width={height}
      height={height}
      priority={priority}
      className={cn('object-contain', className)}
      style={{ height, width: 'auto' }}
    />
  );

  if (!href) return img;
  return (
    <Link href={href} className="inline-flex items-center" aria-label="ProtecWise home">
      {img}
    </Link>
  );
}

/**
 * Two-tone text wordmark ("Protec" + "Wise"). Use on the navy portal sidebars
 * where the white-background logo asset would clash. Defaults to the brand
 * two-tone; pass `protecClassName="text-white"` on dark backgrounds.
 */
export function Wordmark({
  className,
  protecClassName = 'text-brand-navy',
  wiseClassName = 'text-brand-green',
}: {
  className?: string;
  protecClassName?: string;
  wiseClassName?: string;
}) {
  return (
    <span className={cn('font-bold tracking-tight', className)}>
      <span className={protecClassName}>Protec</span>
      <span className={wiseClassName}>Wise</span>
    </span>
  );
}
