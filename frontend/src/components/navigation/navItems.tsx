import type { LucideIcon } from 'lucide-react';
import {
  Bell,
  BookMarked,
  Compass,
  FlaskConical,
  History,
  LayoutDashboard,
  Map,
  Sparkles,
} from 'lucide-react';
import { ROUTES } from '../../constants';

export interface NavItem {
  to: string;
  label: string;
  Icon: LucideIcon;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

/**
 * Sidebar navigation grouped into logical sections.
 * Every entry maps to an existing route in ROUTES — no invented routes.
 * (Settings is intentionally absent: no settings route exists.)
 */
export const NAV_SECTIONS: NavSection[] = [
  {
    label: 'Main',
    items: [
      { to: ROUTES.dashboard, label: 'Dashboard', Icon: LayoutDashboard },
      { to: ROUTES.paths, label: 'Paths', Icon: Compass },
      { to: ROUTES.generate, label: 'Generate Ideas', Icon: Sparkles },
      { to: ROUTES.history, label: 'History', Icon: History },
      { to: ROUTES.notifications, label: 'Alerts', Icon: Bell },
    ],
  },
  {
    label: 'Library',
    items: [
      { to: ROUTES.roadmaps, label: 'Roadmaps', Icon: Map },
      { to: ROUTES.ideas, label: 'Saved Ideas', Icon: BookMarked },
      { to: ROUTES.experiments, label: 'Experiments', Icon: FlaskConical },
    ],
  },
];

/** Human-readable label for a top-level path segment (used by breadcrumbs). */
const SEGMENT_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  paths: 'Paths',
  idea: 'New Trial',
  generate: 'Generate Ideas',
  history: 'History',
  notifications: 'Alerts',
  roadmaps: 'Roadmaps',
  roadmap: 'Roadmap',
  ideas: 'Saved Ideas',
  experiments: 'Experiments',
  profile: 'Profile',
  trial: 'Trial',
  verdict: 'Verdict',
};

/** Derive a display label for the current route (falls back to Dashboard). */
export function pageLabelFromPath(pathname: string): string {
  const segment = pathname.split('/').filter(Boolean)[0];
  if (!segment) return 'Dashboard';
  return SEGMENT_LABELS[segment] ?? 'Dashboard';
}
