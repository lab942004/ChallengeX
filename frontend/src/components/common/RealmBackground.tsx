import { CSSProperties, useState } from 'react';
import { usePrefersReducedMotion } from '../../hooks';
import { cn } from '../../utils';

/**
 * RealmBackground — the canonical layered background composition:
 *
 *   1. Base near-black foundation (--background).
 *   2. Full-page dark-fantasy artwork (all-pages-background.png).
 *   3. Optional gate artwork (entry-gate.webp for the gate variant).
 *      NOTE: gate-left.webp / gate-right.webp are not present in this
 *      repository, so they are never referenced — the entry-gate artwork
 *      already carries the left/right gate composition (it is split into
 *      two doors by GatePage). Referencing missing files would produce
 *      broken image requests, so the composition degrades gracefully.
 *   4. Readability overlay (restrained dark gradient).
 *   5. Atmospheric effects (fog + vignette), disabled under reduced motion.
 *
 * Every layer is decorative: aria-hidden, pointer-events: none, and all
 * images keep their aspect ratio via object-cover so artwork never distorts.
 * If an artwork file fails to load, the layer removes itself and the
 * near-black foundation remains — no broken image icons, ever.
 */

type RealmVariant = 'app' | 'gate' | 'auth';

interface ArtLayerProps {
  src: string;
  className?: string;
  style?: CSSProperties;
}

/** Decorative <img> layer that removes itself when the asset fails to load. */
function ArtLayer({ src, className, style }: ArtLayerProps) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <img
      src={src}
      alt=""
      aria-hidden
      draggable={false}
      onError={() => setFailed(true)}
      className={cn('absolute inset-0 h-full w-full object-cover select-none', className)}
      style={style}
    />
  );
}

interface RealmBackgroundProps {
  /** Which artwork composition to use. */
  variant?: RealmVariant;
  /** Overall opacity of the artwork layer (default varies per variant). */
  artOpacity?: number;
  /** Render the radial darkening vignette (default true). */
  vignette?: boolean;
  /** Extra classes for the root (fixed) container. */
  className?: string;
}

const ART: Record<RealmVariant, { src: string; opacity: number; position: string }> = {
  app: { src: '/assets/all-pages-background.png', opacity: 0.5, position: 'center top' },
  gate: { src: '/assets/entry-gate.webp', opacity: 1, position: 'center' },
  auth: { src: '/assets/auth-background.png', opacity: 1, position: 'center' },
};

export function RealmBackground({
  variant = 'app',
  artOpacity,
  vignette = true,
  className,
}: RealmBackgroundProps) {
  const reducedMotion = usePrefersReducedMotion();
  const art = ART[variant];
  const opacity = artOpacity ?? art.opacity;

  return (
    <div
      className={cn('pointer-events-none fixed inset-0 overflow-hidden bg-void', className)}
      aria-hidden
    >
      {/* 1–2. Base + full-page artwork */}
      <ArtLayer
        src={art.src}
        style={{ opacity, objectPosition: art.position }}
        className={variant === 'gate' ? 'scale-105' : undefined}
      />

      {/* 4. Readability overlay — keeps artwork visible while text stays legible */}
      {variant === 'app' && (
        <>
          <div className="absolute inset-0 bg-gradient-to-b from-void/70 via-void/55 to-void/85" />
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse at 50% 0%, rgba(229,9,32,0.06), transparent 55%)',
            }}
          />
        </>
      )}
      {variant === 'gate' && (
        <>
          <div className="absolute inset-0 bg-void/45" />
          <div className="absolute inset-0 bg-gradient-to-b from-void/60 via-transparent to-void/85" />
        </>
      )}
      {variant === 'auth' && (
        <>
          <div className="absolute inset-0 bg-void/70 backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-void/50 via-transparent to-void/80" />
        </>
      )}

      {/* 5. Atmospheric fog (respecting reduced motion via global CSS rules) */}
      {!reducedMotion && (
        <>
          <div className="absolute inset-x-[-8%] bottom-0 h-1/4 bg-gradient-to-t from-abyss/70 via-abyss/30 to-transparent blur-2xl animate-fog-drift" />
          <div
            className="absolute inset-x-[-8%] bottom-0 h-1/5 bg-gradient-to-t from-blood-950/50 to-transparent blur-3xl animate-fog-drift opacity-60"
            style={{ animationDelay: '7s' }}
          />
        </>
      )}

      {/* Vignette */}
      {vignette && <div className="vignette absolute inset-0" />}
    </div>
  );
}