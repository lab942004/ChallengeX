import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { ROUTES } from '../../constants';
import { useAuth } from '../../context/AuthContext';
import { useDocumentTitle } from '../../hooks';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ApiClientError } from '../../services/api';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  useDocumentTitle('Log In');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const from = (location.state as { from?: string } | null)?.from ?? ROUTES.gate;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await login(values);
      navigate(from, { replace: true });
    } catch (err) {
      setServerError(
        err instanceof ApiClientError ? err.message : 'Login failed. Please try again.',
      );
    }
  });

  return (
    <div>
      <p className="font-cinzel text-[10px] tracking-[0.36em] text-blood-500">RETURNING SEEKER</p>
      <h1 className="title-cinzel mt-2 text-2xl text-parchment-light">Log In</h1>
      <p className="mt-2 text-sm text-parchment-dim">
        Present your credentials to re-enter the realm.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
        {serverError && (
          <div className="rounded-lg border border-blood-600/50 bg-blood-950/60 px-4 py-3 text-sm text-blood-400">
            {serverError}
          </div>
        )}

        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-[34px] text-parchment-dim hover:text-parchment"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <div className="flex items-center justify-between gap-3 text-xs">
          <label className="flex cursor-pointer items-center gap-2 text-parchment-dim">
            <input
              type="checkbox"
              className="h-4 w-4 accent-[#E5161C]"
              {...register('rememberMe')}
            />
            Remember me
          </label>
          <Link
            to={ROUTES.forgotPassword}
            className="text-blood-400 transition-colors hover:text-blood-500"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" loading={isSubmitting} className="w-full !py-3.5">
          <LogIn className="h-4 w-4" /> Enter the Realm
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-parchment-dim">
        First time here?{' '}
        <Link to={ROUTES.signup} className="text-blood-400 hover:text-blood-500">
          Create an account
        </Link>
      </p>
    </div>
  );
}
