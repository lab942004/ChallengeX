import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserPlus } from 'lucide-react';
import { ROUTES } from '../../constants';
import { useAuth } from '../../context/AuthContext';
import { useDocumentTitle } from '../../hooks';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ApiClientError } from '../../services/api';

const signupSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    username: z
      .string()
      .min(3, 'Username must be at least 3 characters')
      .regex(/^[a-zA-Z0-9_]+$/, 'Letters, numbers and underscores only'),
    email: z.string().email('Enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Za-z]/, 'Must contain a letter')
      .regex(/[0-9]/, 'Must contain a number'),
    confirmPassword: z.string(),
    acceptTerms: z.literal(true, { errorMap: () => ({ message: 'You must accept the terms' }) }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

type SignupForm = z.infer<typeof signupSchema>;

export function SignupPage() {
  useDocumentTitle('Sign Up');
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: undefined,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await registerUser(values);
      navigate(ROUTES.gate, { replace: true });
    } catch (err) {
      setServerError(
        err instanceof ApiClientError ? err.message : 'Registration failed. Please try again.',
      );
    }
  });

  return (
    <div>
      <p className="font-cinzel text-[10px] tracking-[0.36em] text-blood-500">NEW SEEKER</p>
      <h1 className="title-cinzel mt-2 text-2xl text-parchment-light">Create Account</h1>
      <p className="mt-2 text-sm text-parchment-dim">
        Claim your place in the realm. The trials await.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
        {serverError && (
          <div className="rounded-lg border border-blood-600/50 bg-blood-950/60 px-4 py-3 text-sm text-blood-400">
            {serverError}
          </div>
        )}

        <Input
          label="Full Name"
          autoComplete="name"
          placeholder="Ada Lovelace"
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          label="Username"
          autoComplete="username"
          placeholder="ada_lovelace"
          error={errors.username?.message}
          {...register('username')}
        />
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Password"
            type="password"
            autoComplete="new-password"
            placeholder="Min. 8 characters"
            error={errors.password?.message}
            {...register('password')}
          />
          <Input
            label="Confirm Password"
            type="password"
            autoComplete="new-password"
            placeholder="Repeat password"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />
        </div>

        <label className="flex cursor-pointer items-start gap-3 text-xs leading-relaxed text-parchment-dim">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 accent-[#E5161C]"
            {...register('acceptTerms')}
          />
          <span>
            I accept the terms of service and understand that ChallengeX will brutally (but
            constructively) challenge my ideas.{' '}
            {errors.acceptTerms && (
              <span className="block text-blood-400">{errors.acceptTerms.message}</span>
            )}
          </span>
        </label>

        <Button type="submit" loading={isSubmitting} className="w-full !py-3.5">
          <UserPlus className="h-4 w-4" /> Begin the Journey
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-parchment-dim">
        Already have an account?{' '}
        <Link to={ROUTES.login} className="text-blood-400 hover:text-blood-500">
          Log in
        </Link>
      </p>
    </div>
  );
}
