import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageHeading, ErrorMessage } from '../../components/common/PageHeading';
import { Badge, Button } from '../../components/common/FormControls';
import { trialsService } from '../../services/trials';
import { AdminApiError } from '../../services/api';
import { formatDate, verdictBadgeClass } from '../../utils';

type Detail = Awaited<ReturnType<typeof trialsService.get>>['trial'];

export function TrialDetailsPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [trial, setTrial] = useState<Detail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { trial: data } = await trialsService.get(id);
        setTrial(data);
      } catch (err) {
        setError(err instanceof AdminApiError ? err.message : 'Failed to load trial.');
      }
    })();
  }, [id]);

  if (error) return <ErrorMessage message={error} />;
  if (!trial) {
    return (
      <p className="py-20 text-center text-xs uppercase tracking-[0.3em] text-sand-dim">
        Loading trial…
      </p>
    );
  }

  return (
    <div>
      <PageHeading
        title={trial.idea.title}
        description={`${trial.user.name} · ${trial.user.email} · started ${formatDate(trial.createdAt)}`}
        actions={
          <Button variant="ghost" onClick={() => navigate('/admin/trials')}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        }
      />

      <div className="mb-5 flex flex-wrap gap-3">
        <Badge>{trial.mode.replace('_', ' ')}</Badge>
        <Badge>{trial.status}</Badge>
        {trial.verdict && <Badge className={verdictBadgeClass(trial.verdict)}>{trial.verdict}</Badge>}
        <Badge className="border-brand-600/60 bg-brand-950/60 text-brand-400">
          Score {trial.score ?? '—'}
        </Badge>
        {trial.completedAt && (
          <span className="self-center text-xs text-sand-dim">
            Completed {formatDate(trial.completedAt)}
          </span>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="panel p-5">
          <h2 className="admin-title mb-4 text-xs text-sand-light">
            Questions & Answers ({trial.questions.length})
          </h2>
          <ol className="space-y-4">
            {trial.questions.map((q) => (
              <li key={q.id} className="border-l-2 border-brand-950 pl-3">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <Badge>{q.category}</Badge>
                  <Badge>{q.riskLevel}</Badge>
                </div>
                <p className="text-sm font-medium text-sand">{q.question}</p>
                <p className="mt-1 text-xs text-sand-dim">
                  Answer: {q.answers[0]?.answer ?? '—'}
                </p>
              </li>
            ))}
          </ol>
        </div>

        <div className="space-y-5">
          <div className="panel p-5">
            <h2 className="admin-title mb-3 text-xs text-sand-light">Analysis</h2>
            <ul className="space-y-2 text-sm text-sand-dim">
              <li>Assumptions: {trial.assumptions.length}</li>
              <li>Risks: {trial.risks.length}</li>
              <li>Recommendations: {trial.recommendations.length}</li>
              <li>Experiment: {trial.experiment?.title ?? '—'}</li>
            </ul>
          </div>

          <div className="panel p-5">
            <h2 className="admin-title mb-3 text-xs text-sand-light">Roadmap</h2>
            {trial.roadmap ? (
              <ul className="space-y-2 text-sm">
                {trial.roadmap.steps.map((step) => (
                  <li key={step.title} className="flex items-center justify-between">
                    <span className="text-sand">{step.title}</span>
                    <Badge
                      className={
                        step.status === 'COMPLETED'
                          ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                          : 'border-white/10 bg-ink-800 text-sand-dim'
                      }
                    >
                      {step.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-sand-dim">No roadmap generated.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
