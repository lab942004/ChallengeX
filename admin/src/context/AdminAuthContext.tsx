import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { adminAuthService } from '../services/auth';
import { AdminApiError } from '../services/api';
import { AdminSession, Role } from '../types/api';

interface AdminAuthContextValue {
  admin: AdminSession | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AdminSession>;
  logout: () => Promise<void>;
  isSuperAdmin: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { user } = await adminAuthService.me();
        setAdmin(user);
      } catch (err) {
        if (err instanceof AdminApiError && (err.status === 401 || err.status === 0)) {
          setAdmin(null);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { user } = await adminAuthService.login(email, password);
    if (user.role === 'USER') {
      throw new AdminApiError(403, 'FORBIDDEN', 'This account cannot access the admin area.');
    }
    setAdmin(user);
    return user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await adminAuthService.logout();
    } finally {
      setAdmin(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      admin,
      loading,
      login,
      logout,
      isSuperAdmin: admin?.role === ('SUPER_ADMIN' as Role),
    }),
    [admin, loading, login, logout],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
