import { useEffect, useState } from 'react';
import { PageHeading, ErrorMessage } from '../../components/common/PageHeading';
import { StatCard } from '../../components/dashboard/StatCard';
import { ModesBar, SignupsLine, VerdictPie } from '../../components/analytics/Charts';
import { analyticsService } from '../../services/analytics';
import { AdminAnalytics } from '../../types/content';
import { AdminApiError } from '../../services/api';

export function AnalyticsPage() {
  const [data, setData] = useState<AdminAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setData(await analyticsService.overview());
      } catch (err) {
        setError(err instanceof AdminApiError ? err.message : 'Failed to load analytics.');
      }
    })();
  }, []);

  return (
    <div>
      <PageHeading
        title="Analytics"
        description="Aggregated platform analytics. Every number is calculated on the backend."
      />
      {error && <ErrorMessage message={error} />}
      {!data && !error && (
        <p className="py-20 text-center text-xs uppercase tracking-[0.3em] text-sand-dim">
          Crunching numbers…
        </p>
      )}

      {data && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
            <StatCard label="Total Users" value={data.totals.users} />
            <StatCard label="Total Trials" value={data.totals.trials} />
            <StatCard label="Active Trials" value={data.totals.activeTrials} />
            <StatCard label="Experiments" value={data.totals.experiments} />
            <StatCard label="Roadmaps" value={data.totals.roadmaps} />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
            <StatCard label="Questions" value={data.totals.questions} />
            <StatCard label="Categories" value={data.totals.categories} />
            <StatCard label="Risk Rules" value={data.totals.riskRules} />
            <StatCard label="Roadmap Templates" value={data.totals.roadmapTemplates} />
            <StatCard label="Notifications" value={data.totals.notifications} />
            <StatCard label="Avg Score" value={data.averageScore} accent />
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="panel p-5">
              <h2 className="admin-title mb-3 text-xs text-sand-light">Verdict Distribution</h2>
              <VerdictPie data={data.verdictDistribution} />
            </div>
            <div className="panel p-5">
              <h2 className="admin-title mb-3 text-xs text-sand-light">Signups (30 days)</h2>
              <SignupsLine data={data.signupsByDay} />
            </div>
          </div>

          <div className="panel mt-5 p-5">
            <h2 className="admin-title mb-3 text-xs text-sand-light">Trials by Mode</h2>
            <ModesBar data={data.trialsByMode} />
          </div>
        </>
      )}
    </div>
  );
}
