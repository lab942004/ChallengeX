import { useCallback, useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { PageHeading, ErrorMessage } from '../../components/common/PageHeading';
import { DataTable, Column } from '../../components/common/DataTable';
import { Badge, Button, Input, Textarea } from '../../components/common/FormControls';
import { ConfirmDialog, Modal } from '../../components/common/Modal';
import { categoriesService } from '../../services/categories';
import { ChallengeCategory } from '../../types/content';
import { AdminApiError } from '../../services/api';

export function CategoriesPage() {
  const [categories, setCategories] = useState<ChallengeCategory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ChallengeCategory | null>(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<ChallengeCategory | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { categories: data } = await categoriesService.list();
      setCategories(data);
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : 'Failed to load categories.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    if (form.name.trim().length < 2) return;
    setSaving(true);
    try {
      if (editing) {
        await categoriesService.update(editing.id, { name: form.name, description: form.description });
      } else {
        await categoriesService.create({
          name: form.name,
          description: form.description,
          order: categories.length + 1,
        });
      }
      setOpen(false);
      await load();
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : 'Save failed.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await categoriesService.remove(toDelete.id);
      setToDelete(null);
      await load();
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : 'Delete failed.');
    } finally {
      setDeleting(false);
    }
  };

  const columns: Column<ChallengeCategory>[] = [
    { header: 'Order', cell: (c) => <span>{c.order}</span> },
    {
      header: 'Name',
      cell: (c) => (
        <div>
          <p className="font-semibold text-sand">{c.name}</p>
          <p className="text-xs text-sand-dim">{c.description ?? 'â€”'}</p>
        </div>
      ),
    },
    { header: 'Questions', cell: (c) => <span>{c._count?.questions ?? 0}</span> },
    {
      header: 'Status',
      cell: (c) => (
        <Badge className={c.active ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' : undefined}>
          {c.active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      header: '',
      cell: (c) => (
        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            className="btn-ghost !px-2.5 !py-1 !text-[10px]"
            onClick={() => {
              setEditing(c);
              setForm({ name: c.name, description: c.description ?? '' });
              setOpen(true);
            }}
          >
            Edit
          </button>
          <button
            className="rounded p-1.5 text-sand-dim hover:text-brand-400"
            aria-label={`Delete ${c.name}`}
            onClick={() => setToDelete(c)}
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
        title="Categories"
        description="The seven risk categories (and more) that structure every trial."
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setForm({ name: '', description: '' });
              setOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> New Category
          </Button>
        }
      />

      {error && <ErrorMessage message={error} />}
      {loading ? (
        <p className="py-16 text-center text-xs uppercase tracking-[0.3em] text-sand-dim">
          Loading categoriesâ€¦
        </p>
      ) : (
        <DataTable columns={columns} rows={categories} rowKey={(c) => c.id} empty="No categories." />
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Category' : 'New Category'}>
        <div className="space-y-4">
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button loading={saving} onClick={() => void save()}>
              Save
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete category"
        message={`Deleting "${toDelete?.name}" also deletes every question inside it.`}
        busy={deleting}
        onConfirm={() => void remove()}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
