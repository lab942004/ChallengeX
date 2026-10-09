import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lightbulb, Save, Sparkles, Swords } from 'lucide-react';
import { ROUTES } from '../../constants';
import { useDocumentTitle } from '../../hooks';
import { PageHeader } from '../../components/common/PageHeader';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ideasService } from '../../services/ideas';
import { trialsService } from '../../services/trials';
import { ApiClientError } from '../../services/api';
import { GeneratedIdea } from '../../types/idea';

function parseList(value: string): string[] {
  return value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

export function GeneratePage() {
  useDocumentTitle('Generate an Idea');
  const navigate = useNavigate();

  const [interests, setInterests] = useState('');
  const [skills, setSkills] = useState('');
  const [problemArea, setProblemArea] = useState('');
  const [ideas, setIdeas] = useState<GeneratedIdea[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setError(null);
    setLoading(true);
    try {
      const { ideas: generated } = await ideasService.generate({
        interests: parseList(interests),
        skills: parseList(skills),
        problemArea: problemArea.trim(),
        count: 4,
      });
      setIdeas(generated);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Generation failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const challengeThis = async (idea: GeneratedIdea, index: number) => {
    setSavingId(index);
    try {
      const { idea: created } = await ideasService.create({
        title: idea.title,
        description: `${idea.problem} ${idea.solution}`,
      });
      const { trial } = await trialsService.create({ ideaId: created.id, mode: 'STRESS_TEST' });
      navigate(`${ROUTES.trial}/${trial.id}`);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Could not start the trial.');
      setSavingId(null);
    }
  };

  const saveIdea = async (idea: GeneratedIdea) => {
    try {
      await ideasService.create({
        title: idea.title,
        description: `${idea.problem} ${idea.solution}`,
      });
      setIdeas((prev) => prev.filter((i) => i.title !== idea.title));
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Could not save the idea.');
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="THE FORGE"
        title="Generate New Ideas"
        description="Describe your interests, skills, and the problem space. The backend AI service will forge 3–5 concepts."
      />

      <div className="card-realm space-y-4 p-6">
        {error && (
          <div className="rounded-lg border border-blood-600/50 bg-blood-950/60 px-4 py-3 text-sm text-blood-400">
            {error}
          </div>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Interests (comma separated)"
            placeholder="health, AI, education"
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
          />
          <Input
            label="Skills (comma separated)"
            placeholder="React, data analysis, writing"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
          />
        </div>
        <Input
          label="Problem Area"
          placeholder="e.g. appointment no-shows in small clinics"
          value={problemArea}
          onChange={(e) => setProblemArea(e.target.value)}
        />
        <Button
          onClick={() => void generate()}
          loading={loading}
          disabled={problemArea.trim().length < 3}
          className="w-full !py-3.5"
        >
          <Sparkles className="h-4 w-4" /> Generate Ideas
        </Button>
      </div>

      {ideas.length > 0 && (
        <div className="mt-8 grid gap-5">
          {ideas.map((idea, i) => (
            <motion.article
              key={idea.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="card-realm p-6"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-lg border border-blood-950 bg-blood-950/50">
                    <Lightbulb className="h-4 w-4 text-blood-500" />
                  </span>
                  <h3 className="title-cinzel text-sm text-parchment-light">{idea.title}</h3>
                </div>
                <span className="font-cinzel text-[10px] tracking-[0.24em] text-parchment-dim/50">
                  0{i + 1}
                </span>
              </div>

              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                {(
                  [
                    ['Problem', idea.problem],
                    ['Solution', idea.solution],
                    ['Target Users', idea.targetUsers],
                    ['Why Now', idea.whyNow],
                    ['Business Model', idea.businessModel],
                  ] as const
                ).map(([label, value]) => (
                  <div key={label} className="rounded-lg border border-blood-950 bg-obsidian/50 p-3">
                    <dt className="label-caps !mb-1">{label}</dt>
                    <dd className="text-xs leading-relaxed text-parchment-dim">{value}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Button onClick={() => void challengeThis(idea, i)} loading={savingId === i} className="flex-1">
                  <Swords className="h-4 w-4" /> Challenge This
                </Button>
                <Button variant="ghost" onClick={() => void saveIdea(idea)} className="flex-1">
                  <Save className="h-4 w-4" /> Save Idea
                </Button>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </div>
  );
}

