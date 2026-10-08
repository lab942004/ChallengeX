import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { PageHeading, ErrorMessage } from '../../components/common/PageHeading';
import { DataTable, Column, Pagination } from '../../components/common/DataTable';
import { Badge } from '../../components/common/FormControls';
import { trialsService } from '../../services/trials';
import { AdminTrial } from '../../types/admin';
import { PageMeta } from '../../types/api';
import { AdminApiError } from '../../services/api';
import { formatDate, verdictBadgeClass } from '../../utils';
import { TRIAL_STATUS_OPTIONS, VERDICT_OPTIONS } from '../../constants';

export function TrialsPage() {
  const navigate = useNavigate();
  const [trials, setTrials] = useState<AdminTrial[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [verdict, setVerdict] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await trialsService.list({
        page,
        limit: 20,
        search: search || undefined,
        status: status || undefined,
        verdict: verdict || undefined,
      });
      setTrials(result.trials);
      setMeta(result.meta);
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : 'Failed to load trials.');
    } finally {
      setLoading(false);
    }
  }, [page, search, status, verdict]);

  useEffect(() => {
    const t = window.setTimeout(() => void load(), search ? 300 : 0);
    return () => window.clearTimeout(t);
  }, [load, search]);

  const columns: Column<AdminTrial>[] = [
    {
      header: 'Idea',
      cell: (t) => (
        <div>
          <p className="font-semibold text-sand">{t.idea.title}</p>
          <p className="text-xs text-sand-dim">{t.user.name} · {t.user.email}</p>
        </div>
      ),
    },
    { header: 'Mode', cell: (t) => <Badge>{t.mode.replace('_', ' ')}</Badge> },
    { header: 'Status', cell: (t) => <Badge>{t.status}</Badge> },
    {
      header: 'Verdict',
      cell: (t) =>
        t.verdict ? (
          <Badge className={verdictBadgeClass(t.verdict)}>{t.verdict}</Badge>
        ) : (
          <span className="text-sand-dim">—</span>
        ),
    },
    { header: 'Score', cell: (t) => <span className="font-bold">{t.score ?? '—'}</span> },
    { header: 'Created', cell: (t) => <span className="text-sand-dim">{formatDate(t.createdAt)}</span> },
  ];

  return (
    <div>
      <PageHeading
        title="Trials"
        description="Inspect every trial, its verdict, and its full answer set."
        actions={
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sand-dim" />
            <input
              className="admin-input !w-64 !pl-9 !py-2.5"
              placeholder="Search by idea title…"
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              aria-label="Search trials"
            />
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap gap-4">
        <select
          className="admin-input !w-auto !py-2 text-xs"
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value);
          }}
          aria-label="Filter by status"
        >
          <option value="">All statuses</option>
          {TRIAL_STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          className="admin-input !w-auto !py-2 text-xs"
          value={verdict}
          onChange={(e) => {
            setPage(1);
            setVerdict(e.target.value);
          }}
          aria-label="Filter by verdict"
        >
          <option value="">All verdicts</option>
          {VERDICT_OPTIONS.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </div>

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <p className="py-16 text-center text-xs uppercase tracking-[0.3em] text-sand-dim">
          Loading trials…
        </p>
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={trials}
            rowKey={(t) => t.id}
            onRowClick={(t) => navigate(`/admin/trials/${t.id}`)}
            empty="No trials found."
          />
          <Pagination meta={meta} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
