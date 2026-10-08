import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../constants';
import { PageLoader } from '../components/ui/ThemedLoader';

/** Redirects unauthenticated users to /login (preserving intent). */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <PageLoader message="ENTERING THE REALM..." />;
  if (!user) {
    return <Navigate to={ROUTES.login} state={{ from: location.pathname }} replace />;
  }
  return <>{children}</>;
}
