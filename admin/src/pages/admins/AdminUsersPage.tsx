import { useCallback, useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { PageHeading, ErrorMessage } from '../../components/common/PageHeading';
import { DataTable, Column } from '../../components/common/DataTable';
import { Badge, Button, Input, Select } from '../../components/common/FormControls';
import { ConfirmDialog, Modal } from '../../components/common/Modal';
import { usersService, AdminCreateUserPayload } from '../../services/users';
import { AdminUser } from '../../types/admin';
import { AdminApiError } from '../../services/api';
import { formatDate, roleBadgeClass } from '../../utils';
import { useAdminAuth } from '../../context/AdminAuthContext';

const emptyForm = { name: '', username: '', email: '', password: '', role: 'ADMIN' };

/** SUPER_ADMIN only â€” create, edit, and remove admin accounts. */
export function AdminUsersPage() {
  const { admin: me } = useAdminAuth();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { admins: data } = await usersService.listAdmins();
      setAdmins(data);
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : 'Failed to load admins.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const create = async () => {
    if (form.password.length < 8 || form.email.length < 5) return;
    setSaving(true);
    setMessage(null);
    try {
      await usersService.createAdmin(form as AdminCreateUserPayload);
      setOpen(false);
      setForm(emptyForm);
      setMessage('Admin account created.');
      await load();
    } catch (err) {
      setMessage(err instanceof AdminApiError ? err.message : 'Creation failed.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await usersService.removeAdmin(toDelete.id);
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
      header: 'Admin',
      cell: (a) => (
        <div>
          <p className="font-semibold text-sand">{a.name}</p>
          <p className="text-xs text-sand-dim">
            @{a.username} Â· {a.email}
          </p>
        </div>
      ),
    },
    { header: 'Role', cell: (a) => <Badge className={roleBadgeClass(a.role)}>{a.role}</Badge> },
    {
      header: 'Created',
      cell: (a) => <span className="text-sand-dim">{formatDate(a.createdAt)}</span>,
    },
    {
      header: '',
      cell: (a) => (
        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
          <button
            className="rounded p-1.5 text-sand-dim hover:text-brand-400 disabled:opacity-30"
            aria-label={`Remove ${a.name}`}
            disabled={a.id === me?.id}
            title={a.id === me?.id ? 'You cannot remove your own account' : undefined}
            onClick={() => setToDelete(a)}
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
        title="Admin Management"
        description="SUPER_ADMIN only â€” create, promote, and remove admin accounts."
        actions={
          <Button
            onClick={() => {
              setForm(emptyForm);
              setOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> New Admin
          </Button>
        }
      />

      {message && <p className="mb-4 text-sm text-brand-400">{message}</p>}
      {error && <ErrorMessage message={error} />}

      {loading ? (
        <p className="py-16 text-center text-xs uppercase tracking-[0.3em] text-sand-dim">
          Loading adminsâ€¦
        </p>
      ) : (
        <DataTable columns={columns} rows={admins} rowKey={(a) => a.id} empty="No admin accounts." />
      )}

      <Modal open={open} onClose={() => setOpen(false)} title="Create Admin">
        <div className="space-y-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <Input label="Username" value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          <Input
            label="Password"
            type="password"
            hint="Minimum 8 characters."
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          />
          <Select label="Role" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
            <option value="ADMIN">ADMIN</option>
            <option value="SUPER_ADMIN">SUPER_ADMIN</option>
          </Select>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button loading={saving} onClick={() => void create()}>
              Create
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Remove admin"
        message={`Remove admin access from "${toDelete?.name}"? The account becomes a regular USER.`}
        confirmLabel="Remove"
        busy={deleting}
        onConfirm={() => void remove()}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}

