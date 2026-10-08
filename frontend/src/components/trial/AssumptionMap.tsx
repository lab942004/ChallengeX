import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, FlaskConical, Plus } from 'lucide-react';
import { Assumption } from '../../types/verdict';
import { riskClass, cn } from '../../utils';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';

interface AssumptionMapProps {
  assumptions: Assumption[];
  /** Local (unsaved) additions the user makes mid-trial. */
  onAdd?: (a: Omit<Assumption, 'id'>) => void;
  readOnly?: boolean;
}

/**
 * Assumption map — right-side panel on desktop, collapsible drawer on mobile.
 * Mid-trial assumptions are stored locally; after completion they come from
 * the backend analysis.
 */
export function AssumptionMap({ assumptions, onAdd, readOnly = false }: AssumptionMapProps) {
  const [open, setOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', risk: 'MEDIUM' });

  // Auto-open the panel on desktop when assumptions arrive.
  useEffect(() => {
    if (assumptions.length > 0 && window.innerWidth >= 1024) setOpen(true);
  }, [assumptions.length]);

  const submit = () => {
    if (!form.title.trim() || !onAdd) return;
    onAdd({
      title: form.title.trim(),
      description: form.description.trim() || '—',
      risk: form.risk,
      evidence: 'Added manually during trial',
      validationMethod: 'Define a test to prove or disprove this assumption.',
    });
    setForm({ title: '', description: '', risk: 'MEDIUM' });
    setShowForm(false);
  };

  const panel = (
    <div className="flex h-full flex-col gap-3 overflow-y-auto p-4">
      <div className="flex items-center justify-between">
        <h3 className="title-cinzel flex items-center gap-2 text-sm text-parchment-light">
          <FlaskConical className="h-4 w-4 text-blood-500" /> Assumption Map
        </h3>
        {!readOnly && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-1 rounded-md border border-blood-950 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-blood-400 hover:border-blood-800"
          >
            <Plus className="h-3 w-3" /> Add
          </button>
        )}
      </div>

      {showForm && !readOnly && (
        <div className="space-y-3 rounded-lg border border-blood-950 bg-obsidian/70 p-3">
          <Input
            label="Title"
            placeholder="e.g. Users will pay monthly"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
          <Textarea
            label="Description"
            placeholder="What must be true for the idea to work?"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="min-h-[70px]"
          />
          <div className="flex items-center gap-2">
            <select
              aria-label="Risk level"
              className="field-input !py-2"
              value={form.risk}
              onChange={(e) => setForm((f) => ({ ...f, risk: e.target.value }))}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
            <Button onClick={submit} className="!px-3 !py-2 text-[10px]">
              Save
            </Button>
          </div>
        </div>
      )}

      {assumptions.length === 0 && (
        <p className="text-xs leading-relaxed text-parchment-dim">
          No assumptions mapped yet. Add the beliefs your idea depends on — the analysis will
          sharpen as answers arrive.
        </p>
      )}

      <AnimatePresence initial={false}>
        {assumptions.map((a) => (
          <motion.div
            key={a.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-lg border border-blood-950 bg-obsidian/60 p-3"
          >
            <div className="mb-1 flex items-start justify-between gap-2">
              <span className="text-xs font-semibold text-parchment">{a.title}</span>
              <span
                className={cn(
                  'rounded border px-1.5 py-0.5 text-[9px] font-bold tracking-wider',
                  riskClass(a.risk),
                )}
              >
                {a.risk}
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-parchment-dim">{a.description}</p>
            <p className="mt-1.5 text-[10px] text-parchment-dim/60">
              Validation: {a.validationMethod}
            </p>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );

  return (
    <>
      {/* Desktop panel */}
      <aside className="hidden lg:block">
        <div className="sticky top-20 realm-surface max-h-[calc(100vh-6rem)] rounded-xl">
          {panel}
        </div>
      </aside>

      {/* Mobile drawer */}
      <div className="lg:hidden">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between rounded-lg border border-blood-950 bg-obsidian/70 px-4 py-3"
          aria-expanded={open}
        >
          <span className="title-cinzel text-xs text-parchment-light">
            Assumption Map ({assumptions.length})
          </span>
          <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} />
        </button>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="realm-surface mt-2 rounded-xl">{panel}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

