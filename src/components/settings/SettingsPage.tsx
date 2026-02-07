import { useSettings } from '../../hooks/useSettings';
import { useHealth } from '../../hooks/useHealth';
import de from '../../i18n/de';

export default function SettingsPage() {
  const { settings, update } = useSettings();
  const { data } = useHealth();
  const t = de.settings;

  return (
    <div className="mx-auto max-w-2xl p-8">
      <h2 className="mb-8 text-2xl font-bold">{t.title}</h2>

      <div className="space-y-8">
        {/* top_k slider */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t.topK}: <span className="font-semibold text-gray-900">{settings.topK}</span>
          </label>
          <p className="mt-1 text-xs text-gray-500">{t.topKDesc}</p>
          <input
            type="range"
            min={1}
            max={50}
            value={settings.topK}
            onChange={(e) => update({ topK: Number(e.target.value) })}
            className="mt-3 w-full"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>1</span>
            <span>50</span>
          </div>
        </div>

        {/* similarity threshold slider */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {t.threshold}: <span className="font-semibold text-gray-900">{settings.similarityThreshold.toFixed(2)}</span>
          </label>
          <p className="mt-1 text-xs text-gray-500">{t.thresholdDesc}</p>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(settings.similarityThreshold * 100)}
            onChange={(e) => update({ similarityThreshold: Number(e.target.value) / 100 })}
            className="mt-3 w-full"
          />
          <div className="flex justify-between text-xs text-gray-400">
            <span>0.00</span>
            <span>1.00</span>
          </div>
        </div>

        {/* LLM provider badge (read-only) */}
        <div>
          <label className="block text-sm font-medium text-gray-700">{t.provider}</label>
          <p className="mt-1 text-xs text-gray-500">{t.providerDesc}</p>
          <div className="mt-3">
            <span className="inline-block rounded-full bg-blue-100 px-4 py-1 text-sm font-medium text-blue-800">
              {data?.llm_provider?.toUpperCase() ?? de.health.unknown}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
