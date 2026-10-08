import { useCallback, useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { PageHeading, ErrorMessage } from '../../components/common/PageHeading';
import { DataTable, Column } from '../../components/common/DataTable';
import { Badge, Button, Input, Textarea } from '../../components/common/FormControls';
import { ConfirmDialog, Modal } from '../../components/common/Modal';
import { roadmapsService } from '../../services/roadmaps';
import { RoadmapTemplate } from '../../types/content';
import { AdminApiError } from '../../services/api';

const emptyForm = {
  name: '',
  description: '',
  objective: '',
  tasks: '',
  deliverables: '',
  estimatedEffort: '1 week',
};

function toList(value: string): string[] {
  return value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

export function RoadmapTemplatesPage() {
  const [templates, setTemplates] = useState<RoadmapTemplate[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<RoadmapTemplate | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<RoadmapTemplate | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await roadmapsService.list({ limit: 50 });
      setTemplates(result.templates);
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : 'Failed to load templates.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    if (form.name.trim().length < 2 || form.objective.trim().length < 3) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        objective: form.objective,
        tasks: toList(form.tasks),
        deliverables: toList(form.deliverables),
        estimatedEffort: form.estimatedEffort,
        order: templates.length + 1,
      };
      if (editing) await roadmapsService.update(editing.id, payload);
      else await roadmapsService.create(payload);
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
      await roadmapsService.remove(toDelete.id);
      setToDelete(null);
      await load();
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : 'Delete failed.');
    } finally {
      setDeleting(false);
    }
  };

  const columns: Column<RoadmapTemplate>[] = [
    { header: '#', cell: (t) => <span>{t.order}</span> },
    {
      header: 'Stage',
      cell: (t) => (
        <div>
          <p className="font-semibold text-sand">{t.name}</p>
          <p className="text-xs text-sand-dim">{t.objective}</p>
        </div>
      ),
    },
    { header: 'Tasks', cell: (t) => <Badge>{t.tasks.length}</Badge> },
    { header: 'Deliverables', cell: (t) => <Badge>{t.deliverables.length}</Badge> },
    { header: 'Effort', cell: (t) => <span className="text-sand-dim">{t.estimatedEffort}</span> },
    {
      header: '',
      cell: (t) => (
        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            className="btn-ghost !px-2.5 !py-1 !text-[10px]"
            onClick={() => {
              setEditing(t);
              setForm({
                name: t.name,
                description: t.description ?? '',
                objective: t.objective,
                tasks: t.tasks.join(', '),
                deliverables: t.deliverables.join(', '),
                estimatedEffort: t.estimatedEffort,
              });
              setOpen(true);
            }}
          >
            Edit
          </button>
          <button
            className="rounded p-1.5 text-sand-dim hover:text-brand-400"
            aria-label="Delete stage"
            onClick={() => setToDelete(t)}
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
        title="Roadmap Templates"
        description="The stage templates used to build roadmaps after a verdict."
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setForm(emptyForm);
              setOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> New Stage
          </Button>
        }
      />

      {error && <ErrorMessage message={error} />}
      {loading ? (
        <p className="py-16 text-center text-xs uppercase tracking-[0.3em] text-sand-dim">
          Loading templatesâ€¦
        </p>
      ) : (
        <DataTable columns={columns} rows={templates} rowKey={(t) => t.id} empty="No templates." />
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Stage' : 'New Stage'}>
        <div className="space-y-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <Input label="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          <Textarea label="Objective" value={form.objective} onChange={(e) => setForm((f) => ({ ...f, objective: e.target.value }))} />
          <Textarea label="Tasks (comma separated)" value={form.tasks} onChange={(e) => setForm((f) => ({ ...f, tasks: e.target.value }))} />
          <Textarea label="Deliverables (comma separated)" value={form.deliverables} onChange={(e) => setForm((f) => ({ ...f, deliverables: e.target.value }))} />
          <Input label="Estimated Effort" value={form.estimatedEffort} onChange={(e) => setForm((f) => ({ ...f, estimatedEffort: e.target.value }))} />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button loading={saving} onClick={() => void save()}>Save</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete template"
        message={`Delete "${toDelete?.name}" permanently?`}
        busy={deleting}
        onConfirm={() => void remove()}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}

