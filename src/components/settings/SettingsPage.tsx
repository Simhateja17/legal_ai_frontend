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

        {/* Mode selector */}
        <div>
          <label className="block text-sm font-medium text-gray-700">{t.mode}</label>
          <p className="mt-1 text-xs text-gray-500">{t.modeDesc}</p>
          <div className="mt-3 grid grid-cols-3 gap-3">
            {([
              { value: 'normal', label: t.modeNormal, desc: t.modeNormalDesc },
              { value: 'student', label: t.modeStudent, desc: t.modeStudentDesc },
              { value: 'lawyer', label: t.modeLawyer, desc: t.modeLawyerDesc },
            ] as const).map(({ value, label, desc }) => (
              <button
                key={value}
                onClick={() => update({ mode: value })}
                className={`rounded-lg border-2 p-3 text-left transition-colors ${
                  settings.mode === value
                    ? 'border-blue-500 bg-blue-50 text-blue-900'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="font-medium text-sm">{label}</div>
                <div className="mt-1 text-xs text-gray-500">{desc}</div>
              </button>
            ))}
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
