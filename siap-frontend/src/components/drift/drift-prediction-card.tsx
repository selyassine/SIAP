interface PredictionDrift {
  psi: number
  psi_status: string
  ks_statistic: number
  ks_pvalue: number
  drift_detected: boolean
  mean_ref: number
  mean_rec: number
  delta_mean_pct: number
}

export function DriftPredictionCard({ data }: { data: PredictionDrift }) {
  return (
    <div className="rounded-xl border bg-white p-6">
      <h3 className="font-semibold text-gray-800 mb-4">
        Drift des Prédictions
      </h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">PSI prédictions</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm">{data.psi.toFixed(4)}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              data.psi_status === 'STABLE'
                ? 'bg-green-100 text-green-700'
                : 'bg-amber-100 text-amber-700'
            }`}>{data.psi_status}</span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Statistique KS</span>
          <span className="font-mono text-sm">{data.ks_statistic.toFixed(4)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">p-value KS</span>
          <span className="font-mono text-sm">{data.ks_pvalue.toFixed(4)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Drift détecté</span>
          <span className={`font-medium text-sm ${
            data.drift_detected ? 'text-red-600' : 'text-green-600'
          }`}>
            {data.drift_detected ? '⚠️ OUI' : '✅ NON'}
          </span>
        </div>
        <div className="pt-2 border-t mt-2 grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-xs text-gray-500">Fréq. référence</p>
            <p className="font-medium text-sm">{(data.mean_ref*100).toFixed(2)}%</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Fréq. récent</p>
            <p className="font-medium text-sm">{(data.mean_rec*100).toFixed(2)}%</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Δ</p>
            <p className={`font-medium text-sm ${
              Math.abs(data.delta_mean_pct) > 2 ? 'text-amber-600' : 'text-green-600'
            }`}>
              {data.delta_mean_pct > 0 ? '+' : ''}{data.delta_mean_pct.toFixed(2)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
