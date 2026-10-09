import { useId } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ChevronsLeft, ChevronsRight, LogOut, User as UserIcon } from 'lucide-react';
import { ROUTES } from '../../constants';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils';
import { NAV_SECTIONS } from './navItems';
import { SidebarItem } from './SidebarItem';

interface SidebarContentProps {
  /** Icon-only rendering (desktop collapse state). Drawer always passes false. */
  collapsed: boolean;
  /** Desktop collapse/expand handler. Omitted in the drawer. */
  onToggleCollapse?: () => void;
  /** Called after any navigation (used by the drawer to close itself). */
  onNavigate?: () => void;
  /** Unread notifications count surfaced on the Alerts item. */
  unreadCount?: number;
}

/**
 * SidebarContent — the shared inner sidebar composition (branding,
 * grouped navigation, collapse control, profile + logout). Rendered by
 * the fixed desktop Sidebar and by the MobileSidebarDrawer so the
 * navigation is defined exactly once.
 */
export function SidebarContent({
  collapsed,
  onToggleCollapse,
  onNavigate,
  unreadCount = 0,
}: SidebarContentProps) {
  const { user, logout } = useAuth();
  const navId = useId();

  return (
    <>
      {/* Branding */}
      <div className="shrink-0 px-5 pb-3 pt-5">
        <Link
          to={ROUTES.gate}
          onClick={onNavigate}
          aria-label="ChallengeX — enter the gate"
          className={cn(
            'flex items-center font-display transition-colors duration-200 hover:text-blood-400',
            collapsed && 'justify-center',
          )}
        >
          {collapsed ? (
            <span className="text-xl font-bold tracking-[0.06em] text-parchment-light">
              CX
            </span>
          ) : (
            <span className="text-[17px] tracking-[0.24em] text-parchment-light">
              CHALLENGEX
            </span>
          )}
        </Link>
      </div>

      {/* Subtle crimson divider beneath the branding */}
      <div
        role="presentation"
        className="mx-5 h-px shrink-0 bg-gradient-to-r from-blood-600/50 via-blood-950 to-transparent"
      />

      {/* Scrollable navigation */}
      <nav
        id={navId}
        aria-label="Primary"
        className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3.5 py-4"
      >
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-5 last:mb-0">
            {!collapsed && (
              <p className="mb-2 px-2.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-parchment-muted">
                {section.label}
              </p>
            )}
            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => (
                <SidebarItem
                  key={item.to}
                  to={item.to}
                  label={item.label}
                  Icon={item.Icon}
                  collapsed={collapsed}
                  onNavigate={onNavigate}
                  badgeCount={item.to === ROUTES.notifications ? unreadCount : 0}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse control + account footer */}
      <div className="shrink-0 space-y-1 border-t border-blood-950/80 px-3.5 pb-4 pt-3">
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-expanded={!collapsed}
            aria-controls={navId}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={cn(
              'flex w-full items-center rounded-lg px-2.5 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-parchment-muted transition-colors duration-200 hover:bg-surface-hover hover:text-parchment',
              collapsed && 'justify-center px-0',
            )}
          >
            {collapsed ? (
              <ChevronsRight aria-hidden className="h-4 w-4" />
            ) : (
              <>
                <ChevronsLeft aria-hidden className="h-4 w-4" />
                <span className="ml-2.5">Collapse</span>
              </>
            )}
          </button>
        )}

        {/* Compact user profile (navigates to Profile) */}
        <NavLink
          to={ROUTES.profile}
          onClick={onNavigate}
          title="Profile"
          aria-label="Profile"
          className={({ isActive }) =>
            cn(
              'flex w-full items-center gap-3 rounded-lg border border-transparent px-2.5 py-2 transition-colors duration-200 hover:bg-surface-hover',
              collapsed && 'justify-center px-0',
              isActive && 'border-blood-950 bg-blood-950/40',
            )
          }
        >
          <span
            aria-hidden
            className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full border border-blood-800/70 bg-obsidian text-parchment-dim"
          >
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="h-full w-full object-cover" />
            ) : (
              <UserIcon className="h-4 w-4" />
            )}
          </span>
          {!collapsed && (
            <span className="flex min-w-0 flex-col text-left">
              <span className="truncate text-xs font-semibold text-parchment">
                {user?.name ?? 'Seeker'}
              </span>
              <span className="truncate text-[11px] text-parchment-muted">
                @{user?.username ?? 'seeker'}
              </span>
            </span>
          )}
        </NavLink>

        {/* Logout — reuses the existing auth implementation */}
        <button
          type="button"
          onClick={() => void logout()}
          aria-label="Log out"
          title="Log out"
          className={cn(
            'flex w-full items-center rounded-lg px-2.5 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-parchment-dim transition-colors duration-200 hover:bg-surface-hover hover:text-blood-400',
            collapsed && 'justify-center px-0',
          )}
        >
          <LogOut aria-hidden className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="ml-2.5">Logout</span>}
        </button>
      </div>
    </>
  );
}

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  unreadCount?: number;
}

/**
 * Desktop (≥1024px) fixed vertical sidebar. Below lg it is hidden and
 * the MobileSidebarDrawer takes over navigation.
 */
export function Sidebar({
  collapsed,
  onToggleCollapse,
  unreadCount,
}: SidebarProps) {
  return (
    <aside className="cx-sidebar" aria-label="Sidebar">
      <SidebarContent
        collapsed={collapsed}
        onToggleCollapse={onToggleCollapse}
        unreadCount={unreadCount}
      />
    </aside>
  );
}

