import { PortalHeader, type PortalHeaderItem } from './portal-header';

const CLIENT_NAV: PortalHeaderItem[] = [
  { label: 'Dashboard', href: '/client', exact: true },
  { label: 'Quotes', href: '/client/quotes' },
  { label: 'Applications', href: '/client/applications' },
  { label: 'Messages', href: '/client/messages' },
  { label: 'Documents', href: '/client/documents' },
  { label: 'Profile', href: '/client/profile' },
];

export function ClientHeader() {
  return <PortalHeader items={CLIENT_NAV} homeHref="/client" signOutRedirect="/client/login" />;
}
