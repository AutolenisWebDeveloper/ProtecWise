import { PortalHeader, type PortalHeaderItem } from './portal-header';

const CANDIDATE_NAV: PortalHeaderItem[] = [
  { label: 'Dashboard', href: '/candidates', exact: true },
  { label: 'My application', href: '/candidates/application' },
  { label: 'Documents', href: '/candidates/documents' },
  { label: 'Schedule', href: '/candidates/schedule' },
  { label: 'Messages', href: '/candidates/messages' },
];

export function CandidateHeader() {
  return (
    <PortalHeader items={CANDIDATE_NAV} homeHref="/candidates" signOutRedirect="/candidates/login" />
  );
}
