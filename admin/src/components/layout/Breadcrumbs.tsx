import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { ADMIN_ROUTES } from '../../constants';

const LABELS: Record<string, string> = {
  admin: 'Dashboard',
  users: 'Users',
  ideas: 'Ideas',
  trials: 'Trials',
  questions: 'Questions',
  categories: 'Categories',
  'risk-rules': 'Risk Rules',
  roadmaps: 'Roadmaps',
  experiments: 'Experiments',
  analytics: 'Analytics',
  settings: 'Settings',
  admins: 'Admins',
};

/** Breadcrumbs trail for the admin shell. */
export function Breadcrumbs({ path }: { path: string }) {
  const segments = path.replace(/^\/admin\/?/, '').split('/').filter(Boolean);
  if (segments.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1.5 text-xs text-sand-dim">
      <Link to={ADMIN_ROUTES.dashboard} className="flex items-center gap-1 hover:text-sand">
        <Home className="h-3.5 w-3.5" /> Dashboard
      </Link>
      {segments.map((segment, i) => (
        <span key={`${segment}-${i}`} className="flex items-center gap-1.5">
          <ChevronRight className="h-3 w-3 text-sand-dim/50" />
          <span className={i === segments.length - 1 ? 'text-sand' : ''}>
            {LABELS[segment] ?? (segment.length === 24 ? 'Details' : segment)}
          </span>
        </span>
      ))}
    </nav>
  );
}
