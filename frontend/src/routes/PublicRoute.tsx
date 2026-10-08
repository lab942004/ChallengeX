import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../constants';
import { PageLoader } from '../components/ui/ThemedLoader';

/**
 * For guest-only pages (login/signup/forgot/reset):
 * authenticated users are bounced into the realm.
 */
export function PublicRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader message="ENTERING THE REALM..." />;
  if (user) return <Navigate to={ROUTES.gate} replace />;
  return <>{children}</>;
}
