import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { notificationsService } from '../services/notifications';
import { useAuth } from './AuthContext';

interface NotificationContextValue {
  unreadCount: number;
  refreshCount: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshCount = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    try {
      const { count } = await notificationsService.unreadCount();
      setUnreadCount(count);
    } catch {
      // Badge count is non-critical; ignore transient failures.
    }
  }, [user]);

  useEffect(() => {
    void refreshCount();
    if (!user) return;
    const interval = setInterval(() => void refreshCount(), 60_000);
    return () => clearInterval(interval);
  }, [user, refreshCount]);

  const value = useMemo(() => ({ unreadCount, refreshCount }), [unreadCount, refreshCount]);

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications(): NotificationContextValue {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
