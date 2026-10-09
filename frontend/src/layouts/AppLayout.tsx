import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Bell, Menu, Plus, User } from 'lucide-react';
import { ROUTES } from '../constants';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { RealmBackground } from '../components/common/RealmBackground';
import { Sidebar } from '../components/navigation/Sidebar';
import { MobileSidebarDrawer } from '../components/navigation/MobileSidebarDrawer';
import { pageLabelFromPath } from '../components/navigation/navItems';
import { cn } from '../utils';

const SIDEBAR_STATE_KEY = 'challengex:sidebar-collapsed';

/**
 * AppLayout — authenticated application shell: fixed left sidebar
 * (desktop), compact breadcrumb toolbar with notification/profile
 * controls, and a mobile navigation drawer, all layered over the
 * RealmBackground atmospheric artwork.
 */
export function AppLayout() {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();

  // Collapsed sidebar is a pure UI preference — remembered locally.
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return window.localStorage.getItem(SIDEBAR_STATE_KEY) === '1';
    } catch {
      return false;
    }
  });

  const toggleCollapse = () =>
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(SIDEBAR_STATE_KEY, next ? '1' : '0');
      } catch {
        /* storage unavailable — preference applies for this session only */
      }
      return next;
    });

  const [drawerOpen, setDrawerOpen] = useState(false);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  const pageLabel = pageLabelFromPath(location.pathname);

  return (
    <div
      className={cn(
        'cx-app relative min-h-screen',
        collapsed && 'cx-app--collapsed',
      )}
    >
      {/* Layered atmospheric background (decorative only) */}
      <RealmBackground variant="app" />

      {/* Desktop vertical sidebar (hidden below lg) */}
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
        unreadCount={unreadCount}
      />

      {/* Content column beside the sidebar */}
      <div className="cx-app-content">
        {/* Compact page header: hamburger + breadcrumbs + controls */}
        <header className="sticky top-0 z-30 border-b border-blood-950 bg-abyss/90 backdrop-blur">
          <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="cx-hamburger"
                aria-label="Open navigation menu"
                aria-haspopup="dialog"
                aria-expanded={drawerOpen}
                aria-controls="cx-mobile-drawer"
              >
                <Menu aria-hidden className="h-5 w-5" />
              </button>

              <nav aria-label="Breadcrumb" className="min-w-0">
                <ol className="flex min-w-0 items-center gap-2 font-cinzel text-[11px] uppercase tracking-[0.2em] text-parchment-dim">
                  {pageLabel !== 'Dashboard' && (
                    <>
                      <li className="shrink-0">
                        <Link
                          to={ROUTES.dashboard}
                          className="transition-colors hover:text-parchment"
                        >
                          Dashboard
                        </Link>
                      </li>
                      <li aria-hidden className="shrink-0 text-parchment-muted/70">
                        /
                      </li>
                    </>
                  )}
                  <li aria-current="page" className="truncate text-parchment">
                    {pageLabel}
                  </li>
                </ol>
              </nav>
            </div>

            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              <Link
                to={ROUTES.notifications}
                className="relative rounded-lg p-2 text-parchment-dim transition-colors hover:bg-surface-hover hover:text-parchment"
                aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ''}`}
              >
                <Bell aria-hidden className="h-5 w-5" />
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
                <User aria-hidden className="h-5 w-5" />
                <span className="hidden text-xs font-semibold uppercase tracking-[0.12em] sm:inline">
                  {user?.username ?? 'Profile'}
                </span>
              </Link>
            </div>
          </div>
        </header>

        {/* Page content — centered container with a sensible max width */}
        <main className="relative flex-1 px-4 pb-16 pt-6 sm:px-6 lg:pb-12">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile navigation drawer */}
      <MobileSidebarDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        unreadCount={unreadCount}
      />

      {/* Quick action */}
      <Link
        to={ROUTES.idea}
        className="fixed bottom-6 right-4 z-40 grid h-14 w-14 place-items-center rounded-full bg-blood-800 text-parchment-light shadow-red-glow transition-transform hover:scale-105 lg:bottom-8"
        aria-label="Create a new idea"
      >
        <Plus aria-hidden className="h-6 w-6" />
      </Link>
    </div>
  );
}
