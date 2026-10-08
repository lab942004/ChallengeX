import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, WifiOff, ShieldX, Skull } from 'lucide-react';
import { ROUTES } from '../../constants';

interface ErrorStateProps {
  kind: '404' | '401' | '500' | 'network';
  title?: string;
  message?: string;
  action?: ReactNode;
}

const presets: Record<
  ErrorStateProps['kind'],
  { title: string; message: string; Icon: typeof Skull }
> = {
  '404': {
    title: 'THE PATH HAS VANISHED',
    message: 'The page you seek is no longer part of this realm.',
    Icon: AlertTriangle,
  },
  '401': {
    title: 'YOU SHALL NOT ENTER',
    message: 'This chamber requires authentication. Log in to continue.',
    Icon: ShieldX,
  },
  '500': {
    title: 'THE REALM HAS FAILED',
    message: 'Something broke beneath the fortress. Our wardens are on it.',
    Icon: Skull,
  },
  network: {
    title: 'THE CONNECTION TO THE REALM WAS LOST',
    message: 'We could not reach the ChallengeX servers. Check your connection.',
    Icon: WifiOff,
  },
};

/** Themed, user-safe error state — never exposes stack traces. */
export function ErrorState({ kind, title, message, action }: ErrorStateProps) {
  const preset = presets[kind];
  const Icon = preset.Icon;

  return (
    <div className="relative grid min-h-[60vh] place-items-center px-4">
      <div className="card-realm vignette relative w-full max-w-lg p-8 text-center">
        <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-full border border-blood-800 bg-blood-950/60 shadow-red-glow">
          <Icon className="h-7 w-7 text-blood-500" aria-hidden />
        </div>
        <h1 className="title-cinzel text-xl text-parchment-light sm:text-2xl">
          {title ?? preset.title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-parchment-dim">{message ?? preset.message}</p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          {action ?? (
            <>
              <Link to={ROUTES.gate} className="btn-primary">
                Return to Gate
              </Link>
              <Link to={ROUTES.home} className="btn-ghost">
                Home
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
