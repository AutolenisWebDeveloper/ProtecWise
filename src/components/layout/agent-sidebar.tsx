import {
  LayoutDashboard,
  Users,
  Home,
  Target,
  FileBarChart,
  FileText,
  FolderOpen,
  ListChecks,
  Calendar,
  MessageSquare,
  DollarSign,
  ShieldCheck,
} from 'lucide-react';
import { PortalSidebar, type SidebarItem } from './portal-sidebar';

const AGENT_NAV: SidebarItem[] = [
  { label: 'Dashboard', href: '/agent', icon: LayoutDashboard, exact: true },
  { label: 'Leads', href: '/agent/leads', icon: Users },
  { label: 'Households', href: '/agent/households', icon: Home },
  { label: 'Pipeline', href: '/agent/opportunities', icon: Target },
  { label: 'Quotes', href: '/agent/quotes', icon: FileBarChart },
  { label: 'Applications', href: '/agent/applications', icon: FileText },
  { label: 'Forms', href: '/agent/forms', icon: FolderOpen },
  { label: 'Tasks', href: '/agent/tasks', icon: ListChecks },
  { label: 'Calendar', href: '/agent/calendar', icon: Calendar },
  { label: 'Messages', href: '/agent/messages', icon: MessageSquare },
  { label: 'Commissions', href: '/agent/commissions', icon: DollarSign },
  { label: 'Compliance', href: '/agent/compliance', icon: ShieldCheck },
];

export function AgentSidebar() {
  return <PortalSidebar items={AGENT_NAV} variant="agent" subtitle="Agent portal" />;
}
