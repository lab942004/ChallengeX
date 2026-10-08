import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Swords } from 'lucide-react';
import { IDEAL_CHAR_LIMIT, ROUTES, TRIAL_MODES } from '../../constants';
import { useDocumentTitle } from '../../hooks';
import { PageHeader } from '../../components/common/PageHeader';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { ideasService } from '../../services/ideas';
import { trialsService } from '../../services/trials';
import { ApiClientError } from '../../services/api';
import { cn } from '../../utils';

/**
 * Idea creation flow:
 * 1. validate idea → 2. create Idea → 3. create Trial (backend generates
 * questions) → 4. navigate to /trial/:trialId
 */
export function IdeaPage() {
  useDocumentTitle('Forge an Idea');
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const [mode, setMode] = useState<(typeof TRIAL_MODES)[number]['value']>('STRESS_TEST');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const trimmed = text.trim();
  const valid = trimmed.length >= 10 && trimmed.length <= IDEAL_CHAR_LIMIT;

  const handleSubmit = async () => {
    if (!valid || loading) {
      setError('Describe your idea in 10–500 characters.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      // Derive a title from the first sentence/60 chars of the idea.
      const title = trimmed.split(/[.\n]/)[0].slice(0, 80).trim() || 'Untitled Idea';
      const { idea } = await ideasService.create({ title, description: trimmed });
      const { trial } = await trialsService.create({ ideaId: idea.id, mode });
      navigate(`${ROUTES.trial}/${trial.id}`);
    } catch (err) {
      setError(
        err instanceof ApiClientError ? err.message : 'The trial could not be forged. Try again.',
      );
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="THE FIRST TRIAL"
        title="Forge Your Idea"
        description="Describe your idea in full detail. The realm will generate challenges across seven categories and put it on trial."
      />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-realm p-6"
      >
        <Textarea
          label="Your Idea"
          placeholder="e.g. A marketplace that connects local farms directly with restaurants, cutting out distributors…"
          maxLength={IDEAL_CHAR_LIMIT}
          showCount
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, IDEAL_CHAR_LIMIT))}
          error={error ?? undefined}
          className="min-h-[180px]"
        />

        <p className="label-caps mt-6">Trial Mode</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {TRIAL_MODES.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMode(m.value)}
              className={cn(
                'rounded-lg border px-4 py-3 text-left transition-all',
                mode === m.value
                  ? 'border-blood-600 bg-blood-950/60 shadow-red-glow'
                  : 'border-blood-950 bg-obsidian/60 hover:border-blood-800',
              )}
            >
              <span
                className={cn(
                  'block font-cinzel text-xs tracking-[0.16em]',
                  mode === m.value ? 'text-blood-400' : 'text-parchment',
                )}
              >
                {m.label.toUpperCase()}
              </span>
              <span className="mt-1 block text-xs text-parchment-dim">{m.description}</span>
            </button>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-parchment-dim">
            {trimmed.length} / {IDEAL_CHAR_LIMIT} characters
          </p>
          <Button onClick={() => void handleSubmit()} loading={loading} disabled={!valid}>
            <Swords className="h-4 w-4" /> Forge Trial
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
