import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FlaskConical } from 'lucide-react';
import { ROUTES } from '../../constants';
import { useDocumentTitle } from '../../hooks';
import { PageHeader } from '../../components/common/PageHeader';
import { EmptyState } from '../../components/common/EmptyState';
import { PageLoader } from '../../components/ui/ThemedLoader';
import { trialsService } from '../../services/trials';
import { experimentsService, Experiment } from '../../services/experiments';
import { ApiClientError } from '../../services/api';
import { truncate } from '../../utils';

interface ExperimentEntry {
  experiment: Experiment;
  ideaTitle: string;
  trialId: string;
}

/** Status tones for experiment chips. */
const STATUS_CLASS: Record<Experiment['status'], string> = {
  DRAFT: 'text-parchment-dim border-blood-950 bg-obsidian',
  PLANNED: 'text-amber-300 border-amber-500/40 bg-amber-500/10',
  RUNNING: 'text-sky-300 border-sky-500/40 bg-sky-500/10',
  COMPLETED: 'text-emerald-300 border-emerald-500/40 bg-emerald-500/10',
  CANCELLED: 'text-blood-400 border-blood-600/50 bg-blood-800/20',
};

/**
 * ExperimentsPage — validation experiments from completed trials.
 * Data source: GET /trials?status=COMPLETED + GET /trials/:id/experiments
 * (run in parallel; partial failures are tolerated per-trial).
 */
export function ExperimentsPage() {
  useDocumentTitle('Experiments');

  const [entries, setEntries] = useState<ExperimentEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { trials } = await trialsService.list({ status: 'COMPLETED', limit: 30 });
        const results = await Promise.allSettled(
          trials.map(async (trial) => {
            const { experiments } = await experimentsService.listForTrial(trial.id);
            return experiments.map((experiment) => ({
              experiment,
              ideaTitle: trial.ideaTitle,
              trialId: trial.id,
            }));
          }),
        );
        if (cancelled) return;
        const collected = results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
        setEntries(collected);
        const anyFulfilled = results.some((r) => r.status === 'fulfilled');
        if (!anyFulfilled && trials.length > 0) {
          setError('Could not load experiments. Please try again.');
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiClientError ? err.message : 'Could not load experiments.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <PageLoader message="GATHERING EXPERIMENTS..." />;

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        eyebrow="PROOF IN THE FIELD"
        title="Experiments"
        description="Cheapest validation experiments forged from your verdicts — track their progress here."
        actions={
          <Link to={ROUTES.history} className="btn-ghost !py-2.5 text-xs">
            View History
          </Link>
        }
      />

      {error ? (
        <EmptyState title="EXPERIMENTS UNAVAILABLE" message={error} />
      ) : entries.length === 0 ? (
        <EmptyState
          icon={<FlaskConical className="h-10 w-10" />}
          title="NO EXPERIMENTS YET"
          message="Complete a trial to receive a validation experiment with your verdict."
          action={
            <Link to={ROUTES.idea} className="btn-primary">
              Start a Trial
            </Link>
          }
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {entries.map(({ experiment, ideaTitle, trialId }, i) => (
            <motion.li
              key={experiment.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.06, 0.4) }}
              className="card-realm flex h-full flex-col p-5"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-blood-950 bg-blood-950/50">
                  <FlaskConical className="h-4 w-4 text-blood-500" />
                </span>
                <span
                  className={`rounded border px-2 py-0.5 text-[10px] font-bold tracking-wider ${STATUS_CLASS[experiment.status]}`}
                >
                  {experiment.status}
                </span>
              </div>
              <h3 className="title-cinzel text-sm text-parchment-light">{experiment.title}</h3>
              <p className="mt-1 text-[11px] uppercase tracking-wider text-parchment-dim/60">
                {ideaTitle}
              </p>
              <p className="mt-2 flex-1 text-xs leading-relaxed text-parchment-dim">
                {truncate(experiment.description, 160)}
              </p>
              <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-parchment-dim">
                <span>Cost: {experiment.estimatedCost}</span>
                <span>Duration: {experiment.duration}</span>
              </div>
              <div className="mt-4">
                <Link
                  to={`${ROUTES.verdict}/${trialId}`}
                  className="btn-ghost w-full !py-2.5 !text-[11px]"
                >
                  View Verdict
                </Link>
              </div>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}