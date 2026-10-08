import { Link, Outlet } from 'react-router-dom';

/**
 * AdminAuthLayout — clean, professional login shell.
 * Deliberately NOT the cinematic gate experience of the public app.
 */
export function AdminAuthLayout() {
  return (
    <div className="grid min-h-screen place-items-center bg-ink-950 px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-8 flex items-center justify-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl border border-brand-800 bg-brand-950/60 font-display text-lg font-bold text-brand-500">
            X
          </span>
          <span className="admin-title text-lg text-sand-light">ChallengeX</span>
          <span className="rounded border border-white/10 px-1.5 py-0.5 text-[9px] font-bold tracking-widest text-sand-dim">
            ADMIN
          </span>
        </Link>

        <div className="panel p-6 animate-fade-in">
          <Outlet />
        </div>

        <p className="mt-6 text-center text-[10px] uppercase tracking-[0.24em] text-sand-dim/50">
          Restricted area · Authorized personnel only
        </p>
      </div>
    </div>
  );
}
