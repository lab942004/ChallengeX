import { Link, Outlet, useNavigate } from 'react-router-dom';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { ADMIN_ROUTES } from '../constants';

/** Shell for admin error pages. */
export function AdminErrorLayout() {
  const navigate = useNavigate();

  return (
    <div className="grid min-h-screen place-items-center bg-ink-950 px-4">
      <div className="panel w-full max-w-md p-8 text-center animate-fade-in">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full border border-brand-800 bg-brand-950/60">
          <AlertTriangle className="h-6 w-6 text-brand-400" />
        </div>
        <Outlet />
        <div className="mt-6 flex justify-center gap-3">
          <button onClick={() => navigate(-1)} className="btn-ghost">
            <RefreshCw className="h-3.5 w-3.5" /> Back
          </button>
          <Link to={ADMIN_ROUTES.dashboard} className="btn-primary">
            <Home className="h-3.5 w-3.5" /> Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
