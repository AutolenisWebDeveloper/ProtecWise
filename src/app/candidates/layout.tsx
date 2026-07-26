import { CandidateHeader } from '@/components/layout/candidate-header';

export default function CandidatesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface">
      <CandidateHeader />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
