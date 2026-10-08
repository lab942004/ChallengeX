import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, BookOpen, Shield, Users } from 'lucide-react';
import { ADMIN_ROUTES } from '../../constants';
import { PageHeading, ErrorMessage } from '../../components/common/PageHeading';
import { StatCard } from '../../components/dashboard/StatCard';
import { ModesBar, SignupsLine, VerdictPie } from '../../components/analytics/Charts';
import { analyticsService } from '../../services/analytics';
import { AdminAnalytics } from '../../types/content';
import { AdminApiError } from '../../services/api';
import { formatDate, verdictBadgeClass } from '../../utils';
import { Badge } from '../../components/common/FormControls';

export function DashboardPage() {
  const [data, setData] = useState<AdminAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setData(await analyticsService.overview());
      } catch (err) {
        setError(err instanceof AdminApiError ? err.message : 'Failed to load dashboard.');
      }
    })();
  }, []);

  return (
    <div>
      <PageHeading
        title="Dashboard"
        description="Platform-wide health at a glance. All metrics are computed by the backend."
        actions={
          <Link to={ADMIN_ROUTES.analytics} className="btn-ghost">
            <Activity className="h-3.5 w-3.5" /> Full Analytics
          </Link>
        }
      />

      {error && <ErrorMessage message={error} />}

      {!data && !error && (
        <p className="py-20 text-center text-xs uppercase tracking-[0.3em] text-sand-dim">
          Loading metrics…
        </p>
      )}

      {data && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
            <StatCard label="Users" value={data.totals.users} icon={<Users className="h-4 w-4 text-sand-dim" />} />
            <StatCard label="Ideas" value={data.totals.ideas} icon={<BookOpen className="h-4 w-4 text-sand-dim" />} />
            <StatCard label="Trials" value={data.totals.trials} icon={<Shield className="h-4 w-4 text-sand-dim" />} />
            <StatCard label="Completed" value={data.totals.completedTrials} accent icon={<Activity className="h-4 w-4 text-brand-400" />} />
            <StatCard label="Avg Score" value={data.averageScore} hint="/100" />
            <StatCard label="Admins" value={data.totals.admins} />
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-3">
            <div className="panel p-5">
              <h2 className="admin-title mb-3 text-xs text-sand-light">Verdict Distribution</h2>
              <VerdictPie data={data.verdictDistribution} />
            </div>
            <div className="panel p-5">
              <h2 className="admin-title mb-3 text-xs text-sand-light">Signups (30 days)</h2>
              <SignupsLine data={data.signupsByDay} />
            </div>
            <div className="panel p-5">
              <h2 className="admin-title mb-3 text-xs text-sand-light">Trials by Mode</h2>
              <ModesBar data={data.trialsByMode} />
            </div>
          </div>

          <div className="panel mt-5 overflow-x-auto">
            <table className="w-full min-w-[520px]">
              <thead className="border-b border-white/5">
                <tr>
                  <th className="th">User</th>
                  <th className="th">Role</th>
                  <th className="th">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.recentUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.02]">
                    <td className="td">
                      <span className="font-semibold text-sand">{u.name}</span>
                      <span className="ml-2 text-xs text-sand-dim">{u.email}</span>
                    </td>
                    <td className="td">
                      <Badge
                        className={
                          u.role === 'USER'
                            ? 'border-white/10 bg-ink-800 text-sand-dim'
                            : 'border-brand-600/60 bg-brand-950/60 text-brand-400'
                        }
                      >
                        {u.role}
                      </Badge>
                    </td>
                    <td className="td text-sand-dim">{formatDate(u.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
