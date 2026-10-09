import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BookMarked,
  FlaskConical,
  Gavel,
  Route as RouteIcon,
  Skull,
  Sparkles,
  Swords,
} from 'lucide-react';
import { ROUTES } from '../../constants';
import { useDocumentTitle } from '../../hooks';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/common/PageHeader';
import { EmptyState } from '../../components/common/EmptyState';
import { PageLoader } from '../../components/ui/ThemedLoader';
import { dashboardService } from '../../services/dashboard';
import { ApiClientError } from '../../services/api';
import { DashboardStats } from '../../types/dashboard';
import { cn, formatDate, verdictClass } from '../../utils';

function StatCard({
  label,
  value,
  Icon,
  accent,
}: {
  label: string;
  value: string | number;
  Icon: typeof Swords;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        'card-realm flex items-center gap-4 p-4',
        accent && 'border-blood-800/70 shadow-red-glow',
      )}
    >
      <span
        className={cn(
          'grid h-11 w-11 shrink-0 place-items-center rounded-lg border',
          accent
            ? 'border-blood-800 bg-blood-950/70 text-blood-500'
            : 'border-blood-950 bg-obsidian text-parchment-dim',
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-[10px] uppercase tracking-[0.18em] text-parchment-dim">
          {label}
        </p>
        <p className="font-cinzel text-2xl font-bold text-parchment-light">{value}</p>
      </div>
    </div>
  );
}

export function DashboardPage() {
  useDocumentTitle('Dashboard');
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await dashboardService.stats();
        if (!cancelled) setStats(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiClientError ? err.message : 'Could not load the dashboard.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <PageLoader message="ENTERING THE REALM..." />;
  if (error || !stats) return <EmptyState title="DASHBOARD UNAVAILABLE" message={error ?? ''} />;

  return (
    <div>
      <PageHeader
        eyebrow="YOUR COMMAND CENTER"
        title={`Welcome back, ${user?.name?.split(' ')[0] ?? 'Seeker'}`}
        description="Every number below is computed by the backend from your saved data."
        actions={
          <Link to={ROUTES.idea} className="btn-primary !py-2.5 text-xs">
            <Swords className="h-4 w-4" /> New Trial
          </Link>
        }
      />

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        <StatCard label="Total Ideas" value={stats.totalIdeas} Icon={Sparkles} />
        <StatCard label="Total Trials" value={stats.totalTrials} Icon={Swords} />
        <StatCard label="Build Decisions" value={stats.buildDecisions} Icon={Gavel} accent />
        <StatCard label="Pivot Decisions" value={stats.pivotDecisions} Icon={RouteIcon} />
        <StatCard label="Killed Ideas" value={stats.killedIdeas} Icon={Skull} />
        <StatCard label="Average Score" value={stats.averageScore} Icon={Gavel} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Continue trial */}
        <section className="card-realm p-5 lg:col-span-2">
          <h2 className="title-cinzel mb-4 text-sm text-parchment-light">Continue Trial</h2>
          {stats.activeTrial ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-parchment">
                  {stats.activeTrial.ideaTitle}
                </p>
                <p className="mt-1 text-xs text-parchment-dim">
                  Question {stats.activeTrial.currentQuestion} of{' '}
                  {stats.activeTrial.totalQuestions}
                </p>
                <div className="mt-2 h-1.5 w-48 overflow-hidden rounded-full bg-obsidian">
                  <div
                    className="h-full bg-gradient-to-r from-blood-800 to-blood-500"
                    style={{
                      width: `${Math.round(
                        (stats.activeTrial.currentQuestion /
                          Math.max(stats.activeTrial.totalQuestions, 1)) *
                          100,
                      )}%`,
                    }}
                  />
                </div>
              </div>
              <Link
                to={`${ROUTES.trial}/${stats.activeTrial.id}`}
                className="btn-primary !py-2.5 text-xs"
              >
                Resume <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <EmptyState
              title="NO ACTIVE TRIAL"
              message="Forge a new idea to start your next trial."
              action={
                <Link to={ROUTES.idea} className="btn-primary !py-2.5 text-xs">
                  Start Trial
                </Link>
              }
            />
          )}
        </section>

        {/* Collections */}
        <section className="card-realm p-5">
          <h2 className="title-cinzel mb-4 text-sm text-parchment-light">Collections</h2>
          <ul className="space-y-2 text-sm">
            <li>
              <Link
                to={ROUTES.ideas}
                className="flex items-center justify-between rounded-lg border border-transparent px-2 py-2 transition-colors hover:border-blood-950 hover:bg-surface-hover"
              >
                <span className="flex items-center gap-2 text-parchment-dim">
                  <BookMarked className="h-4 w-4 text-blood-500" /> Saved Ideas
                </span>
                <span className="flex items-center gap-1.5 font-semibold text-parchment">
                  {stats.savedIdeas.length}
                  <ArrowRight className="h-3.5 w-3.5 text-blood-500" />
                </span>
              </Link>
            </li>
            <li>
              <Link
                to={ROUTES.roadmaps}
                className="flex items-center justify-between rounded-lg border border-transparent px-2 py-2 transition-colors hover:border-blood-950 hover:bg-surface-hover"
              >
                <span className="flex items-center gap-2 text-parchment-dim">
                  <RouteIcon className="h-4 w-4 text-blood-500" /> Roadmaps
                </span>
                <span className="flex items-center gap-1.5 font-semibold text-parchment">
                  {stats.roadmapCount}
                  <ArrowRight className="h-3.5 w-3.5 text-blood-500" />
                </span>
              </Link>
            </li>
            <li>
              <Link
                to={ROUTES.experiments}
                className="flex items-center justify-between rounded-lg border border-transparent px-2 py-2 transition-colors hover:border-blood-950 hover:bg-surface-hover"
              >
                <span className="flex items-center gap-2 text-parchment-dim">
                  <FlaskConical className="h-4 w-4 text-blood-500" /> Experiments
                </span>
                <span className="flex items-center gap-1.5 font-semibold text-parchment">
                  {stats.experimentCount}
                  <ArrowRight className="h-3.5 w-3.5 text-blood-500" />
                </span>
              </Link>
            </li>
          </ul>
        </section>
      </div>

      {/* Recent trials */}
      <section className="card-realm mt-6 p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="title-cinzel text-sm text-parchment-light">Recent Trials</h2>
          <Link
            to={ROUTES.history}
            className="font-cinzel text-[11px] tracking-[0.16em] text-blood-500 hover:text-blood-400"
          >
            VIEW ALL →
          </Link>
        </div>
        {stats.recentTrials.length === 0 ? (
          <p className="text-sm text-parchment-dim">No trials yet — your saga begins now.</p>
        ) : (
          <ul className="divide-y divide-blood-950/70">
            {stats.recentTrials.map((trial, i) => (
              <motion.li
                key={trial.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-parchment">{trial.ideaTitle}</p>
                  <p className="text-xs text-parchment-dim">{formatDate(trial.createdAt)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  {trial.score !== null && (
                    <span className="font-cinzel text-sm text-blood-400">{trial.score}</span>
                  )}
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
                  <Link
                    to={`${ROUTES.verdict}/${trial.id}`}
                    className="text-parchment-dim hover:text-blood-400"
                    aria-label="Open trial"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </motion.li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}


