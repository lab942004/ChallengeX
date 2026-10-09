import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, History, Map, Sparkles, Swords } from 'lucide-react';
import { ROUTES } from '../../constants';
import { useDocumentTitle } from '../../hooks';
import { PageHeader } from '../../components/common/PageHeader';

const PATHS = [
  {
    to: ROUTES.idea,
    Icon: Swords,
    title: 'CHALLENGE MY IDEA',
    description: 'Forge an idea, enter the trial, and face questions across seven risk categories.',
    cta: 'Start the Trial',
  },
  {
    to: ROUTES.generate,
    Icon: Sparkles,
    title: 'GENERATE A NEW IDEA',
    description: 'Discover fresh idea concepts based on your interests, skills, and problem areas.',
    cta: 'Generate Ideas',
  },
  {
    to: ROUTES.roadmaps,
    Icon: Map,
    title: 'GET ROADMAP',
    description: 'Continue an existing idea toward validation, development, and launch.',
    cta: 'View Roadmaps',
  },
  {
    to: ROUTES.history,
    Icon: History,
    title: 'LOAD PREVIOUS TRIALS',
    description: 'Reopen past trials, verdicts, and evidence exactly where you left them.',
    cta: 'Open History',
  },
];

export function PathsPage() {
  useDocumentTitle('Choose Your Path');
  const navigate = useNavigate();

  return (
    <div className="py-2">
      <PageHeader
        eyebrow="CHOOSE YOUR PATH"
        title="Four Ways Forward"
        description="Every path leads through trials. Pick the one that matches your purpose."
        actions={
          <button onClick={() => navigate(ROUTES.gate)} className="btn-ghost !py-2 text-xs">
            <Compass className="h-4 w-4" /> Back to Gate
          </button>
        }
      />

      <div className="grid gap-5 sm:grid-cols-2">
        {PATHS.map(({ to, Icon, title, description, cta }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: i * 0.08 }}
          >
            <Link
              to={to}
              className="card-realm group flex h-full flex-col p-6 transition-all duration-300 hover:border-blood-800 hover:shadow-red-glow"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="grid h-12 w-12 place-items-center rounded-lg border border-blood-950 bg-blood-950/50 transition-colors group-hover:bg-blood-800/30">
                  <Icon className="h-6 w-6 text-blood-500" />
                </div>
                <span className="font-cinzel text-[10px] tracking-[0.3em] text-parchment-dim/50">
                  0{i + 1}
                </span>
              </div>
              <h2 className="title-cinzel text-base text-parchment-light transition-colors group-hover:text-blood-400">
                {title}
              </h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-parchment-dim">
                {description}
              </p>
              <span className="mt-5 font-cinzel text-[11px] tracking-[0.2em] text-blood-500">
                {cta} →
              </span>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
