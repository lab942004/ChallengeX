import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { PageHeading, ErrorMessage } from '../../components/common/PageHeading';
import { Badge, Button } from '../../components/common/FormControls';
import { ideasService } from '../../services/ideas';
import { AdminApiError } from '../../services/api';
import { formatDate, verdictBadgeClass } from '../../utils';

export function IdeaDetailsPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [idea, setIdea] = useState<Awaited<ReturnType<typeof ideasService.get>>['idea'] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { idea: data } = await ideasService.get(id);
        setIdea(data);
      } catch (err) {
        setError(err instanceof AdminApiError ? err.message : 'Failed to load idea.');
      }
    })();
  }, [id]);

  if (error) return <ErrorMessage message={error} />;
  if (!idea) {
    return (
      <p className="py-20 text-center text-xs uppercase tracking-[0.3em] text-sand-dim">
        Loading idea…
      </p>
    );
  }

  return (
    <div>
      <PageHeading
        title={idea.title}
        description={`By ${idea.user.name} (${idea.user.email}) · ${formatDate(idea.createdAt)}`}
        actions={
          <Button variant="ghost" onClick={() => navigate('/admin/ideas')}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="panel p-5 lg:col-span-2">
          <h2 className="admin-title mb-3 text-xs text-sand-light">Description</h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-sand-dim">
            {idea.description}
          </p>
        </div>

        <div className="panel p-5">
          <h2 className="admin-title mb-3 text-xs text-sand-light">Meta</h2>
          <ul className="space-y-2 text-sm text-sand-dim">
            <li>Status: <Badge>{idea.status}</Badge></li>
            <li>Saves: {idea.savedBy?.length ?? 0}</li>
            <li>Trials: {idea.trials?.length ?? 0}</li>
          </ul>
        </div>
      </div>

      <div className="panel mt-5 p-5">
        <h2 className="admin-title mb-4 text-xs text-sand-light">Trials</h2>
        {idea.trials.length === 0 ? (
          <p className="text-sm text-sand-dim">This idea has not been put on trial yet.</p>
        ) : (
          <ul className="divide-y divide-white/5">
            {idea.trials.map((trial) => (
              <li
                key={trial.id}
                className="flex cursor-pointer items-center justify-between py-3 text-sm hover:bg-white/[0.02]"
                onClick={() => navigate(`/admin/trials/${trial.id}`)}
              >
                <span className="text-sand">{formatDate(trial.createdAt)}</span>
                <span className="flex items-center gap-3">
                  <Badge>{trial.mode}</Badge>
                  <span className="text-xs text-sand-dim">{trial.status}</span>
                  <span className={verdictBadgeClass(trial.verdict)}>
                    {trial.verdict ?? '—'}
                  </span>
                  {trial.score !== null && <span className="font-bold">{trial.score}</span>}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
