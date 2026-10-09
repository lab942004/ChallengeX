import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookMarked, Swords } from 'lucide-react';
import { ROUTES } from '../../constants';
import { useDocumentTitle } from '../../hooks';
import { PageHeader } from '../../components/common/PageHeader';
import { EmptyState } from '../../components/common/EmptyState';
import { PageLoader } from '../../components/ui/ThemedLoader';
import { Button } from '../../components/ui/Button';
import { ideasService } from '../../services/ideas';
import { trialsService } from '../../services/trials';
import { ApiClientError } from '../../services/api';
import { Idea } from '../../types/idea';
import { formatDate, truncate } from '../../utils';

type SavedIdea = Idea & { savedAt: string };

/**
 * SavedIdeasPage — the "Saved Ideas" collection, backed by GET /ideas/saved.
 * Each idea can launch a trial (the backend resumes an active trial safely).
 */
export function SavedIdeasPage() {
  useDocumentTitle('Saved Ideas');
  const navigate = useNavigate();

  const [ideas, setIdeas] = useState<SavedIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startingId, setStartingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { ideas: data } = await ideasService.listSaved();
        if (!cancelled) setIdeas(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiClientError ? err.message : 'Could not load saved ideas.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const startTrial = async (idea: SavedIdea) => {
    if (startingId) return;
    setStartingId(idea.id);
    setError(null);
    try {
      const { trial } = await trialsService.create({ ideaId: idea.id, mode: 'STRESS_TEST' });
      navigate(`${ROUTES.trial}/${trial.id}`);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Could not start the trial.');
      setStartingId(null);
    }
  };

  if (loading) return <PageLoader message="OPENING THE VAULT..." />;

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        eyebrow="THE IDEA VAULT"
        title="Saved Ideas"
        description="Ideas you preserved for later — start a trial on any of them whenever you are ready."
        actions={
          <Link to={ROUTES.idea} className="btn-primary !py-2.5 text-xs">
            <Swords className="h-4 w-4" /> New Trial
          </Link>
        }
      />

      {error && ideas.length > 0 && (
        <div className="mb-4 rounded-lg border border-blood-600/50 bg-blood-950/60 px-4 py-3 text-sm text-blood-400">
          {error}
        </div>
      )}

      {error && ideas.length === 0 ? (
        <EmptyState title="VAULT UNAVAILABLE" message={error} />
      ) : ideas.length === 0 ? (
        <EmptyState
          icon={<BookMarked className="h-10 w-10" />}
          title="NO SAVED IDEAS YET"
          message="Generate ideas or forge one of your own, then save it to fill this vault."
          action={
            <Link to={ROUTES.generate} className="btn-primary">
              Generate Ideas
            </Link>
          }
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {ideas.map((idea, i) => (
            <motion.li
              key={idea.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.06, 0.4) }}
              className="card-realm flex h-full flex-col p-5"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-blood-950 bg-blood-950/50">
                  <BookMarked className="h-4 w-4 text-blood-500" />
                </span>
                <span className="text-[10px] uppercase tracking-wider text-parchment-dim/60">
                  Saved {formatDate(idea.savedAt)}
                </span>
              </div>
              <h3 className="title-cinzel text-sm text-parchment-light">{idea.title}</h3>
              <p className="mt-2 flex-1 text-xs leading-relaxed text-parchment-dim">
                {truncate(idea.description, 180)}
              </p>
              <div className="mt-4">
                <Button
                  onClick={() => void startTrial(idea)}
                  loading={startingId === idea.id}
                  disabled={startingId !== null && startingId !== idea.id}
                  className="w-full !py-2.5 !text-[11px]"
                >
                  <Swords className="h-3.5 w-3.5" /> Start Trial
                </Button>
              </div>
            </motion.li>
          ))}
        </ul>
      )}
    </div>
  );
}