import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, ListTodo, Package, Target, Timer } from 'lucide-react';
import { ROUTES } from '../../constants';
import { useDocumentTitle } from '../../hooks';
import { PageLoader } from '../../components/ui/ThemedLoader';
import { ErrorState } from '../../components/common/ErrorState';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/ui/Button';
import { roadmapService } from '../../services/roadmap';
import { ApiClientError } from '../../services/api';
import { Roadmap, RoadmapStep, StepStatus } from '../../types/roadmap';
import { cn } from '../../utils';

function StageCard({
  step,
  onUpdate,
  busy,
}: {
  step: RoadmapStep;
  onUpdate: (status: StepStatus) => void;
  busy: boolean;
}) {
  const done = step.status === 'COMPLETED';
  const tasks = (step.tasks ?? []) as string[];
  const deliverables = (step.deliverables ?? []) as string[];

  return (
    <motion.li
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      className={cn(
        'relative rounded-xl border p-5 transition-colors',
        done
          ? 'border-emerald-700/50 bg-emerald-950/20'
          : 'border-blood-950 bg-obsidian/60 hover:border-blood-800',
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              'grid h-9 w-9 shrink-0 place-items-center rounded-full border font-cinzel text-xs font-bold',
              done
                ? 'border-emerald-600 bg-emerald-900/40 text-emerald-300'
                : 'border-blood-950 bg-abyss text-blood-400',
            )}
          >
            {step.order}
          </span>
          <div>
            <h3 className="title-cinzel text-sm text-parchment-light">{step.title}</h3>
            <p className="text-[11px] uppercase tracking-[0.16em] text-parchment-dim/70">
              {step.status.replace('_', ' ')}
            </p>
          </div>
        </div>
        {step.estimatedEffort && (
          <span className="flex items-center gap-1 text-[11px] text-parchment-dim">
            <Timer className="h-3.5 w-3.5" /> {step.estimatedEffort}
          </span>
        )}
      </div>

      <p className="text-sm leading-relaxed text-parchment-dim">{step.description}</p>

      {step.objective && (
        <p className="mt-3 flex items-start gap-2 text-xs text-parchment">
          <Target className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blood-500" />
          <span>{step.objective}</span>
        </p>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <span className="label-caps !mb-1.5 flex items-center gap-1">
            <ListTodo className="h-3 w-3" /> Tasks
          </span>
          <ul className="space-y-1">
            {tasks.map((t) => (
              <li key={t} className="flex gap-2 text-xs text-parchment-dim">
                <span className="text-blood-600">•</span> {t}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <span className="label-caps !mb-1.5 flex items-center gap-1">
            <Package className="h-3 w-3" /> Deliverables
          </span>
          <ul className="space-y-1">
            {deliverables.map((d) => (
              <li key={d} className="flex gap-2 text-xs text-parchment-dim">
                <span className="text-blood-600">•</span> {d}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4">
        {done ? (
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-300">
            <CheckCircle2 className="h-4 w-4" /> Stage Complete
          </span>
        ) : (
          <Button
            variant="ghost"
            className="!py-2 text-[11px]"
            loading={busy}
            onClick={() => onUpdate('COMPLETED')}
          >
            <Circle className="h-3.5 w-3.5" /> Mark Complete
          </Button>
        )}
      </div>
    </motion.li>
  );
}

export function RoadmapPage() {
  const { trialId = '' } = useParams();
  useDocumentTitle('Roadmap');

  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiClientError | null>(null);
  const [busyStep, setBusyStep] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const { roadmap: data } = await roadmapService.getForTrial(trialId);
      setRoadmap(data);
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err
          : new ApiClientError(0, 'UNKNOWN', 'Failed to load the roadmap.'),
      );
    } finally {
      setLoading(false);
    }
  }, [trialId]);

  useEffect(() => {
    void load();
  }, [load]);

  const updateStep = async (stepId: string, status: StepStatus) => {
    if (!roadmap) return;
    setBusyStep(stepId);
    try {
      const { roadmap: updated } = await roadmapService.updateStep(roadmap.id, stepId, status);
      setRoadmap(updated);
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? err
          : new ApiClientError(0, 'UNKNOWN', 'Could not update the stage.'),
      );
    } finally {
      setBusyStep(null);
    }
  };

  if (loading) return <PageLoader message="BUILDING YOUR ROADMAP..." />;
  if (error) {
    return <ErrorState kind={error.status === 404 ? '404' : 'network'} message={error.message} />;
  }

  if (!roadmap) {
    return (
      <ErrorState
        kind="404"
        title="NO ROADMAP FORGED YET"
        message="Complete the trial first — the roadmap is generated from your verdict."
        action={
          <Link to={`${ROUTES.verdict}/${trialId}`} className="btn-primary">
            Go to Verdict
          </Link>
        }
      />
    );
  }

  const completed = roadmap.steps.filter((s) => s.status === 'COMPLETED').length;
  const progress = Math.round((completed / Math.max(roadmap.steps.length, 1)) * 100);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="FROM VERDICT TO LAUNCH"
        title={roadmap.title}
        description={`${completed} of ${roadmap.steps.length} stages complete — progress persists in the database.`}
        actions={
          <Link to={`${ROUTES.verdict}/${trialId}`} className="btn-ghost !py-2.5 text-xs">
            Back to Verdict
          </Link>
        }
      />

      <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-obsidian">
        <motion.div
          className="h-full bg-gradient-to-r from-blood-800 to-blood-500"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <ol className="grid gap-4">
        {roadmap.steps.map((step) => (
          <StageCard
            key={step.id}
            step={step}
            busy={busyStep === step.id}
            onUpdate={(status) => void updateStep(step.id, status)}
          />
        ))}
      </ol>

      {completed === roadmap.steps.length && (
        <div className="card-realm mt-6 p-6 text-center">
          <CheckCircle2 className="mx-auto mb-3 h-8 w-8 text-emerald-400" />
          <h3 className="title-cinzel text-sm text-parchment-light">Roadmap Completed</h3>
          <p className="mt-1 text-sm text-parchment-dim">Every stage has been conquered.</p>
        </div>
      )}
    </div>
  );
}

