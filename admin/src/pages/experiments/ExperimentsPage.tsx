import { useCallback, useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { PageHeading, ErrorMessage } from '../../components/common/PageHeading';
import { DataTable, Column, Pagination } from '../../components/common/DataTable';
import { Badge } from '../../components/common/FormControls';
import { experimentsService } from '../../services/experiments';
import { AdminExperiment } from '../../types/content';
import { PageMeta } from '../../types/api';
import { AdminApiError } from '../../services/api';
import { formatDate, verdictBadgeClass } from '../../utils';

const STATUS_CLASS: Record<string, string> = {
  RUNNING: 'border-sky-500/40 bg-sky-500/10 text-sky-300',
  COMPLETED: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
  CANCELLED: 'border-red-500/40 bg-red-500/10 text-red-400',
};

export function ExperimentsPage() {
  const [experiments, setExperiments] = useState<AdminExperiment[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await experimentsService.list({ page, limit: 20, search: search || undefined });
      setExperiments(result.experiments);
      setMeta(result.meta);
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : 'Failed to load experiments.');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    const t = window.setTimeout(() => void load(), search ? 300 : 0);
    return () => window.clearTimeout(t);
  }, [load, search]);

  const columns: Column<AdminExperiment>[] = [
    {
      header: 'Experiment',
      cell: (e) => (
        <div>
          <p className="font-semibold text-sand">{e.title}</p>
          <p className="text-xs text-sand-dim">{e.trial.idea.title} · {e.trial.user.name}</p>
        </div>
      ),
    },
    {
      header: 'Trial Verdict',
      cell: (e) =>
        e.trial.verdict ? (
          <Badge className={verdictBadgeClass(e.trial.verdict)}>{e.trial.verdict}</Badge>
        ) : (
          <span className="text-sand-dim">—</span>
        ),
    },
    {
      header: 'Status',
      cell: (e) => <Badge className={STATUS_CLASS[e.status]}>{e.status}</Badge>,
    },
    { header: 'Duration', cell: (e) => <span className="text-sand-dim">{e.duration}</span> },
    { header: 'Created', cell: (e) => <span className="text-sand-dim">{formatDate(e.createdAt)}</span> },
  ];

  return (
    <div>
      <PageHeading
        title="Experiments"
        description="Validation experiments generated across all trials."
        actions={
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sand-dim" />
            <input
              className="admin-input !w-64 !pl-9 !py-2.5"
              placeholder="Search experiments…"
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              aria-label="Search experiments"
            />
          </div>
        }
      />

      {error && <ErrorMessage message={error} />}
      {loading ? (
        <p className="py-16 text-center text-xs uppercase tracking-[0.3em] text-sand-dim">
          Loading experiments…
        </p>
      ) : (
        <>
          <DataTable columns={columns} rows={experiments} rowKey={(e) => e.id} empty="No experiments yet." />
          <Pagination meta={meta} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
