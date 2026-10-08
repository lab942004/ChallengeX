import { useCallback, useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { PageHeading, ErrorMessage } from '../../components/common/PageHeading';
import { DataTable, Column, Pagination } from '../../components/common/DataTable';
import { Badge, Button, Input, Select, Textarea } from '../../components/common/FormControls';
import { ConfirmDialog, Modal } from '../../components/common/Modal';
import { questionsService } from '../../services/questions';
import { categoriesService } from '../../services/categories';
import { ChallengeQuestion, ChallengeCategory } from '../../types/content';
import { PageMeta } from '../../types/api';
import { AdminApiError } from '../../services/api';
import { cn } from '../../utils';
import { RISK_LEVEL_OPTIONS } from '../../constants';

export function QuestionsPage() {
  const [questions, setQuestions] = useState<ChallengeQuestion[]>([]);
  const [categories, setCategories] = useState<ChallengeCategory[]>([]);
  const [meta, setMeta] = useState<PageMeta | null>(null);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<ChallengeQuestion | null>(null);
  const [form, setForm] = useState({
    categoryId: '',
    question: '',
    riskLevel: 'MEDIUM',
    explanation: '',
  });
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<ChallengeQuestion | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [q, c] = await Promise.all([
        questionsService.list({ page, limit: 20 }),
        categoriesService.list(),
      ]);
      setQuestions(q.questions);
      setMeta(q.meta);
      setCategories(c.categories);
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : 'Failed to load questions.');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      categoryId: categories[0]?.id ?? '',
      question: '',
      riskLevel: 'MEDIUM',
      explanation: '',
    });
    setEditorOpen(true);
  };

  const openEdit = (q: ChallengeQuestion) => {
    setEditing(q);
    setForm({
      categoryId: q.categoryId,
      question: q.question,
      riskLevel: q.riskLevel,
      explanation: q.explanation ?? '',
    });
    setEditorOpen(true);
  };

  const save = async () => {
    if (!form.categoryId || form.question.trim().length < 10) return;
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        await questionsService.update(editing.id, {
          categoryId: form.categoryId,
          question: form.question,
          riskLevel: form.riskLevel as ChallengeQuestion['riskLevel'],
          explanation: form.explanation || undefined,
        });
      } else {
        await questionsService.create({
          categoryId: form.categoryId,
          question: form.question,
          riskLevel: form.riskLevel,
          explanation: form.explanation || undefined,
        });
      }
      setEditorOpen(false);
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
      await questionsService.remove(toDelete.id);
      setToDelete(null);
      await load();
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : 'Delete failed.');
    } finally {
      setDeleting(false);
    }
  };

  const columns: Column<ChallengeQuestion>[] = [
    {
      header: 'Question',
      cell: (q) => (
        <div>
          <p className="text-sm text-sand">{q.question}</p>
          {q.explanation && <p className="mt-0.5 text-xs text-sand-dim">{q.explanation}</p>}
        </div>
      ),
    },
    { header: 'Category', cell: (q) => <Badge>{q.category?.name ?? 'â€”'}</Badge> },
    {
      header: 'Risk',
      cell: (q) => (
        <Badge
          className={cn(
            q.riskLevel === 'CRITICAL' && 'border-red-500/50 bg-red-500/10 text-red-400',
            q.riskLevel === 'HIGH' && 'border-brand-600/50 bg-brand-950/60 text-brand-400',
            q.riskLevel === 'MEDIUM' && 'border-amber-500/40 bg-amber-500/10 text-amber-300',
          )}
        >
          {q.riskLevel}
        </Badge>
      ),
    },
    { header: 'Order', cell: (q) => <span>{q.order}</span> },
    {
      header: '',
      cell: (q) => (
        <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          <button className="btn-ghost !px-2.5 !py-1 !text-[10px]" onClick={() => openEdit(q)}>
            Edit
          </button>
          <button
            className="rounded p-1.5 text-sand-dim hover:text-brand-400"
            aria-label="Delete question"
            onClick={() => setToDelete(q)}
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
        title="Questions"
        description="Manage the challenge question bank used by the trial engine."
        actions={
          <Button onClick={openCreate} disabled={categories.length === 0}>
            <Plus className="h-4 w-4" /> New Question
          </Button>
        }
      />

      {categories.length === 0 && !loading && (
        <p className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          Create a category first â€” questions belong to categories.
        </p>
      )}
      {error && <ErrorMessage message={error} />}

      {loading ? (
        <p className="py-16 text-center text-xs uppercase tracking-[0.3em] text-sand-dim">
          Loading questionsâ€¦
        </p>
      ) : (
        <>
          <DataTable
            columns={columns}
            rows={questions}
            rowKey={(q) => q.id}
            empty="No questions yet."
          />
          <Pagination meta={meta} onPageChange={setPage} />
        </>
      )}

      <Modal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        title={editing ? 'Edit Question' : 'New Question'}
      >
        <div className="space-y-4">
          <Select
            label="Category"
            value={form.categoryId}
            onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          <Textarea
            label="Question"
            value={form.question}
            onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
            placeholder="Ask a challenging question (min. 10 characters)â€¦"
          />
          <Select
            label="Risk Level"
            value={form.riskLevel}
            onChange={(e) => setForm((f) => ({ ...f, riskLevel: e.target.value }))}
          >
            {RISK_LEVEL_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>
          <Input
            label="Explanation (why this question matters)"
            value={form.explanation}
            onChange={(e) => setForm((f) => ({ ...f, explanation: e.target.value }))}
          />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setEditorOpen(false)}>
              Cancel
            </Button>
            <Button loading={saving} onClick={() => void save()}>
              {editing ? 'Save Changes' : 'Create Question'}
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete question"
        message="This question will be permanently removed from the bank."
        busy={deleting}
        onConfirm={() => void remove()}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}

