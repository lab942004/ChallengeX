import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { authService, LoginPayload, RegisterPayload } from '../services/auth';
import { AuthUser } from '../types/api';
import { ApiClientError } from '../services/api';

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const { user: me } = await authService.me();
      setUser(me);
    } catch (err) {
      if (err instanceof ApiClientError && (err.status === 401 || err.status === 0)) {
        setUser(null);
      }
      // Other errors: keep previous state but stop loading.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(async (payload: LoginPayload) => {
    const { user: loggedIn } = await authService.login(payload);
    setUser(loggedIn);
    return loggedIn;
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const { user: created } = await authService.register(payload);
    setUser(created);
    return created;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      refresh,
      error,
      clearError: () => setError(null),
    }),
    [user, loading, login, register, logout, refresh, error],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
