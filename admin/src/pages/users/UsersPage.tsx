import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Trash2, Users as UsersIcon } from 'lucide-react';
import { PageHeading, ErrorMessage } from '../../components/common/PageHeading';
import { DataTable, Column, Pagination } from '../../components/common/DataTable';
import { Badge, Button } from '../../components/common/FormControls';
import { ConfirmDialog } from '../../components/common/Modal';
import { usersService } from '../../services/users';
import { AdminUser } from '../../types/admin';
import { PageMeta } from '../../types/api';
import { AdminApiError } from '../../services/api';
import { formatDate, roleBadgeClass } from '../../utils';

export function UsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await usersService.list({
        page,
        limit: 20,
        search: search || undefined,
        role: role || undefined,
      });
      setUsers(result.users);
      setMeta(result.meta);
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, [page, search, role]);

  useEffect(() => {
    const t = window.setTimeout(() => void load(), search ? 300 : 0);
    return () => window.clearTimeout(t);
  }, [load, search]);

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await usersService.remove(toDelete.id);
      setToDelete(null);
      await load();
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : 'Delete failed.');
    } finally {
      setDeleting(false);
    }
  };

  const columns: Column<AdminUser>[] = [
    {
      header: 'User',
      cell: (u) => (
        <div>
          <p className="font-semibold text-sand">{u.name}</p>
          <p className="text-xs text-sand-dim">@{u.username} · {u.email}</p>
        </div>
      ),
    },
    { header: 'Role', cell: (u) => <Badge className={roleBadgeClass(u.role)}>{u.role}</Badge> },
    {
      header: 'Ideas / Trials',
      cell: (u) => `${u._count?.ideas ?? 0} / ${u._count?.trials ?? 0}`,
    },
    { header: 'Joined', cell: (u) => <span className="text-sand-dim">{formatDate(u.createdAt)}</span> },
    {
      header: '',
      cell: (u) => (
        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            className="rounded p-1.5 text-sand-dim hover:text-brand-400"
            aria-label={`Delete ${u.name}`}
            onClick={() => setToDelete(u)}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
      className: 'text-right',
    },
  ];

  return (
    <div>
      <PageHeading
        title="Users"
        description="Search, inspect, edit, and remove platform users."
        actions={
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sand-dim" />
            <input
              className="admin-input !w-64 !pl-9 !py-2.5"
              placeholder="Search name, email, username…"
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              aria-label="Search users"
            />
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {['', 'USER', 'ADMIN', 'SUPER_ADMIN'].map((r) => (
          <button
            key={r || 'all'}
            onClick={() => {
              setPage(1);
              setRole(r);
            }}
            className={
              role === r
                ? 'btn-primary !py-1.5 !px-3 !text-[11px]'
                : 'btn-ghost !py-1.5 !px-3 !text-[11px]'
            }
          >
            {r === '' ? 'All' : r}
          </button>
        ))}
      </div>

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <p className="py-16 text-center text-xs uppercase tracking-[0.3em] text-sand-dim">
          Loading users…
        </p>
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={users}
            rowKey={(u) => u.id}
            onRowClick={(u) => navigate(`/admin/users/${u.id}`)}
            empty="No users match your search."
          />
          <Pagination meta={meta} onPageChange={setPage} />
        </>
      )}

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete user"
        message={`Permanently delete "${toDelete?.name}" and all of their ideas, trials, and notifications? This cannot be undone.`}
        busy={deleting}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
