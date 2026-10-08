import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle2, Save, ShieldAlert } from 'lucide-react';
import { ROUTES } from '../../constants';
import { useDocumentTitle } from '../../hooks';
import { PageLoader } from '../../components/ui/ThemedLoader';
import { ErrorState } from '../../components/common/ErrorState';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Textarea';
import { AssumptionMap } from '../../components/trial/AssumptionMap';
import { trialsService } from '../../services/trials';
import { ApiClientError } from '../../services/api';
import { Assumption } from '../../types/verdict';
import { cn, riskClass } from '../../utils';

export function TrialPage() {
  const { trialId = '' } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiClientError | null>(null);
  const [trial, setTrial] = useState<Awaited<ReturnType<typeof trialsService.get>>['trial'] | null>(null);
  const [index, setIndex] = useState(0);
  const [draft, setDraft] = useState('');
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [completing, setCompleting] = useState(false);
  const [localAssumptions, setLocalAssumptions] = useState<Assumption[]>([]);
  const debounceRef = useRef<number | null>(null);

  useDocumentTitle('Trial');

  const load = useCallback(async () => {
    try {
      const { trial: data } = await trialsService.get(trialId);
      setTrial(data);
      const start = Math.min(
        Math.max(data.currentQuestion - 1, 0),
        Math.max(data.questions.length - 1, 0),
      );
      setIndex(start);
      const q = data.questions[start];
      setDraft(q?.answer ?? '');
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err
          : new ApiClientError(0, 'UNKNOWN', 'Failed to load the trial.'),
      );
    } finally {
      setLoading(false);
    }
  }, [trialId]);

  useEffect(() => {
    void load();
  }, [load]);

  const questions = trial?.questions ?? [];
  const current = questions[index];
  const answeredCount = questions.filter((q) => q.answer && q.answer.trim()).length;
  const allAnswered = questions.length > 0 && answeredCount === questions.length;

  const persist = useCallback(
    async (questionId: string, value: string) => {
      if (!value.trim()) return;
      setSaveState('saving');
      try {
        await trialsService.saveAnswer(trialId, { questionId, answer: value });
        setSaveState('saved');
        // Reflect the saved answer locally so refresh/resume shows it.
        setTrial((prev) =>
          prev
            ? {
                ...prev,
                questions: prev.questions.map((q) =>
                  q.id === questionId ? { ...q, answer: value } : q,
                ),
              }
            : prev,
        );
      } catch {
        setSaveState('idle');
      }
    },
    [trialId],
  );

  const onDraftChange = (value: string) => {
    setDraft(value);
    setSaveState('idle');
    if (!current) return;
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      void persist(current.id, value);
    }, 900);
  };

  const goNext = async () => {
    if (!current) return;
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    await persist(current.id, draft);
    if (index < questions.length - 1) {
      setIndex((i) => i + 1);
      setDraft(questions[index + 1]?.answer ?? '');
    }
  };

  const goPrev = () => {
    if (index > 0) {
      setIndex((i) => i - 1);
      setDraft(questions[index - 1]?.answer ?? '');
    }
  };

  const complete = async () => {
    if (!current || !allAnswered || completing) return;
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    await persist(current.id, draft);
    setCompleting(true);
    try {
      await trialsService.complete(trialId);
      navigate(`${ROUTES.verdict}/${trialId}`);
    } catch (err) {
      setError(
        err instanceof ApiClientError ? err : new ApiClientError(0, 'UNKNOWN', 'Completion failed.'),
      );
      setCompleting(false);
    }
  };

  const progress = useMemo(
    () => (questions.length ? Math.round((answeredCount / questions.length) * 100) : 0),
    [answeredCount, questions.length],
  );

  if (loading) return <PageLoader message="FORGING YOUR TRIAL..." />;
  if (error) return <ErrorState kind={error.status === 404 ? '404' : 'network'} message={error.message} />;
  if (!trial || !current) {
    return <ErrorState kind="404" message="This trial has no questions." />;
  }

  if (trial.status === 'COMPLETED') {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <div className="card-realm p-8 text-center">
          <CheckCircle2 className="mx-auto mb-4 h-10 w-10 text-blood-500" />
          <h2 className="title-cinzel text-lg text-parchment-light">Trial Completed</h2>
          <p className="mt-2 text-sm text-parchment-dim">The verdict has been forged.</p>
          <Button className="mt-6" onClick={() => navigate(`${ROUTES.verdict}/${trialId}`)}>
            View Verdict
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="min-w-0">
        {/* Header + progress */}
        <div className="mb-5">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className="font-cinzel text-[11px] tracking-[0.3em] text-blood-500">
              {trial.idea.title.toUpperCase()}
            </p>
            <p className="font-cinzel text-xs tracking-[0.2em] text-parchment-dim">
              QUESTION {index + 1} OF {questions.length}
            </p>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-obsidian">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-blood-800 to-blood-500"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[10px] text-parchment-dim">
            <span>{answeredCount} answered</span>
            <span className="flex items-center gap-1">
              {saveState === 'saving' && (
                <>
                  <Save className="h-3 w-3" /> SAVING…
                </>
              )}
              {saveState === 'saved' && (
                <>
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" /> SAVED
                </>
              )}
            </span>
          </div>
        </div>

        {/* Question card */}
        <motion.div
          key={current.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="card-realm p-5 sm:p-7"
        >
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="rounded-md border border-blood-950 bg-obsidian px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-parchment-dim">
              {current.category}
            </span>
            <span
              className={cn(
                'rounded-md border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em]',
                riskClass(current.riskLevel),
              )}
            >
              <ShieldAlert className="mr-1 inline h-3 w-3" />
              {current.riskLevel} RISK
            </span>
          </div>

          <h2 className="text-lg leading-relaxed text-parchment-light sm:text-xl">
            {current.question}
          </h2>

          {current.explanation && (
            <p className="mt-3 border-l-2 border-blood-950 pl-3 text-xs leading-relaxed text-parchment-dim">
              {current.explanation}
            </p>
          )}

          <div className="mt-6">
            <Textarea
              label="Your Answer"
              placeholder="Answer honestly — the quality of your verdict depends on it…"
              value={draft}
              onChange={(e) => onDraftChange(e.target.value)}
              className="min-h-[160px]"
            />
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button variant="ghost" onClick={goPrev} disabled={index === 0}>
              <ArrowLeft className="h-4 w-4" /> Previous
            </Button>

            {index < questions.length - 1 ? (
              <Button onClick={() => void goNext()}>
                Save & Next <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={() => void complete()}
                loading={completing}
                disabled={!allAnswered}
                title={allAnswered ? 'Complete the trial' : 'Answer every question first'}
              >
                <CheckCircle2 className="h-4 w-4" /> Complete Trial
              </Button>
            )}
          </div>

          {!allAnswered && index === questions.length - 1 && (
            <p className="mt-3 text-center text-xs text-parchment-dim">
              Answer every question to unlock trial completion.
            </p>
          )}
        </motion.div>

        {/* Question navigator */}
        <div className="mt-4 flex flex-wrap gap-2">
          {questions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => {
                setIndex(i);
                setDraft(q.answer ?? '');
              }}
              className={cn(
                'grid h-8 w-8 place-items-center rounded-md border text-[11px] font-bold transition-colors',
                i === index
                  ? 'border-blood-600 bg-blood-800 text-parchment-light'
                  : q.answer
                    ? 'border-emerald-700/60 bg-emerald-900/30 text-emerald-300'
                    : 'border-blood-950 bg-obsidian text-parchment-dim hover:border-blood-800',
              )}
              aria-label={`Go to question ${i + 1}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Assumption map — right panel (desktop) / drawer (mobile) */}
      <AssumptionMap
        assumptions={localAssumptions}
        onAdd={(a) =>
          setLocalAssumptions((prev) => [...prev, { ...a, id: `local-${Date.now()}-${prev.length}` }])
        }
      />
    </div>
  );
}

