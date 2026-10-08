import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { KeyRound, MailCheck } from 'lucide-react';
import { ROUTES } from '../../constants';
import { useDocumentTitle } from '../../hooks';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { authService } from '../../services/auth';
import { ApiClientError } from '../../services/api';

const schema = z.object({ email: z.string().email('Enter a valid email address') });
type Form = z.infer<typeof schema>;

export function ForgotPasswordPage() {
  useDocumentTitle('Forgot Password');
  const [sent, setSent] = useState<string | null>(null);
  const [devUrl, setDevUrl] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema), defaultValues: { email: '' } });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      const result = await authService.forgotPassword(values.email);
      setSent(result.message);
      // Development-only convenience when no email provider is configured.
      setDevUrl(result.devResetUrl ?? null);
    } catch (err) {
      setServerError(
        err instanceof ApiClientError ? err.message : 'Request failed. Please try again.',
      );
    }
  });

  if (sent) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full border border-blood-800 bg-blood-950/60">
          <MailCheck className="h-6 w-6 text-blood-500" />
        </div>
        <h1 className="title-cinzel text-xl text-parchment-light">Check Your Inbox</h1>
        <p className="mt-3 text-sm text-parchment-dim">{sent}</p>
        {devUrl && (
          <div className="mt-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-left text-xs text-amber-200">
            <p className="mb-2 font-semibold">Development mode — no email provider configured.</p>
            <a href={devUrl} className="break-all underline">
              {devUrl}
            </a>
          </div>
        )}
        <Link to={ROUTES.login} className="btn-ghost mt-6 w-full">
          Back to Login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <p className="font-cinzel text-[10px] tracking-[0.36em] text-blood-500">RECLAIM ACCESS</p>
      <h1 className="title-cinzel mt-2 text-2xl text-parchment-light">Forgot Password</h1>
      <p className="mt-2 text-sm text-parchment-dim">
        Enter your email and we will forge a reset link.
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
        <Button type="submit" loading={isSubmitting} className="w-full !py-3.5">
          <KeyRound className="h-4 w-4" /> Send Reset Link
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-parchment-dim">
        Remembered it?{' '}
        <Link to={ROUTES.login} className="text-blood-400 hover:text-blood-500">
          Log in
        </Link>
      </p>
    </div>
  );
}
