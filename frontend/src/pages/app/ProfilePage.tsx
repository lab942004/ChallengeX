import { useEffect, useState } from 'react';
import { LogOut, Lock, Save, ShieldCheck, User as UserIcon } from 'lucide-react';
import { useDocumentTitle } from '../../hooks';
import { useAuth } from '../../context/AuthContext';
import { PageHeader } from '../../components/common/PageHeader';
import { PageLoader } from '../../components/ui/ThemedLoader';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { profileService, ProfileStats } from '../../services/profile';
import { ApiClientError } from '../../services/api';
import { formatDate } from '../../utils';

export function ProfilePage() {
  useDocumentTitle('Profile');
  const { user, logout, refresh } = useAuth();

  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [form, setForm] = useState({ name: '', username: '', avatar: '' });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [pwMsg, setPwMsg] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await profileService.get();
        if (cancelled) return;
        setStats(data.stats);
        setForm({
          name: data.user.name,
          username: data.user.username,
          avatar: data.user.avatar ?? '',
        });
      } catch {
        /* profile stats are non-critical */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const saveProfile = async () => {
    setProfileMsg(null);
    setSavingProfile(true);
    try {
      await profileService.update({
        name: form.name,
        username: form.username,
        avatar: form.avatar || null,
      });
      await refresh();
      setProfileMsg('Profile updated.');
    } catch (err) {
      setProfileMsg(err instanceof ApiClientError ? err.message : 'Update failed.');
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async () => {
    setPwMsg(null);
    setSavingPw(true);
    try {
      const result = await profileService.changePassword(pw);
      setPwMsg(result.message);
      setPw({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (err) {
      setPwMsg(err instanceof ApiClientError ? err.message : 'Password change failed.');
    } finally {
      setSavingPw(false);
    }
  };

  if (!user) return <PageLoader />;

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="YOUR IDENTITY"
        title="Profile"
        description="Manage your identity, security, and review your saga statistics."
        actions={
          <Button variant="danger" onClick={() => void logout()}>
            <LogOut className="h-4 w-4" /> Logout
          </Button>
        }
      />

      {/* Stats */}
      {stats && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {(
            [
              ['Ideas', stats.ideas],
              ['Trials', stats.trials],
              ['Builds', stats.builds],
              ['Pivots', stats.pivots],
              ['Kills', stats.kills],
            ] as const
          ).map(([label, value]) => (
            <div key={label} className="card-realm p-4 text-center">
              <p className="font-cinzel text-2xl font-bold text-parchment-light">{value}</p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-parchment-dim">
                {label}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Identity */}
        <section className="card-realm p-6">
          <h2 className="title-cinzel mb-4 flex items-center gap-2 text-sm text-parchment-light">
            <UserIcon className="h-4 w-4 text-blood-500" /> Edit Profile
          </h2>
          {profileMsg && <p className="mb-3 text-xs text-blood-400">{profileMsg}</p>}
          <div className="space-y-4">
            <Input
              label="Full Name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
            <Input
              label="Username"
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
            />
            <Input
              label="Avatar URL"
              value={form.avatar}
              placeholder="https://…"
              onChange={(e) => setForm((f) => ({ ...f, avatar: e.target.value }))}
            />
            <Input label="Email" value={user.email} readOnly hint="Email cannot be changed." />
            <p className="text-xs text-parchment-dim">Member since {formatDate(user.createdAt)}</p>
            <Button onClick={() => void saveProfile()} loading={savingProfile} className="w-full">
              <Save className="h-4 w-4" /> Save Profile
            </Button>
          </div>
        </section>

        {/* Password */}
        <section className="card-realm p-6">
          <h2 className="title-cinzel mb-4 flex items-center gap-2 text-sm text-parchment-light">
            <Lock className="h-4 w-4 text-blood-500" /> Change Password
          </h2>
          {pwMsg && <p className="mb-3 text-xs text-blood-400">{pwMsg}</p>}
          <div className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              autoComplete="current-password"
              value={pw.currentPassword}
              onChange={(e) => setPw((p) => ({ ...p, currentPassword: e.target.value }))}
            />
            <Input
              label="New Password"
              type="password"
              autoComplete="new-password"
              value={pw.newPassword}
              onChange={(e) => setPw((p) => ({ ...p, newPassword: e.target.value }))}
            />
            <Input
              label="Confirm New Password"
              type="password"
              autoComplete="new-password"
              value={pw.confirmNewPassword}
              onChange={(e) => setPw((p) => ({ ...p, confirmNewPassword: e.target.value }))}
            />
            <Button
              onClick={() => void changePassword()}
              loading={savingPw}
              disabled={
                !pw.currentPassword ||
                pw.newPassword.length < 8 ||
                pw.newPassword !== pw.confirmNewPassword
              }
              className="w-full"
            >
              <ShieldCheck className="h-4 w-4" /> Update Password
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}

