import { useCallback, useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { PageHeading, ErrorMessage } from '../../components/common/PageHeading';
import { Button, Input } from '../../components/common/FormControls';
import { settingsService } from '../../services/settings';
import { SettingRecord } from '../../types/content';
import { AdminApiError } from '../../services/api';

/** SUPER_ADMIN only — global system settings (key/value store). */
function displayValue(setting: SettingRecord): string {
  if (typeof setting.value === 'boolean') return setting.value ? 'true' : 'false';
  if (setting.value === null || setting.value === undefined) return '';
  if (typeof setting.value === 'object') return JSON.stringify(setting.value);
  return String(setting.value);
}

export function SettingsPage() {
  const [settings, setSettings] = useState<SettingRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { settings: data } = await settingsService.getAll();
      setSettings(data);
    } catch (err) {
      setError(err instanceof AdminApiError ? err.message : 'Failed to load settings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async (setting: SettingRecord, raw: string) => {
    setSavingKey(setting.key);
    setMessage(null);
    try {
      let value: unknown = raw;
      if (raw === 'true') value = true;
      else if (raw === 'false') value = false;
      else if (!Number.isNaN(Number(raw)) && raw.trim() !== '') value = Number(raw);
      else {
        try {
          value = JSON.parse(raw);
        } catch {
          value = raw;
        }
      }
      await settingsService.set(setting.key, value);
      setMessage(`Saved "${setting.key}".`);
      await load();
    } catch (err) {
      setMessage(err instanceof AdminApiError ? err.message : 'Save failed.');
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div>
      <PageHeading
        title="Settings"
        description="SUPER_ADMIN only — global configuration for the whole platform."
      />

      {message && <p className="mb-4 text-sm text-brand-400">{message}</p>}
      {error && <ErrorMessage message={error} />}

      {loading ? (
        <p className="py-16 text-center text-xs uppercase tracking-[0.3em] text-sand-dim">
          Loading settings…
        </p>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {settings.map((setting) => (
            <SettingRow
              key={setting.key}
              setting={setting}
              busy={savingKey === setting.key}
              onSave={(raw) => void save(setting, raw)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SettingRow({
  setting,
  busy,
  onSave,
}: {
  setting: SettingRecord;
  busy: boolean;
  onSave: (raw: string) => void;
}) {
  const [value, setValue] = useState(displayValue(setting));

  useEffect(() => {
    setValue(displayValue(setting));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setting]);

  return (
    <div className="panel p-5">
      <label className="admin-label">{setting.key}</label>
      <div className="flex gap-2">
        <input
          className="admin-input"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-label={setting.key}
        />
        <Button loading={busy} onClick={() => onSave(value)} className="shrink-0">
          <Save className="h-3.5 w-3.5" /> Save
        </Button>
      </div>
      <p className="mt-1.5 text-[11px] text-sand-dim/60">
        Updated {new Date(setting.updatedAt).toLocaleString()}
      </p>
    </div>
  );
}
