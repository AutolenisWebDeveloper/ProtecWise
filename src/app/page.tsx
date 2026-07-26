export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-5xl font-bold tracking-tight">
        <span className="text-brand-navy">Protec</span>
        <span className="text-brand-green">Wise</span>
      </h1>
      <p className="text-lg text-muted-foreground">Protecting What Matters Most</p>
      <p className="max-w-md text-sm text-muted-foreground">
        Project foundation initialized. Feature development begins with the public
        marketing site in the next session.
      </p>
      <div className="mt-2 flex gap-3">
        <span className="rounded-md bg-brand-navy-tint px-3 py-1 text-sm font-medium text-brand-navy">
          Life &amp; Health Insurance
        </span>
        <span className="rounded-md bg-brand-green-tint px-3 py-1 text-sm font-medium text-brand-green-hover">
          Foundation Ready
        </span>
      </div>
    </main>
  );
}
