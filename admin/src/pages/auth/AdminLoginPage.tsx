import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { ADMIN_ROUTES } from '../../constants';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { Button, Input } from '../../components/common/FormControls';
import { AdminApiError } from '../../services/api';

export function AdminLoginPage() {
  const { login } = useAdminAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await login(email.trim(), password);
      navigate(ADMIN_ROUTES.dashboard, { replace: true });
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : 'Login failed.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h1 className="admin-title text-lg text-sand-light">Admin Login</h1>
      <p className="mt-1 text-sm text-sand-dim">
        Sign in with an ADMIN or SUPER_ADMIN account.
      </p>

      <form onSubmit={submit} className="mt-6 space-y-4">
        {error && (
          <div className="rounded-lg border border-brand-800/50 bg-brand-950/50 px-4 py-3 text-sm text-brand-400">
            {error}
          </div>
        )}
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" loading={busy} className="w-full !py-3">
          <LogIn className="h-4 w-4" /> Sign In
        </Button>
      </form>
    </div>
  );
}
