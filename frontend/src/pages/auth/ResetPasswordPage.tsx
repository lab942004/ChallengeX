import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { RotateCcw } from 'lucide-react';
import { ROUTES } from '../../constants';
import { useDocumentTitle } from '../../hooks';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { authService } from '../../services/auth';
import { ApiClientError } from '../../services/api';

const schema = z
  .object({
    token: z.string().min(10, 'Invalid reset token'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Za-z]/, 'Must contain a letter')
      .regex(/[0-9]/, 'Must contain a number'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

type Form = z.infer<typeof schema>;

export function ResetPasswordPage() {
  useDocumentTitle('Reset Password');
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { token: params.get('token') ?? '', password: '', confirmPassword: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await authService.resetPassword(values);
      setDone(true);
      setTimeout(() => navigate(ROUTES.login, { replace: true }), 1800);
    } catch (err) {
      setServerError(
        err instanceof ApiClientError ? err.message : 'Reset failed. Please try again.',
      );
    }
  });

  if (done) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full border border-blood-800 bg-blood-950/60 animate-rune-pulse">
          <RotateCcw className="h-6 w-6 text-blood-500" />
        </div>
        <h1 className="title-cinzel text-xl text-parchment-light">Password Restored</h1>
        <p className="mt-3 text-sm text-parchment-dim">Redirecting you to the login chamberâ€¦</p>
      </div>
    );
  }

  return (
    <div>
      <p className="font-cinzel text-[10px] tracking-[0.36em] text-blood-500">RENEW YOUR OATH</p>
      <h1 className="title-cinzel mt-2 text-2xl text-parchment-light">Reset Password</h1>
      <p className="mt-2 text-sm text-parchment-dim">Choose a new password for your account.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
        {serverError && (
          <div className="rounded-lg border border-blood-600/50 bg-blood-950/60 px-4 py-3 text-sm text-blood-400">
            {serverError}
          </div>
        )}
        {!params.get('token') && (
          <Input label="Reset Token" placeholder="Paste your reset token" error={errors.token?.message} {...register('token')} />
        )}
        {params.get('token') && (
          <input type="hidden" {...register('token')} />
        )}
        <Input
          label="New Password"
          type="password"
          autoComplete="new-password"
          placeholder="Min. 8 characters"
          error={errors.password?.message}
          {...register('password')}
        />
        <Input
          label="Confirm New Password"
          type="password"
          autoComplete="new-password"
          placeholder="Repeat new password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        <Button type="submit" loading={isSubmitting} className="w-full !py-3.5">
          <RotateCcw className="h-4 w-4" /> Reset Password
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-parchment-dim">
        <Link to={ROUTES.forgotPassword} className="text-blood-400 hover:text-blood-500">
          Request a new link
        </Link>
      </p>
    </div>
  );
}
