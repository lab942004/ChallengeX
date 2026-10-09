import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { SidebarContent } from './Sidebar';

interface MobileSidebarDrawerProps {
  open: boolean;
  onClose: () => void;
  unreadCount?: number;
}

/**
 * MobileSidebarDrawer — off-canvas left drawer used below the lg
 * breakpoint. Provides a dark overlay, a close button, Escape-to-close,
 * body scroll locking, focus restoration, and closes on navigation
 * (via SidebarContent's onNavigate).
 */
export function MobileSidebarDrawer({
  open,
  onClose,
  unreadCount,
}: MobileSidebarDrawerProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  // Prevent background scrolling while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  // Escape closes the drawer; move focus in on open and restore on close.
  useEffect(() => {
    if (!open) return;
    restoreFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      restoreFocusRef.current?.focus();
    };
  }, [open, onClose]);

  return (
    <div
      className={`cx-drawer${open ? ' cx-drawer--open' : ''}`}
      aria-hidden={!open}
    >
      {/* Dark overlay — click to close */}
      <div
        role="presentation"
        className="cx-drawer-overlay"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        id="cx-mobile-drawer"
        className="cx-drawer-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close navigation menu"
          className="cx-drawer-close"
        >
          <X aria-hidden className="h-5 w-5" />
        </button>
        <SidebarContent
          collapsed={false}
          onNavigate={onClose}
          unreadCount={unreadCount}
        />
      </div>
    </div>
  );
}
