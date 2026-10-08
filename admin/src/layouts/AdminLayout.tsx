import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Beaker,
  BookOpen,
  FlaskConical,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Map,
  Menu,
  Settings,
  Shield,
  Tag,
  Target,
  Users,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { ADMIN_ROUTES, NAV_SECTIONS } from '../constants';
import { useAdminAuth } from '../context/AdminAuthContext';
import { cn, initials } from '../utils';
import { Breadcrumbs } from '../components/layout/Breadcrumbs';
import { Header } from '../components/layout/Header';

const SECTION_ICONS: Record<string, typeof Users> = {
  Overview: LayoutDashboard,
  Content: BookOpen,
  People: Users,
  'Challenge Engine': Target,
  Administration: Settings,
};

const ITEM_ICONS: Record<string, typeof Users> = {
  [ADMIN_ROUTES.dashboard]: LayoutDashboard,
  [ADMIN_ROUTES.analytics]: BarChart3,
  [ADMIN_ROUTES.ideas]: BookOpen,
  [ADMIN_ROUTES.trials]: Shield,
  [ADMIN_ROUTES.experiments]: Beaker,
  [ADMIN_ROUTES.users]: Users,
  [ADMIN_ROUTES.questions]: HelpCircle,
  [ADMIN_ROUTES.categories]: Tag,
  [ADMIN_ROUTES.riskRules]: Target,
  [ADMIN_ROUTES.roadmaps]: Map,
  [ADMIN_ROUTES.admins]: Shield,
  [ADMIN_ROUTES.settings]: Settings,
};

/**
 * AdminLayout — sidebar + header + breadcrumbs shell with a
 * mobile-friendly collapsible sidebar (responsive admin requirement).
 */
export function AdminLayout() {
  const { admin, logout, isSuperAdmin } = useAdminAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const nav = (
    <nav className="flex h-full flex-col gap-5 overflow-y-auto p-4">
      <Link to={ADMIN_ROUTES.dashboard} className="flex items-center gap-2 px-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg border border-brand-800 bg-brand-950/60 font-display text-sm font-bold text-brand-500">
          X
        </span>
        <span className="admin-title text-sm text-sand-light">ChallengeX</span>
        <span className="ml-auto rounded border border-white/10 px-1.5 py-0.5 text-[9px] font-bold tracking-widest text-sand-dim">
          ADMIN
        </span>
      </Link>

      {NAV_SECTIONS.map((section) => {
        const visible = section.items.filter((item) => !item.superAdminOnly || isSuperAdmin);
        if (visible.length === 0) return null;
        const Icon = SECTION_ICONS[section.label] ?? LayoutDashboard;
        return (
          <div key={section.label}>
            <p className="mb-1.5 flex items-center gap-2 px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-sand-dim/60">
              <Icon className="h-3 w-3" /> {section.label}
            </p>
            <ul className="space-y-0.5">
              {visible.map((item) => {
                const ItemIcon = ITEM_ICONS[item.to] ?? Chevron;
                return (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
                          isActive
                            ? 'bg-brand-950/70 font-semibold text-brand-400'
                            : 'text-sand-dim hover:bg-white/[0.03] hover:text-sand',
                        )
                      }
                    >
                      <ItemIcon className="h-4 w-4" />
                      {item.label}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}

      <div className="mt-auto border-t border-white/5 pt-4">
        <div className="flex items-center gap-3 px-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-950 text-[11px] font-bold text-brand-400">
            {initials(admin?.name ?? 'A')}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-sand">{admin?.name}</p>
            <p className="truncate text-[10px] uppercase tracking-wider text-sand-dim">
              {admin?.role}
            </p>
          </div>
          <button
            onClick={() => void logout()}
            className="p-1.5 text-sand-dim hover:text-brand-400"
            aria-label="Log out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </nav>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-white/5 bg-ink-900 lg:block">
        {nav}
      </aside>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-ink-900 animate-fade-in">{nav}</aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          onMenuClick={() => setSidebarOpen((v) => !v)}
          menuIcon={sidebarOpen ? X : Menu}
        />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <Breadcrumbs path={location.pathname} />
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function Chevron() {
  return <span className="h-4 w-4" />;
}
