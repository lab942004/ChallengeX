import { Link, Outlet } from 'react-router-dom';
import { ROUTES } from '../constants';

/**
 * AuthLayout — cinematic login/signup backdrop using the supplied
 * auth-background.png and auth-box.png artwork.
 */
export function AuthLayout() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/assets/auth-background.png')" }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-void/70 backdrop-blur-[2px]" aria-hidden />
      <div className="vignette absolute inset-0" aria-hidden />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-10">
        <Link
          to={ROUTES.home}
          className="mb-8 font-display text-2xl tracking-[0.3em] text-parchment-light transition-colors hover:text-blood-500"
        >
          CHALLENGEX
        </Link>

        <div
          className="relative w-full max-w-md rounded-2xl border border-blood-950/80 bg-abyss/80 p-6 shadow-red-strong backdrop-blur-md sm:p-8"
          style={{
            backgroundImage: "url('/assets/auth-box.png')",
            backgroundSize: 'cover',
            backgroundBlendMode: 'overlay',
          }}
        >
          <div className="absolute inset-0 rounded-2xl bg-abyss/70" aria-hidden />
          <div className="relative">
            <Outlet />
          </div>
        </div>

        <p className="mt-8 text-center font-cinzel text-[10px] tracking-[0.28em] text-parchment-dim/70">
          CHALLENGE YOUR IDEA. PROVE IT. BUILD IT.
        </p>
      </div>
    </div>
  );
}
