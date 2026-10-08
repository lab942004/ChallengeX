import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ROUTES } from '../../constants';
import { useDocumentTitle, usePrefersReducedMotion } from '../../hooks';

/** Small floating embers/particles rendered as pure CSS animations. */
function EmberField({ count = 26 }: { count?: number }) {
  const embers = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: `${(i * 37) % 100}%`,
        delay: `${(i % 10) * 0.45}s`,
        duration: `${3.5 + (i % 5) * 0.8}s`,
        size: 2 + (i % 3),
      })),
    [count],
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {embers.map((e) => (
        <span
          key={e.id}
          className="absolute bottom-0 rounded-full bg-blood-500 shadow-[0_0_6px_2px_rgba(229,22,28,0.6)] animate-ember-rise"
          style={{
            left: e.left,
            width: e.size,
            height: e.size,
            animationDelay: e.delay,
            animationDuration: e.duration,
          }}
        />
      ))}
    </div>
  );
}

export function GatePage() {
  useDocumentTitle('The Gate');
  const navigate = useNavigate();
  const reducedMotion = usePrefersReducedMotion();
  const [opening, setOpening] = useState(false);

  const handleEnter = () => {
    if (opening) return;
    setOpening(true);
    const delay = reducedMotion ? 150 : 1600;
    window.setTimeout(() => navigate(ROUTES.paths), delay);
  };

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-void">
      {/* Backdrop: supplied entry-gate artwork */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/assets/entry-gate.webp')" }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-void/55" aria-hidden />

      {/* Drifting fog layers */}
      {!reducedMotion && (
        <>
          <div
            className="absolute inset-x-[-10%] bottom-0 h-1/3 bg-gradient-to-t from-abyss via-abyss/60 to-transparent blur-2xl animate-fog-drift opacity-70"
            aria-hidden
          />
          <div
            className="absolute inset-x-[-10%] bottom-0 h-1/4 bg-gradient-to-t from-blood-950/70 to-transparent blur-3xl animate-fog-drift opacity-50"
            style={{ animationDelay: '6s' }}
            aria-hidden
          />
        </>
      )}

      {/* Two gate doors (left/right halves of the supplied artwork) */}
      <div className="pointer-events-none absolute inset-0 z-10" aria-hidden>
        <motion.div
          className="absolute inset-y-0 left-0 w-1/2 border-r border-blood-950 bg-cover bg-left"
          style={{
            backgroundImage: "url('/assets/entry-gate.webp')",
            backgroundSize: '200% 100%',
            filter: 'brightness(0.85)',
          }}
          animate={opening ? { x: '-102%' } : { x: 0 }}
          transition={{ duration: reducedMotion ? 0.1 : 1.5, ease: [0.65, 0, 0.35, 1] }}
        />
        <motion.div
          className="absolute inset-y-0 right-0 w-1/2 border-l border-blood-950 bg-cover"
          style={{
            backgroundImage: "url('/assets/entry-gate.webp')",
            backgroundSize: '200% 100%',
            backgroundPosition: 'right center',
            filter: 'brightness(0.85)',
          }}
          animate={opening ? { x: '102%' } : { x: 0 }}
          transition={{ duration: reducedMotion ? 0.1 : 1.5, ease: [0.65, 0, 0.35, 1] }}
        />

        {/* Expanding red energy beam as the doors part */}
        <motion.div
          className="absolute inset-y-0 left-1/2 w-6 -translate-x-1/2 bg-gradient-to-b from-transparent via-blood-500 to-transparent blur-xl"
          initial={{ opacity: 0, scaleX: 1 }}
          animate={opening ? { opacity: [0, 1, 0.9], scaleX: [1, 6, 30] } : { opacity: 0 }}
          transition={{ duration: reducedMotion ? 0.1 : 1.5 }}
        />
      </div>

      <EmberField />

      {/* Vignette + light rays */}
      <div className="vignette pointer-events-none absolute inset-0 z-20" aria-hidden />
      {!reducedMotion && (
        <div
          className="pointer-events-none absolute inset-0 z-20 opacity-30"
          style={{
            background:
              'conic-gradient(from 200deg at 50% 0%, transparent 40%, rgba(229,22,28,0.18) 50%, transparent 60%)',
          }}
          aria-hidden
        />
      )}

      {/* Central rune + CTA */}
      <div className="relative z-30 flex flex-col items-center px-4 text-center">
        <motion.div
          className="mb-8 grid h-28 w-28 place-items-center rounded-full border-2 border-blood-800 bg-abyss/70 shadow-red-strong backdrop-blur-sm"
          animate={
            reducedMotion
              ? {}
              : opening
                ? { scale: [1, 1.25, 1.6], opacity: [1, 1, 0] }
                : { scale: [1, 1.06, 1], opacity: [0.85, 1, 0.85] }
          }
          transition={{ duration: opening ? 1.2 : 2.6, repeat: opening ? 0 : Infinity }}
        >
          <span className="font-display text-4xl text-blood-500">✕</span>
        </motion.div>

        <p className="font-cinzel text-[11px] tracking-[0.42em] text-parchment-dim">
          {opening ? 'THE SEAL BREAKS…' : 'GATE CLOSED'}
        </p>

        <h1 className="title-cinzel mt-4 text-3xl text-parchment-light sm:text-5xl">
          THE REALM
          <span className="block text-gradient-blood">AWAITS</span>
        </h1>

        <p className="mt-4 max-w-md text-sm leading-relaxed text-parchment-dim">
          Beyond these doors, your idea will be tested. Only what survives deserves to be
          built.
        </p>

        <motion.button
          onClick={handleEnter}
          disabled={opening}
          whileHover={reducedMotion ? {} : { scale: 1.04 }}
          whileTap={reducedMotion ? {} : { scale: 0.97 }}
          className="btn-primary mt-10 !px-10 !py-4 !text-sm shadow-red-glow disabled:opacity-70"
        >
          {opening ? 'OPENING…' : 'ENTER THE REALM'}
        </motion.button>

        <p className="mt-6 font-cinzel text-[9px] tracking-[0.3em] text-parchment-dim/50">
          CHALLENGE YOUR IDEA. PROVE IT. BUILD IT.
        </p>
      </div>
    </div>
  );
}

