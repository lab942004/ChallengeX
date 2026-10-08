import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { History as HistoryIcon, RotateCcw, Search } from 'lucide-react';
import { ROUTES } from '../../constants';
import { useDocumentTitle } from '../../hooks';
import { PageHeader } from '../../components/common/PageHeader';
import { EmptyState } from '../../components/common/EmptyState';
import { PageLoader } from '../../components/ui/ThemedLoader';
import { trialsService } from '../../services/trials';
import { ApiClientError } from '../../services/api';
import { TrialListItem } from '../../types/trial';
import { cn, formatDate, verdictClass } from '../../utils';

const FILTERS = [
  { key: 'ALL', label: 'All' },
  { key: 'BUILD', label: 'Build' },
  { key: 'PIVOT', label: 'Pivot' },
  { key: 'VALIDATE', label: 'Validate' },
  { key: 'KILL', label: 'Kill' },
] as const;

type FilterKey = (typeof FILTERS)[number]['key'];

export function HistoryPage() {
  useDocumentTitle('History');

  const [trials, setTrials] = useState<TrialListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterKey>('ALL');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'createdAt' | 'score'>('createdAt');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { trials: data } = await trialsService.list({
        limit: 50,
        verdict: filter === 'ALL' ? undefined : filter,
        search: search || undefined,
        sort,
        order: 'desc',
      });
      setTrials(data);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Could not load history.');
    } finally {
      setLoading(false);
    }
  }, [filter, search, sort]);

  useEffect(() => {
    const t = window.setTimeout(() => void load(), search ? 300 : 0);
    return () => window.clearTimeout(t);
  }, [load, search]);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        eyebrow="TRIAL ARCHIVES"
        title="History"
        description="Search, filter, sort, and reopen any past trial — reopening loads the real saved data."
      />

      {/* Controls */}
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                'rounded-lg border px-3.5 py-2 font-cinzel text-[11px] tracking-[0.14em] transition-colors',
                filter === f.key
                  ? 'border-blood-600 bg-blood-950/70 text-blood-400'
                  : 'border-blood-950 bg-obsidian/60 text-parchment-dim hover:border-blood-800',
              )}
            >
              {f.label.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1 lg:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-parchment-dim" />
            <input
              className="field-input !pl-9"
              placeholder="Search ideas…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search trials"
            />
          </div>
          <select
            className="field-input !w-auto"
            value={sort}
            onChange={(e) => setSort(e.target.value as 'createdAt' | 'score')}
            aria-label="Sort trials"
          >
            <option value="createdAt">Newest</option>
            <option value="score">Score</option>
          </select>
        </div>
      </div>

      {loading ? (
        <PageLoader message="SEARCHING THE ARCHIVES..." />
      ) : error ? (
        <EmptyState title="ARCHIVES UNAVAILABLE" message={error} />
      ) : trials.length === 0 ? (
        <EmptyState
          icon={<HistoryIcon className="h-10 w-10" />}
          title="NO TRIALS FOUND"
          message="No trials match your filters. Forge a new trial to begin filling these archives."
          action={
            <Link to={ROUTES.idea} className="btn-primary">
              Start a Trial
            </Link>
          }
        />
      ) : (
        <ul className="grid gap-3">
          {trials.map((trial, i) => (
            <motion.li
              key={trial.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.05, 0.4) }}
              className="card-realm flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate text-sm font-semibold text-parchment">
                    {trial.ideaTitle}
                  </h3>
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
                  <span className="text-[10px] uppercase tracking-wider text-parchment-dim/60">
                    {trial.status}
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-parchment-dim">
                  {formatDate(trial.createdAt)} · {trial.answeredCount}/{trial.questionCount}{' '}
                  answered
                  {trial.score !== null && ` · Score ${trial.score}`}
                </p>
              </div>

              <div className="flex shrink-0 gap-2">
                <Link
                  to={
                    trial.status === 'COMPLETED'
                      ? `${ROUTES.verdict}/${trial.id}`
                      : `${ROUTES.trial}/${trial.id}`
                  }
                  className="btn-primary !px-4 !py-2 !text-[11px]"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  {trial.status === 'COMPLETED' ? 'View' : 'Resume'}
                </Link>
                <Link
                  to={`${ROUTES.trial}/${trial.id}`}
                  className="btn-ghost !px-4 !py-2 !text-[11px]"
                >
                  Reopen
                </Link>
              </div>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}

