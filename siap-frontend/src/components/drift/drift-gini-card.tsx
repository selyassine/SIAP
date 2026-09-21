interface DriftPerformance {
  gini_ref: number | null
  gini_recent: number | null
  gini_delta: number | null
  degradation: boolean
}

export function DriftGiniCard({ perf }: { perf: DriftPerformance }) {
  const hasGini = perf.gini_ref !== null && perf.gini_recent !== null

  return (
    <div className="rounded-xl border bg-white p-6">
      <h3 className="font-semibold text-gray-800 mb-4">
        Performance Gini
      </h3>
      {!hasGini ? (
        <p className="text-sm text-gray-500">
          Gini non calculable — ClaimNb absent du dataset.
        </p>
      ) : (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Gini référence</span>
            <span className="font-mono text-sm font-medium">
              {(perf.gini_ref! * 100).toFixed(2)}%
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Gini récent</span>
            <span className="font-mono text-sm font-medium">
              {(perf.gini_recent! * 100).toFixed(2)}%
            </span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t">
            <span className="text-sm text-gray-600">Variation</span>
            <span className={`font-medium text-sm ${
              perf.gini_delta! >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {perf.gini_delta! >= 0 ? '+' : ''}{(perf.gini_delta! * 100).toFixed(2)} pts
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Dégradation</span>
            <span className={`font-medium text-sm ${
              perf.degradation ? 'text-red-600' : 'text-green-600'
            }`}>
              {perf.degradation ? '⚠️ OUI (> -2 pts)' : '✅ NON'}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Seuil dégradation : perte de plus de 2 points de Gini
          </p>
        </div>
      )}
    </div>
  )
}
