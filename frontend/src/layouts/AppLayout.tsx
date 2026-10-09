import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  Bell,
  Compass,
  History,
  LayoutDashboard,
  LogOut,
  Plus,
  Sparkles,
  User,
} from 'lucide-react';
import { ROUTES } from '../constants';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { RealmBackground } from '../components/common/RealmBackground';
import { cn } from '../utils';

const NAV_ITEMS = [
  { to: ROUTES.dashboard, label: 'Dashboard', Icon: LayoutDashboard },
  { to: ROUTES.paths, label: 'Paths', Icon: Compass },
  { to: ROUTES.generate, label: 'Generate', Icon: Sparkles },
  { to: ROUTES.history, label: 'History', Icon: History },
  { to: ROUTES.notifications, label: 'Alerts', Icon: Bell },
];

const HISTORY_LIKE = new Set<string>([ROUTES.history, ROUTES.notifications]);

/**
 * AppLayout — slim near-black top navigation (desktop) + compact
 * touch-friendly bottom navigation (mobile), layered over the
 * RealmBackground atmospheric artwork.
 */
export function AppLayout() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();

  const isActive = (to: string) =>
    to === ROUTES.dashboard
      ? location.pathname === to
      : HISTORY_LIKE.has(to)
        ? location.pathname === to
        : location.pathname.startsWith(to);

  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Layered atmospheric background (decorative only) */}
      <RealmBackground variant="app" />

      {/* Desktop header */}
      <header className="sticky top-0 z-40 border-b border-blood-950 bg-abyss/92 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            to={ROUTES.gate}
            className="font-display text-lg tracking-[0.24em] text-parchment-light transition-colors hover:text-blood-500"
          >
            CHALLENGEX
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
            {NAV_ITEMS.map(({ to, label, Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={cn(
                  'flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition-all',
                  isActive(to)
                    ? 'border-blood-950 bg-blood-950/70 text-blood-400 shadow-realm'
                    : 'border-transparent text-parchment-dim hover:bg-surface-hover hover:text-parchment',
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              to={ROUTES.notifications}
              className="relative rounded-lg p-2 text-parchment-dim transition-colors hover:bg-surface-hover hover:text-parchment"
              aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ''}`}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-blood-600 px-1 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
            <Link
              to={ROUTES.profile}
              className="flex items-center gap-2 rounded-lg p-2 text-parchment-dim transition-colors hover:bg-surface-hover hover:text-parchment sm:px-3 sm:py-2"
              aria-label="Profile"
            >
              <User className="h-5 w-5" />
              <span className="hidden text-xs font-semibold uppercase tracking-[0.12em] sm:inline">
                {user?.username ?? 'Profile'}
              </span>
            </Link>
            <button
              onClick={() => void logout()}
              className="rounded-lg p-2 text-parchment-dim transition-colors hover:bg-surface-hover hover:text-blood-500"
              aria-label="Log out"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-4 pb-28 pt-6 sm:px-6 lg:pb-12">
        <Outlet />
      </main>

      {/* Mobile bottom navigation */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-blood-950 bg-abyss/95 backdrop-blur lg:hidden"
        aria-label="Mobile primary"
      >
        <div className="mx-auto grid max-w-lg grid-cols-5 gap-1 px-2 py-2">
          {NAV_ITEMS.map(({ to, label, Icon }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex flex-col items-center gap-1 rounded-lg px-1 py-2 text-[10px] font-semibold uppercase tracking-wider transition-colors',
                isActive(to)
                  ? 'bg-blood-950/70 text-blood-400 shadow-realm'
                  : 'text-parchment-dim',
              )}
            >
              <Icon className="h-5 w-5" />
              {label}
            </Link>
          ))}
        </div>
        <div className="safe-area-inset-bottom" />
      </nav>

      {/* Quick action */}
      <Link
        to={ROUTES.idea}
        className="fixed bottom-24 right-4 z-40 grid h-14 w-14 place-items-center rounded-full bg-blood-800 text-parchment-light shadow-red-glow transition-transform hover:scale-105 lg:bottom-8"
        aria-label="Create a new idea"
      >
        <Plus className="h-6 w-6" />
      </Link>
    </div>
  );
}
