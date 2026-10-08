import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { ADMIN_ROUTES } from '../constants';

/** SuperAdminRoute — only SUPER_ADMIN may access admin management + settings. */
export function SuperAdminRoute({ children }: { children: ReactNode }) {
  const { admin, loading } = useAdminAuth();

  if (loading) return null;
  if (!admin || admin.role !== 'SUPER_ADMIN') {
    return <Navigate to={ADMIN_ROUTES.dashboard} replace />;
  }
  return <>{children}</>;
}
