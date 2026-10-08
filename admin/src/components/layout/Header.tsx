import { LucideIcon, Search } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { initials } from '../../utils';

interface HeaderProps {
  onMenuClick: () => void;
  menuIcon: LucideIcon;
}

/** Top bar with mobile menu trigger + admin identity. */
export function Header({ onMenuClick, menuIcon: MenuIcon }: HeaderProps) {
  const { admin } = useAdminAuth();

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-white/5 bg-ink-900/90 px-4 backdrop-blur sm:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-sand-dim hover:bg-white/5 hover:text-sand lg:hidden"
        aria-label="Toggle navigation"
      >
        <MenuIcon className="h-5 w-5" />
      </button>

      <div className="relative hidden flex-1 max-w-md sm:block">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sand-dim/60" />
        <input
          className="admin-input !pl-9 !py-2 text-xs"
          placeholder="Search users, ideas, trials…"
          aria-label="Search"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const q = (e.target as HTMLInputElement).value.trim();
              if (q) window.location.assign(`/admin/users?search=${encodeURIComponent(q)}`);
            }
          }}
        />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <span className="hidden text-xs text-sand-dim sm:block">{admin?.email}</span>
        <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-950 text-[11px] font-bold text-brand-400">
          {initials(admin?.name ?? 'A')}
        </span>
      </div>
    </header>
  );
}
