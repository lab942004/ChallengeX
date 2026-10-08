import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Mail, Shield, User as UserIcon } from 'lucide-react';
import { PageHeading, ErrorMessage } from '../../components/common/PageHeading';
import { Badge, Button, Input, Select } from '../../components/common/FormControls';
import { usersService } from '../../services/users';
import { AdminUser } from '../../types/admin';
import { AdminApiError } from '../../services/api';
import { formatDate, roleBadgeClass } from '../../utils';

type Detail = AdminUser & {
  ideas?: { id: string; title: string; createdAt: string }[];
  trials?: { id: string; status: string; verdict: string | null; score: number | null; createdAt: string }[];
};

export function UserDetailsPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<Detail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('USER');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { user: data } = await usersService.get(id);
        setUser(data);
        setName(data.name);
        setRole(data.role);
      } catch (err) {
        setError(err instanceof AdminApiError ? err.message : 'Failed to load user.');
      }
    })();
  }, [id]);

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const { user: updated } = await usersService.update(id, {
        name,
        role: role as AdminUser['role'],
      });
      setUser((prev) => (prev ? { ...prev, ...updated } : prev));
      setMessage('User updated.');
    } catch (err) {
      setMessage(err instanceof AdminApiError ? err.message : 'Update failed.');
    } finally {
      setSaving(false);
    }
  };

  if (error) {
    return (
      <div>
        <ErrorMessage message={error} />
        <Button variant="ghost" onClick={() => navigate('/admin/users')}>
          <ArrowLeft className="h-4 w-4" /> Back to users
        </Button>
      </div>
    );
  }

  if (!user) {
    return (
      <p className="py-20 text-center text-xs uppercase tracking-[0.3em] text-sand-dim">
        Loading user…
      </p>
    );
  }

  return (
    <div>
      <PageHeading
        title={user.name}
        description={`@${user.username} · joined ${formatDate(user.createdAt)}`}
        actions={
          <Button variant="ghost" onClick={() => navigate('/admin/users')}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        }
      />

      {message && <p className="mb-4 text-sm text-brand-400">{message}</p>}

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="panel p-5">
          <div className="mb-4 flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-brand-950 text-sm font-bold text-brand-400">
              <UserIcon className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold text-sand">{user.name}</p>
              <Badge className={roleBadgeClass(user.role)}>{user.role}</Badge>
            </div>
          </div>
          <ul className="space-y-2 text-sm text-sand-dim">
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4" /> {user.email}
            </li>
            <li className="flex items-center gap-2">
              <Shield className="h-4 w-4" /> {user.role}
            </li>
          </ul>

          <div className="mt-6 space-y-4">
            <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <Select label="Role" value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
              <option value="SUPER_ADMIN">SUPER_ADMIN</option>
            </Select>
            <Button loading={saving} onClick={() => void save()} className="w-full">
              Save Changes
            </Button>
          </div>
        </div>

        <div className="panel p-5 lg:col-span-2">
          <h2 className="admin-title mb-4 text-xs text-sand-light">
            Ideas ({user.ideas?.length ?? 0})
          </h2>
          {(user.ideas?.length ?? 0) === 0 ? (
            <p className="text-sm text-sand-dim">No ideas yet.</p>
          ) : (
            <ul className="divide-y divide-white/5">
              {user.ideas!.map((idea) => (
                <li key={idea.id} className="py-2.5 text-sm">
                  <span className="text-sand">{idea.title}</span>
                  <span className="ml-2 text-xs text-sand-dim">{formatDate(idea.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}

          <h2 className="admin-title mb-4 mt-6 text-xs text-sand-light">
            Trials ({user.trials?.length ?? 0})
          </h2>
          {(user.trials?.length ?? 0) === 0 ? (
            <p className="text-sm text-sand-dim">No trials yet.</p>
          ) : (
            <ul className="divide-y divide-white/5">
              {user.trials!.map((trial) => (
                <li key={trial.id} className="flex items-center justify-between py-2.5 text-sm">
                  <span className="text-sand">{formatDate(trial.createdAt)}</span>
                  <span className="flex items-center gap-2">
                    <span className="text-xs text-sand-dim">{trial.status}</span>
                    {trial.verdict && (
                      <Badge className="border-brand-600/50 bg-brand-950/50 text-brand-400">
                        {trial.verdict}
                      </Badge>
                    )}
                    {trial.score !== null && <span className="text-xs">{trial.score}</span>}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

