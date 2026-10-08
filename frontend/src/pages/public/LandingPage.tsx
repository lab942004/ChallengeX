import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Compass, Flame, Shield, Swords, Target } from 'lucide-react';
import { ROUTES } from '../../constants';
import { useAuth } from '../../context/AuthContext';
import { useDocumentTitle } from '../../hooks';

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
  useDocumentTitle('Challenge Your Idea. Prove It. Build It.');
  const { user } = useAuth();

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{ backgroundImage: "url('/assets/entry-gate.webp')" }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-b from-void/70 via-void/85 to-void" aria-hidden />
      <div className="vignette absolute inset-0" aria-hidden />

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
          CHALLENGE YOUR IDEA. PROVE IT. BUILD IT.
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="title-cinzel text-4xl leading-tight text-parchment-light sm:text-6xl md:text-7xl"
        >
          SURVIVE THE
          <span className="block text-gradient-blood">TRIALS</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mt-6 max-w-2xl text-sm leading-relaxed text-parchment-dim sm:text-base"
        >
          ChallengeX is a gamified idea-validation arena. Feed it your idea and it will
          challenge your assumptions, expose your risks, and deliver a verdict:
          <span className="text-parchment"> BUILD, PIVOT, VALIDATE,</span> or
          <span className="text-blood-400"> KILL</span> — before you spend a year finding out
          the hard way.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-10 flex flex-col gap-4 sm:flex-row"
        >
          <Link to={user ? ROUTES.gate : ROUTES.signup} className="btn-primary !px-8 !py-4">
            Enter the Gate <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to={user ? ROUTES.dashboard : ROUTES.login} className="btn-ghost !px-8 !py-4">
            {user ? 'Your Dashboard' : 'Log In'}
          </Link>
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

      {/* Philosophy flow */}
      <section className="relative z-10 mx-auto max-w-5xl px-4 pb-28 text-center sm:px-6">
        <p className="font-cinzel text-[11px] tracking-[0.36em] text-blood-500">THE WAY OF THE REALM</p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-3 gap-y-3 font-cinzel text-xs tracking-[0.16em] text-parchment-dim sm:text-sm">
          {FLOW_STEPS.map((step, i) => (
            <span key={step} className="flex items-center gap-3">
              <span className={i === FLOW_STEPS.length - 1 ? 'text-blood-400' : ''}>{step}</span>
              {i < FLOW_STEPS.length - 1 && <span className="text-blood-800">→</span>}
            </span>
          ))}
        </div>
        <div className="mt-12 flex justify-center gap-3 text-parchment-dim/60">
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

