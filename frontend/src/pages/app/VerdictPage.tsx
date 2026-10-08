import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  FlaskConical,
  Lightbulb,
  ListChecks,
  Route as RouteIcon,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { ROUTES, VERDICT_DESCRIPTIONS } from '../../constants';
import { useDocumentTitle } from '../../hooks';
import { PageLoader } from '../../components/ui/ThemedLoader';
import { ErrorState } from '../../components/common/ErrorState';
import { PageHeader } from '../../components/common/PageHeader';
import { ScoreRing } from '../../components/verdict/ScoreRing';
import { VerdictRadar } from '../../components/verdict/VerdictRadar';
import { trialsService } from '../../services/trials';
import { ApiClientError } from '../../services/api';
import { VerdictPayload } from '../../types/verdict';
import { cn, riskClass, truncate } from '../../utils';

const PRIORITY_ORDER: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };

export function VerdictPage() {
  const { trialId = '' } = useParams();
  useDocumentTitle('Verdict');

  const [verdict, setVerdict] = useState<VerdictPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiClientError | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { verdict: data } = await trialsService.getVerdict(trialId);
        if (!cancelled) setVerdict(data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof ApiClientError
              ? err
              : new ApiClientError(0, 'UNKNOWN', 'Failed to load the verdict.'),
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [trialId]);

  if (loading) return <PageLoader message="FORGING YOUR VERDICT..." />;
  if (error) return <ErrorState kind={error.status === 404 ? '404' : 'network'} message={error.message} />;
  if (!verdict) return <ErrorState kind="500" />;

  const recommendations = [...verdict.recommendations].sort(
    (a, b) => (PRIORITY_ORDER[a.priority] ?? 3) - (PRIORITY_ORDER[b.priority] ?? 3),
  );

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="THE VERDICT IS SEALED"
        title={verdict.ideaTitle}
        description={verdict.summary}
        actions={
          <div className="flex flex-wrap gap-3">
            <Link to={`${ROUTES.roadmap}/${trialId}`} className="btn-primary !py-2.5 text-xs">
              <RouteIcon className="h-4 w-4" /> View Roadmap
            </Link>
            <Link to={ROUTES.history} className="btn-ghost !py-2.5 text-xs">
              History
            </Link>
          </div>
        }
      />

      {/* Score + radar */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-realm flex flex-col items-center justify-center gap-6 p-6 sm:flex-row sm:gap-10"
        >
          <ScoreRing score={verdict.score} verdict={verdict.verdict} />
          <div className="text-center sm:text-left">
            <p className="font-cinzel text-[11px] tracking-[0.3em] text-blood-500">
              MARKET READINESS SCORE
            </p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-parchment-dim">
              {VERDICT_DESCRIPTIONS[verdict.verdict]}
            </p>
            {verdict.completedAt && (
              <p className="mt-4 text-xs text-parchment-dim/60">
                Forged on {new Date(verdict.completedAt).toLocaleString()}
              </p>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-realm p-6"
        >
          <h2 className="title-cinzel mb-4 text-sm text-parchment-light">Score Breakdown</h2>
          <VerdictRadar data={verdict.breakdown} />
        </motion.div>
      </div>

      {/* Category bars */}
      <div className="card-realm mt-6 p-6">
        <h2 className="title-cinzel mb-4 text-sm text-parchment-light">Category Scores</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {verdict.breakdown.map((entry) => (
            <div key={entry.category}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-parchment">{entry.category}</span>
                <span className="font-semibold tabular-nums text-blood-400">{entry.score}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-obsidian">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-blood-800 to-blood-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${entry.score}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risks + Recommendations */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="card-realm p-6">
          <h2 className="title-cinzel mb-4 flex items-center gap-2 text-sm text-parchment-light">
            <ShieldAlert className="h-4 w-4 text-blood-500" /> Risk Analysis
          </h2>
          <div className="space-y-3">
            {verdict.risks.length === 0 && (
              <p className="text-sm text-parchment-dim">No significant risks were detected.</p>
            )}
            {verdict.risks.map((risk) => (
              <div key={risk.id} className="rounded-lg border border-blood-950 bg-obsidian/60 p-4">
                <div className="mb-1.5 flex items-start justify-between gap-3">
                  <span className="text-sm font-semibold text-parchment">{risk.title}</span>
                  <span
                    className={cn(
                      'shrink-0 rounded border px-2 py-0.5 text-[10px] font-bold tracking-wider',
                      riskClass(risk.severity),
                    )}
                  >
                    {risk.severity}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-parchment-dim">{risk.description}</p>
                <p className="mt-2 text-[11px] text-parchment-dim/60">
                  Evidence: {truncate(risk.evidence, 140)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="card-realm p-6">
          <h2 className="title-cinzel mb-4 flex items-center gap-2 text-sm text-parchment-light">
            <ListChecks className="h-4 w-4 text-blood-500" /> Recommendations
          </h2>
          <div className="space-y-3">
            {verdict.recommendations.length === 0 && (
              <p className="text-sm text-parchment-dim">No recommendations for this trial.</p>
            )}
            {recommendations.map((rec) => (
              <div key={rec.id} className="rounded-lg border border-blood-950 bg-obsidian/60 p-4">
                <div className="mb-1.5 flex items-start justify-between gap-3">
                  <span className="text-sm font-semibold text-parchment">{rec.title}</span>
                  <span
                    className={cn(
                      'shrink-0 rounded border px-2 py-0.5 text-[10px] font-bold tracking-wider',
                      rec.priority === 'HIGH'
                        ? 'border-blood-600/60 bg-blood-950 text-blood-400'
                        : 'border-blood-950 bg-obsidian text-parchment-dim',
                    )}
                  >
                    {rec.priority}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-parchment-dim">{rec.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Alternative directions */}
      <section className="card-realm mt-6 p-6">
        <h2 className="title-cinzel mb-4 flex items-center gap-2 text-sm text-parchment-light">
          <Sparkles className="h-4 w-4 text-blood-500" /> Alternative Directions
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {verdict.alternativeDirections.map((alt) => (
            <div
              key={alt.title}
              className="rounded-lg border border-blood-950 bg-obsidian/60 p-4 transition-colors hover:border-blood-800"
            >
              <h3 className="font-cinzel text-xs tracking-[0.14em] text-blood-400">
                {alt.title.toUpperCase()}
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-parchment-dim">{alt.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Validation experiment */}
      {verdict.experiment && (
        <section className="card-realm mt-6 p-6">
          <h2 className="title-cinzel mb-4 flex items-center gap-2 text-sm text-parchment-light">
            <FlaskConical className="h-4 w-4 text-blood-500" /> Validation Experiment
          </h2>
          <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            <div>
              <h3 className="text-sm font-semibold text-parchment">{verdict.experiment.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-parchment-dim">
                {verdict.experiment.description}
              </p>
              <ol className="mt-4 space-y-2">
                {verdict.experiment.steps.map((step, i) => (
                  <li key={step} className="flex gap-3 text-xs text-parchment-dim">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-blood-950 bg-obsidian text-[10px] font-bold text-blood-400">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
            <div className="space-y-3 rounded-lg border border-blood-950 bg-obsidian/60 p-4 text-xs">
              <div>
                <span className="label-caps !mb-1">Success Metric</span>
                <p className="text-parchment">{verdict.experiment.successMetric}</p>
              </div>
              <div>
                <span className="label-caps !mb-1">Estimated Cost</span>
                <p className="text-parchment">{verdict.experiment.estimatedCost}</p>
              </div>
              <div>
                <span className="label-caps !mb-1">Duration</span>
                <p className="text-parchment">{verdict.experiment.duration}</p>
              </div>
              <div>
                <span className="label-caps !mb-1">Status</span>
                <p className="text-blood-400">{verdict.experiment.status}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Assumptions */}
      <section className="card-realm mt-6 p-6">
        <h2 className="title-cinzel mb-4 flex items-center gap-2 text-sm text-parchment-light">
          <Lightbulb className="h-4 w-4 text-blood-500" /> Key Assumptions
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {verdict.assumptions.map((a) => (
            <div key={a.id} className="rounded-lg border border-blood-950 bg-obsidian/60 p-4">
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-parchment">{a.title}</span>
                <span className={cn('rounded border px-1.5 py-0.5 text-[10px] font-bold', riskClass(a.risk))}>
                  {a.risk}
                </span>
              </div>
              <p className="text-xs leading-relaxed text-parchment-dim">{a.description}</p>
              <p className="mt-2 text-[11px] text-parchment-dim/60">Validation: {a.validationMethod}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link to={`${ROUTES.roadmap}/${trialId}`} className="btn-primary">
          Build Your Roadmap <ArrowRight className="h-4 w-4" />
        </Link>
        <Link to={ROUTES.history} className="btn-ghost">
          Back to History
        </Link>
      </div>
    </div>
  );
}


