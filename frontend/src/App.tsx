import { MotionConfig } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { AppRouter } from './routes/AppRouter';

export default function App() {
  return (
    // reducedMotion="user" makes every framer-motion animation respect
    // the OS-level prefers-reduced-motion setting.
    <MotionConfig reducedMotion="user">
      <AuthProvider>
        <NotificationProvider>
          <AppRouter />
        </NotificationProvider>
      </AuthProvider>
    </MotionConfig>
  );
}
