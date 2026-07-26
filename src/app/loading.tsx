export default function Loading() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-surface"
      role="status"
      aria-label="Loading"
    >
      <div className="flex flex-col items-center gap-3">
        <span className="h-9 w-9 animate-spin rounded-full border-2 border-brand-navy border-t-transparent" />
        <span className="text-sm text-[var(--pw-hint)]">Loading&hellip;</span>
      </div>
    </div>
  );
}
