import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Compass, Flame, Shield, Swords, Target } from 'lucide-react';
import { ROUTES } from '../../constants';
import { useAuth } from '../../context/AuthContext';
import { useDocumentTitle } from '../../hooks';
import { RealmBackground } from '../../components/common/RealmBackground';

const PILLARS = [
  { Icon: Swords, title: 'Trial by Fire', text: 'Your idea faces structured challenges across seven risk categories.' },
  { Icon: Shield, title: 'Honest Verdict', text: 'A backend-computed market readiness score — no self-delusion allowed.' },
  { Icon: Target, title: 'Actionable Path', text: 'Risks, recommendations, an experiment, and a six-stage roadmap.' },
];

const FLOW_STEPS = [
  'IDEA',
  'ASSUMPTIONS',
  'CHALLENGES',
  'ANSWERS',
  'RISK ANALYSIS',
  'VERDICT',
  'EXPERIMENT',
  'ROADMAP',
  'BUILD / PIVOT / KILL',
];

export function LandingPage() {
  useDocumentTitle('Enter the Realm of Ideas');
  const { user } = useAuth();

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Layered gate artwork — clear central focal point behind the hero.
          No extra artOpacity dimming: RealmBackground's own restrained
          scrims keep the gate, banners and blood moon clearly visible. */}
      <RealmBackground variant="gate" vignette={false} />
      <div className="vignette pointer-events-none absolute inset-0" aria-hidden />

      {/* Header */}
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-4 py-6 sm:px-6">
        <span className="font-display text-lg tracking-[0.3em] text-parchment-light">
          CHALLENGEX
        </span>
        <nav className="flex items-center gap-3">
          {user ? (
            <Link to={ROUTES.gate} className="btn-primary !px-4 !py-2 text-xs">
              Enter the Realm
            </Link>
          ) : (
            <>
              <Link
                to={ROUTES.login}
                className="font-cinzel text-xs tracking-[0.18em] text-parchment-dim transition-colors hover:text-parchment"
              >
                LOG IN
              </Link>
              <Link to={ROUTES.signup} className="btn-primary !px-4 !py-2 text-xs">
                BEGIN
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* Hero */}
      <section className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-4 pb-24 pt-16 text-center sm:pt-24">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 font-cinzel text-[11px] tracking-[0.4em] text-blood-500"
        >
          THE REALM OF IDEAS
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="title-cinzel text-4xl leading-[1.15] text-parchment-light sm:text-6xl md:text-7xl"
        >
          CHALLENGE YOUR IDEA.
          <span className="block text-gradient-blood">PROVE IT. BUILD IT.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mt-6 max-w-2xl text-sm leading-relaxed text-parchment-dim sm:text-base"
        >
          Every great idea faces a trial. Test your assumptions, uncover hidden risks, and
          discover whether your idea is ready to become reality.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-10 flex flex-col gap-4 sm:flex-row"
        >
          <Link to={user ? ROUTES.gate : ROUTES.signup} className="btn-primary !px-8 !py-4">
            ENTER THE REALM <ArrowRight className="h-4 w-4" />
          </Link>
          <a href="#how-it-works" className="btn-ghost !px-8 !py-4">
            HOW IT WORKS
          </a>
        </motion.div>

        <div className="mt-6 flex items-center gap-2 font-cinzel text-[10px] tracking-[0.3em] text-parchment-dim/60">
          <Flame className="h-3.5 w-3.5 text-blood-600" />
          IDEA → ASSUMPTIONS → CHALLENGES → VERDICT → ROADMAP
        </div>
      </section>

      {/* Pillars */}
      <section className="relative z-10 mx-auto grid max-w-6xl gap-5 px-4 pb-24 sm:grid-cols-3 sm:px-6">
        {PILLARS.map(({ Icon, title, text }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.55, delay: i * 0.12 }}
            className="card-realm p-6"
          >
            <div className="mb-4 grid h-11 w-11 place-items-center rounded-lg border border-blood-950 bg-blood-950/50">
              <Icon className="h-5 w-5 text-blood-500" />
            </div>
            <h3 className="title-cinzel text-sm text-parchment-light">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-parchment-dim">{text}</p>
          </motion.div>
        ))}
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="relative z-10 mx-auto max-w-5xl scroll-mt-20 px-4 pb-28 text-center sm:px-6"
      >
        <p className="font-cinzel text-[11px] tracking-[0.36em] text-blood-500">THE WAY OF THE REALM</p>
        <h2 className="title-cinzel mt-3 text-2xl text-parchment-light sm:text-3xl">HOW IT WORKS</h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-parchment-dim">
          Speak your idea into the unknown. The realm answers with questions across seven risk
          categories, scores what survives, and forges a verdict you can act on.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-3 font-cinzel text-xs tracking-[0.16em] text-parchment-dim sm:text-sm">
          {FLOW_STEPS.map((step, i) => (
            <span key={step} className="flex items-center gap-3">
              <span className={i === FLOW_STEPS.length - 1 ? 'text-blood-400' : ''}>{step}</span>
              {i < FLOW_STEPS.length - 1 && <span className="text-blood-800">→</span>}
            </span>
          ))}
        </div>
        <div className="mt-10 flex justify-center gap-3 text-parchment-dim/60">
          <Compass className="h-5 w-5" />
        </div>
      </section>

      <footer className="relative z-10 border-t border-blood-950 bg-abyss/80 py-6 text-center">
        <p className="font-cinzel text-[10px] tracking-[0.3em] text-parchment-dim/70">
          CHALLENGEX — CHALLENGE YOUR IDEA. PROVE IT. BUILD IT.
        </p>
      </footer>
    </div>
  );
}

