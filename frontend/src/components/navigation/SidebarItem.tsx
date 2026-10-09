import { NavLink } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../utils';

interface SidebarItemProps {
  to: string;
  label: string;
  Icon: LucideIcon;
  /** Icon-only rendering for the collapsed desktop sidebar. */
  collapsed: boolean;
  /** Unread notification count rendered as a badge (0 hides it). */
  badgeCount?: number;
  /** Called after navigation (used by the mobile drawer to close itself). */
  onNavigate?: () => void;
}

/**
 * Vertical navigation link with active-route highlighting, subtle red
 * hover illumination, an unread badge, and icon-only support (with a
 * native tooltip) when the sidebar is collapsed.
 */
export function SidebarItem({
  to,
  label,
  Icon,
  collapsed,
  badgeCount = 0,
  onNavigate,
}: SidebarItemProps) {
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      title={label}
      aria-label={badgeCount > 0 ? `${label} (${badgeCount} unread)` : label}
      className={({ isActive }) =>
        cxItemClass(isActive, collapsed)
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="cx-sidebar-item-indicator" aria-hidden />
          )}
          <Icon
            aria-hidden
            className={cn(
              'h-[18px] w-[18px] shrink-0 transition-colors',
              isActive ? 'text-blood-500' : 'group-hover:text-blood-400',
            )}
          />
          {!collapsed && (
            <span className="min-w-0 flex-1 truncate text-left">{label}</span>
          )}
          {!collapsed && badgeCount > 0 && (
            <span className="cx-nav-badge" aria-hidden>
              {badgeCount > 9 ? '9+' : badgeCount}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

function cxItemClass(isActive: boolean, collapsed: boolean): string {
  return cn(
    'cx-sidebar-item group relative flex items-center rounded-lg py-2 text-[13px] font-medium transition-colors duration-200',
    collapsed ? 'justify-center px-2' : 'gap-3 px-3',
    isActive
      ? 'bg-blood-950/60 text-blood-400 shadow-realm'
      : 'text-parchment-dim hover:bg-surface-hover hover:text-parchment',
  );
}
