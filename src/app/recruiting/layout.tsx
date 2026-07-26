import { RecruitingHeader } from '@/components/layout/recruiting-header';
import { PublicFooter } from '@/components/layout/public-footer';

export default function RecruitingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <RecruitingHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
