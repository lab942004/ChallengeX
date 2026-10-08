import { AdminAuthProvider } from './context/AdminAuthContext';
import { AdminRouter } from './routes/AdminRouter';

export default function App() {
  return (
    <AdminAuthProvider>
      <AdminRouter />
    </AdminAuthProvider>
  );
}
