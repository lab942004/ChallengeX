import { CSSProperties, useState } from 'react';
import { usePrefersReducedMotion } from '../../hooks';
import { cn } from '../../utils';

/**
 * RealmBackground — the canonical layered background composition:
 *
 *   1. Base near-black foundation (--background).
 *   2. Full-page dark-fantasy artwork (all-pages-background.png) — rendered
 *      near full opacity with a slight brightness/saturation trim so the
 *      castle, crimson lighting and fog stay clearly visible (never buried
 *      under stacked black scrims).
 *   3. Optional gate artwork (entry-gate.webp for the gate variant).
 *      NOTE: gate-left.webp / gate-right.webp are not present in this
 *      repository, so they are never referenced — the entry-gate artwork
 *      already carries the left/right gate composition (it is split into
 *      two doors by GatePage). Referencing missing files would produce
 *      broken image requests, so the composition degrades gracefully.
 *   4. Readability overlay — a *restrained* gradient (rgba(7,6,6, 0.12–0.35))
 *      that keeps foreground text legible without hiding the artwork.
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

const ART: Record<
  RealmVariant,
  { src: string; opacity: number; position: string; filter?: string }
> = {
  // The castle artwork is already dark and cinematic by nature — show it at
  // full strength. The slight darkening + saturation lift keeps crimson
  // highlights from washing out once the readability scrims are reduced.
  app: {
    src: '/assets/all-pages-background.png',
    opacity: 1,
    position: 'center top',
    filter: 'brightness(0.85) saturate(1.15)',
  },
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
        style={{ opacity, objectPosition: art.position, filter: art.filter }}
        className={variant === 'gate' ? 'scale-105' : undefined}
      />

      {/* 4. Readability overlay — restrained so the artwork stays visible
          while text remains legible. Values are intentionally low-alpha:
          never stack solid black over the castle. */}
      {variant === 'app' && (
        <>
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(7, 6, 6, 0.12) 0%, rgba(7, 6, 6, 0.22) 55%, rgba(7, 6, 6, 0.35) 100%)',
            }}
          />
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
          <div className="absolute inset-0 bg-void/25" />
          <div className="absolute inset-0 bg-gradient-to-b from-void/40 via-transparent to-void/70" />
        </>
      )}
      {variant === 'auth' && (
        <>
          <div className="absolute inset-0 bg-void/70 backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-gradient-to-b from-void/50 via-transparent to-void/80" />
        </>
      )}

      {/* 5. Atmospheric fog (respecting reduced motion via global CSS rules).
          Kept light so the lower artwork (ritual circle, braziers, fog banks
          painted into the asset) still reads through. */}
      {!reducedMotion && (
        <>
          <div className="absolute inset-x-[-8%] bottom-0 h-1/4 bg-gradient-to-t from-abyss/45 via-abyss/18 to-transparent blur-2xl animate-fog-drift" />
          <div
            className="absolute inset-x-[-8%] bottom-0 h-1/5 bg-gradient-to-t from-blood-950/40 to-transparent blur-3xl animate-fog-drift opacity-40"
            style={{ animationDelay: '7s' }}
          />
        </>
      )}

      {/* Vignette */}
      {vignette && <div className="vignette absolute inset-0" />}
    </div>
  );
}