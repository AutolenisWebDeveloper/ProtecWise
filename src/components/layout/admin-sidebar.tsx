import {
  LayoutDashboard,
  UserCog,
  Building2,
  Users,
  FileText,
  Briefcase,
  BarChart3,
  ScrollText,
  Settings,
} from 'lucide-react';
import { PortalSidebar, type SidebarItem } from './portal-sidebar';

// `badge` counts (pending agents, pending carrier approvals, etc.) are wired to
// live data when the admin system is built (Session 39). The component renders a
// badge whenever a count is provided.
const ADMIN_NAV: SidebarItem[] = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Agents', href: '/admin/agents', icon: UserCog },
  { label: 'Carriers', href: '/admin/carriers', icon: Building2 },
  { label: 'Leads', href: '/admin/leads', icon: Users },
  { label: 'Applications', href: '/admin/applications', icon: FileText },
  { label: 'Recruiting', href: '/admin/recruiting', icon: Briefcase },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'Audit log', href: '/admin/audit', icon: ScrollText },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
  return <PortalSidebar items={ADMIN_NAV} variant="admin" subtitle="Admin" />;
}
