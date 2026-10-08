import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { ADMIN_ROUTES } from '../constants';

/**
 * AdminProtectedRoute — requires an authenticated ADMIN or SUPER_ADMIN.
 * NOTE: this is UI convenience only; the backend independently enforces
 * authentication + role + permission on every /api/v1/admin/* call.
 */
export function AdminProtectedRoute({ children }: { children: ReactNode }) {
  const { admin, loading } = useAdminAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-ink-950 text-xs uppercase tracking-[0.3em] text-sand-dim">
        Verifying credentials…
      </div>
    );
  }

  if (!admin || admin.role === 'USER') {
    return <Navigate to={ADMIN_ROUTES.login} state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
}
