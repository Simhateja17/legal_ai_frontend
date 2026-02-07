import { useHealth } from '../../hooks/useHealth';
import de from '../../i18n/de';

function StatusCard({ label, value, ok }: { label: string; value: string; ok: boolean | null }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <p className="text-sm text-gray-500">{label}</p>
      <div className="mt-2 flex items-center gap-2">
        <span
          className={`inline-block h-3 w-3 rounded-full ${
            ok === null ? 'bg-gray-400' : ok ? 'bg-green-500' : 'bg-red-500'
          }`}
        />
        <span className="text-lg font-semibold">{value}</span>
      </div>
    </div>
  );
}

export default function HealthPage() {
  const { data, loading, error, lastChecked, refresh } = useHealth();
  const t = de.health;

  return (
    <div className="mx-auto max-w-3xl p-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t.title}</h2>
        <button
          onClick={refresh}
          disabled={loading}
          className="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800 disabled:opacity-50 cursor-pointer"
        >
          {loading ? de.common.loading : 'Aktualisieren'}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">{t.error}</div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatusCard
          label={t.overall}
          value={data ? (data.status === 'ok' ? t.ok : t.degraded) : t.unknown}
          ok={data ? data.status === 'ok' : null}
        />
        <StatusCard
          label={t.database}
          value={data ? (data.database === 'connected' ? t.connected : t.disconnected) : t.unknown}
          ok={data ? data.database === 'connected' : null}
        />
        <StatusCard
          label={t.llmProvider}
          value={data?.llm_provider?.toUpperCase() ?? t.unknown}
          ok={data ? true : null}
        />
      </div>

      <div className="mt-6 text-xs text-gray-400">
        {lastChecked && (
          <p>
            {t.lastCheck}: {lastChecked.toLocaleTimeString('de-DE')}
          </p>
        )}
        <p className="mt-1">{t.autoRefresh}</p>
      </div>
    </div>
  );
}
