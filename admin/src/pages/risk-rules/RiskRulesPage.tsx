import { useCallback, useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { PageHeading, ErrorMessage } from '../../components/common/PageHeading';
import { DataTable, Column, Pagination } from '../../components/common/DataTable';
import { Badge, Button, Input, Select, Textarea } from '../../components/common/FormControls';
import { ConfirmDialog, Modal } from '../../components/common/Modal';
import { riskRulesService } from '../../services/riskRules';
import { RiskRule } from '../../types/content';
import { PageMeta } from '../../types/api';
import { AdminApiError } from '../../services/api';
import { severityBadgeClass } from '../../utils';
import { SEVERITY_OPTIONS } from '../../constants';

const emptyForm = { name: '', description: '', category: '', severity: 'MEDIUM', threshold: '' };

export function RiskRulesPage() {
  const [rules, setRules] = useState<RiskRule[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<RiskRule | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<RiskRule | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await riskRulesService.list({ page, limit: 20 });
      setRules(result.riskRules);
      setMeta(result.meta);
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : 'Failed to load risk rules.');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async () => {
    if (form.name.trim().length < 3) return;
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        category: form.category || undefined,
        severity: form.severity as RiskRule['severity'],
        threshold: form.threshold ? Number(form.threshold) : null,
      };
      if (editing) await riskRulesService.update(editing.id, payload);
      else await riskRulesService.create(payload);
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
      await riskRulesService.remove(toDelete.id);
      setToDelete(null);
      await load();
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : 'Delete failed.');
    } finally {
      setDeleting(false);
    }
  };

  const columns: Column<RiskRule>[] = [
    {
      header: 'Rule',
      cell: (r) => (
        <div>
          <p className="font-semibold text-sand">{r.name}</p>
          <p className="text-xs text-sand-dim">{r.description}</p>
        </div>
      ),
    },
    { header: 'Category', cell: (r) => <Badge>{r.category ?? 'Global'}</Badge> },
    {
      header: 'Severity',
      cell: (r) => <Badge className={severityBadgeClass(r.severity)}>{r.severity}</Badge>,
    },
    { header: 'Threshold', cell: (r) => <span>{r.threshold ?? 'â€”'}</span> },
    {
      header: 'Status',
      cell: (r) => (
        <Badge className={r.active ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' : undefined}>
          {r.active ? 'Active' : 'Off'}
        </Badge>
      ),
    },
    {
      header: '',
      cell: (r) => (
        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            className="btn-ghost !px-2.5 !py-1 !text-[10px]"
            onClick={() => {
              setEditing(r);
              setForm({
                name: r.name,
                description: r.description,
                category: r.category ?? '',
                severity: r.severity,
                threshold: r.threshold === null ? '' : String(r.threshold),
              });
              setOpen(true);
            }}
          >
            Edit
          </button>
          <button
            className="rounded p-1.5 text-sand-dim hover:text-brand-400"
            aria-label="Delete rule"
            onClick={() => setToDelete(r)}
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
        title="Risk Rules"
        description="Rules that shape how the engine flags and escalates risk."
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setForm(emptyForm);
              setOpen(true);
            }}
          >
            <Plus className="h-4 w-4" /> New Rule
          </Button>
        }
      />

      {error && <ErrorMessage message={error} />}
      {loading ? (
        <p className="py-16 text-center text-xs uppercase tracking-[0.3em] text-sand-dim">
          Loading rulesâ€¦
        </p>
      ) : (
        <>
          <DataTable columns={columns} rows={rules} rowKey={(r) => r.id} empty="No risk rules." />
          <Pagination meta={meta} onPageChange={setPage} />
        </>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Edit Risk Rule' : 'New Risk Rule'}
      >
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
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Category (optional)"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            />
            <Select
              label="Severity"
              value={form.severity}
              onChange={(e) => setForm((f) => ({ ...f, severity: e.target.value }))}
            >
              {SEVERITY_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
          </div>
          <Input
            label="Threshold (0â€“100, optional)"
            type="number"
            value={form.threshold}
            onChange={(e) => setForm((f) => ({ ...f, threshold: e.target.value }))}
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
        title="Delete risk rule"
        message={`Delete "${toDelete?.name}" permanently?`}
        busy={deleting}
        onConfirm={() => void remove()}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}

