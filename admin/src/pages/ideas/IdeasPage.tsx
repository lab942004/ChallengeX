import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { PageHeading, ErrorMessage } from '../../components/common/PageHeading';
import { DataTable, Column, Pagination } from '../../components/common/DataTable';
import { Badge } from '../../components/common/FormControls';
import { ideasService } from '../../services/ideas';
import { AdminIdea } from '../../types/admin';
import { PageMeta } from '../../types/api';
import { AdminApiError } from '../../services/api';
import { formatDate } from '../../utils';

export function IdeasPage() {
  const navigate = useNavigate();
  const [ideas, setIdeas] = useState<AdminIdea[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await ideasService.list({ page, limit: 20, search: search || undefined });
      setIdeas(result.ideas);
      setMeta(result.meta);
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : 'Failed to load ideas.');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    const t = window.setTimeout(() => void load(), search ? 300 : 0);
    return () => window.clearTimeout(t);
  }, [load, search]);

  const columns: Column<AdminIdea>[] = [
    {
      header: 'Idea',
      cell: (idea) => (
        <div>
          <p className="font-semibold text-sand">{idea.title}</p>
          <p className="line-clamp-1 max-w-md text-xs text-sand-dim">{idea.description}</p>
        </div>
      ),
    },
    {
      header: 'Owner',
      cell: (idea) => <span className="text-sand-dim">{idea.user.name}</span>,
    },
    {
      header: 'Trials',
      cell: (idea) => <span>{idea._count?.trials ?? 0}</span>,
    },
    {
      header: 'Status',
      cell: (idea) => <Badge>{idea.status}</Badge>,
    },
    { header: 'Created', cell: (idea) => <span className="text-sand-dim">{formatDate(idea.createdAt)}</span> },
  ];

  return (
    <div>
      <PageHeading
        title="Ideas"
        description="Browse every idea submitted on the platform."
        actions={
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sand-dim" />
            <input
              className="admin-input !w-64 !pl-9 !py-2.5"
              placeholder="Search ideas…"
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              aria-label="Search ideas"
            />
          </div>
        }
      />

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <p className="py-16 text-center text-xs uppercase tracking-[0.3em] text-sand-dim">
          Loading ideas…
        </p>
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={ideas}
            rowKey={(i) => i.id}
            onRowClick={(i) => navigate(`/admin/ideas/${i.id}`)}
            empty="No ideas found."
          />
          <Pagination meta={meta} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
