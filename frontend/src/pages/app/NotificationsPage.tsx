import { useCallback, useEffect, useState } from 'react';
import { Bell, CheckCheck, MailOpen } from 'lucide-react';
import { useDocumentTitle } from '../../hooks';
import { useNotifications } from '../../context/NotificationContext';
import { PageHeader } from '../../components/common/PageHeader';
import { EmptyState } from '../../components/common/EmptyState';
import { PageLoader } from '../../components/ui/ThemedLoader';
import { Button } from '../../components/ui/Button';
import { notificationsService } from '../../services/notifications';
import { ApiClientError } from '../../services/api';
import { AppNotification } from '../../types/notification';
import { cn, timeAgo } from '../../utils';

const TYPE_LABELS: Record<string, string> = {
  TRIAL_COMPLETED: 'Trial',
  VERDICT_GENERATED: 'Verdict',
  ROADMAP_COMPLETED: 'Roadmap',
  EXPERIMENT_CREATED: 'Experiment',
  SAVED_IDEA: 'Saved',
  SYSTEM: 'System',
};

export function NotificationsPage() {
  useDocumentTitle('Notifications');
  const { refreshCount } = useNotifications();

  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { notifications } = await notificationsService.list({ limit: 50 });
      setItems(notifications);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Could not load notifications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const markRead = async (id: string) => {
    try {
      await notificationsService.markRead(id);
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      await refreshCount();
    } catch {
      /* non-critical */
    }
  };

  const markAll = async () => {
    try {
      await notificationsService.markAllRead();
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      await refreshCount();
    } catch {
      /* non-critical */
    }
  };

  if (loading) return <PageLoader message="SUMMONING MESSAGERS..." />;
  if (error) return <EmptyState title="MESSAGES UNAVAILABLE" message={error} />;

  const unread = items.filter((n) => !n.read).length;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        eyebrow="REALM MESSENGERS"
        title="Notifications"
        description={`${unread} unread message${unread === 1 ? '' : 's'}.`}
        actions={
          unread > 0 ? (
            <Button variant="ghost" onClick={() => void markAll()}>
              <CheckCheck className="h-4 w-4" /> Mark all read
            </Button>
          ) : undefined
        }
      />

      {items.length === 0 ? (
        <EmptyState
          icon={<Bell className="h-10 w-10" />}
          title="THE RAVENS HAVE NOT ARRIVED"
          message="Complete trials, forge verdicts, and progress roadmaps to receive notifications."
        />
      ) : (
        <ul className="space-y-3">
          {items.map((n) => (
            <li
              key={n.id}
              className={cn(
                'card-realm flex items-start gap-4 p-4',
                !n.read && 'border-blood-800/60',
              )}
            >
              <span
                className={cn(
                  'mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-lg border text-[10px] font-bold uppercase',
                  n.read
                    ? 'border-blood-950 bg-obsidian text-parchment-dim'
                    : 'border-blood-800 bg-blood-950/70 text-blood-400',
                )}
              >
                {TYPE_LABELS[n.type]?.slice(0, 4) ?? 'SYS'}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3
                    className={cn(
                      'text-sm',
                      n.read ? 'font-medium text-parchment-dim' : 'font-semibold text-parchment',
                    )}
                  >
                    {n.title}
                  </h3>
                  <span className="text-[11px] text-parchment-dim/70">{timeAgo(n.createdAt)}</span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-parchment-dim">{n.message}</p>
              </div>

              {!n.read && (
                <button
                  onClick={() => void markRead(n.id)}
                  className="shrink-0 rounded-md p-1.5 text-parchment-dim transition-colors hover:bg-obsidian hover:text-blood-400"
                  aria-label="Mark as read"
                >
                  <MailOpen className="h-4 w-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
