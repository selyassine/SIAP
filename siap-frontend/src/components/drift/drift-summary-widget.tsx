import Link from 'next/link'

interface DriftSummaryWidgetProps {
  score: number
  stabilityClass: 'STABLE' | 'SURVEILLANCE' | 'DRIFT'
  nAlerts: number
  nVariablesStable: number
  driftDetected: boolean
  giniDelta: number | null
}

const COLOR = {
  STABLE:       'border-green-400 bg-green-50',
  SURVEILLANCE: 'border-amber-400 bg-amber-50',
  DRIFT:        'border-red-400 bg-red-50',
}
const ICON = { STABLE: '🟢', SURVEILLANCE: '🟡', DRIFT: '🔴' }

export function DriftSummaryWidget({
  score, stabilityClass, nAlerts, nVariablesStable, driftDetected, giniDelta
}: DriftSummaryWidgetProps) {
  const c = COLOR[stabilityClass] || COLOR.STABLE
  const i = ICON[stabilityClass] || ICON.STABLE

  return (
    <div className={`rounded-xl border-l-4 p-5 ${c}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            Model Drift Monitoring
          </p>
          <div className="flex items-center gap-2">
            <span className="text-lg">{i}</span>
            <span className="text-2xl font-bold text-gray-900">
              {score}<span className="text-sm font-normal text-gray-500">/100</span>
            </span>
            <span className="text-sm font-semibold text-gray-700">{stabilityClass}</span>
          </div>
        </div>
        <Link href="/drift"
          className="text-xs text-blue-600 hover:underline whitespace-nowrap mt-1">
          Voir l'analyse →
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-3 mt-3 text-center">
        <div>
          <p className="text-xs text-gray-500">Variables stables</p>
          <p className="font-bold text-green-600">{nVariablesStable}/10</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Drift prédictions</p>
          <p className={`font-bold ${driftDetected ? 'text-red-600' : 'text-green-600'}`}>
            {driftDetected ? 'Détecté' : 'Aucun'}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Δ Gini</p>
          <p className={`font-bold ${
            giniDelta !== null && giniDelta >= 0 ? 'text-green-600' : 'text-amber-600'
          }`}>
            {giniDelta !== null
              ? `${giniDelta >= 0 ? '+' : ''}${(giniDelta*100).toFixed(1)} pts`
              : '—'}
          </p>
        </div>
      </div>
    </div>
  )
}
