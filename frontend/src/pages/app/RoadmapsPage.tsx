import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Route as RouteIcon } from 'lucide-react';
import { ROUTES } from '../../constants';
import { useDocumentTitle } from '../../hooks';
import { PageHeader } from '../../components/common/PageHeader';
import { EmptyState } from '../../components/common/EmptyState';
import { PageLoader } from '../../components/ui/ThemedLoader';
import { trialsService } from '../../services/trials';
import { ApiClientError } from '../../services/api';
import { TrialListItem } from '../../types/trial';
import { cn, formatDate, verdictClass } from '../../utils';

/**
 * RoadmapsPage — lists completed trials (each completed trial carries a
 * roadmap on the backend) and links straight into the persisted roadmap
 * record. Data source: GET /trials?status=COMPLETED.
 */
export function RoadmapsPage() {
  useDocumentTitle('Roadmaps');

  const [trials, setTrials] = useState<TrialListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { trials: data, meta } = await trialsService.list({
          status: 'COMPLETED',
          limit: 50,
          sort: 'completedAt',
          order: 'desc',
        });
        if (!cancelled) {
          setTrials(data);
          setTotal(meta.total);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiClientError ? err.message : 'Could not load roadmaps.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <PageLoader message="CHARTING THE ROADMAPS..." />;

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        eyebrow="FROM VERDICT TO LAUNCH"
        title="Roadmaps"
        description={`Every completed trial forges a roadmap — ${total} roadmap${total === 1 ? '' : 's'} in your realm.`}
        actions={
          <Link to={ROUTES.history} className="btn-ghost !py-2.5 text-xs">
            View History
          </Link>
        }
      />

      {error ? (
        <EmptyState title="ROADMAPS UNAVAILABLE" message={error} />
      ) : trials.length === 0 ? (
        <EmptyState
          icon={<RouteIcon className="h-10 w-10" />}
          title="NO ROADMAPS FORGED YET"
          message="Complete a trial and the realm will forge your first roadmap from the verdict."
          action={
            <Link to={ROUTES.idea} className="btn-primary">
              Start a Trial
            </Link>
          }
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {trials.map((trial, i) => (
            <motion.li
              key={trial.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.06, 0.4) }}
              className="card-realm flex h-full flex-col p-5"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-blood-950 bg-blood-950/50">
                  <RouteIcon className="h-4 w-4 text-blood-500" />
                </span>
                {trial.verdict && (
                  <span
                    className={cn(
                      'rounded border px-2 py-0.5 text-[10px] font-bold tracking-wider',
                      verdictClass(trial.verdict),
                    )}
                  >
                    {trial.verdict}
                  </span>
                )}
              </div>
              <h3 className="title-cinzel text-sm text-parchment-light">{trial.ideaTitle}</h3>
              <p className="mt-2 flex-1 text-xs text-parchment-dim">
                Completed {formatDate(trial.completedAt ?? trial.createdAt)}
                {trial.score !== null && ` · Score ${trial.score}`}
              </p>
              <div className="mt-4">
                <Link
                  to={`${ROUTES.roadmap}/${trial.id}`}
                  className="btn-primary w-full !py-2.5 !text-[11px]"
                >
                  Open Roadmap <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}