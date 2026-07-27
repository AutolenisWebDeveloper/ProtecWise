import { cn } from '@/lib/utils';

/**
 * The signature premium treatment: JetBrains Mono with the decimal + suffix at
 * 65% opacity. e.g. $47.23/mo
 */
export function Premium({
  amount,
  suffix = '/mo',
  className,
}: {
  amount: number;
  suffix?: string;
  className?: string;
}) {
  const whole = Math.floor(amount);
  const cents = Math.round((amount - whole) * 100)
    .toString()
    .padStart(2, '0');

  return (
    <span className={cn('text-premium', className)}>
      <span className="align-top text-[0.55em]">$</span>
      {whole.toLocaleString()}
      <span className="text-premium-decimal">.{cents}</span>
      <span className="text-premium-decimal">{suffix}</span>
    </span>
  );
}
