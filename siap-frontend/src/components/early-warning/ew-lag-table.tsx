interface LagDetail {
  lag: string; ecart_pct: number | null; t_stat: number | null
  p_value: number | null; alert_level: string; trend_dir: string
  forecast_1999: number | null; forecast_danger: boolean
  mean_hist: number | null; mean_recent: number | null
}

const ALERT_BADGE: Record<string, string> = {
  'FORTE':                 'bg-red-100 text-red-700',
  'MODÉRÉE':               'bg-amber-100 text-amber-700',
  'AUCUNE':                'bg-green-100 text-green-700',
  'DONNÉES INSUFFISANTES': 'bg-gray-100 text-gray-500',
}

const TREND_BADGE: Record<string, string> = {
  'HAUSSE':      'text-orange-600',
  'BAISSE':      'text-blue-600',
  'STABLE':      'text-gray-600',
  'INDÉTERMINÉ': 'text-gray-400',
}

export function EWLagTable({ details }: { details: LagDetail[] }) {
  return (
    <div className="rounded-xl border bg-white overflow-hidden">
      <div className="px-6 py-4 border-b">
        <h3 className="font-semibold text-gray-800">Détail par Lag de Développement</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 text-left">Lag</th>
              <th className="px-4 py-3 text-right">Moy. Hist.</th>
              <th className="px-4 py-3 text-right">Moy. Récent</th>
              <th className="px-4 py-3 text-right">Écart %</th>
              <th className="px-4 py-3 text-right">p-value</th>
              <th className="px-4 py-3 text-center">Alerte</th>
              <th className="px-4 py-3 text-center">Tendance</th>
              <th className="px-4 py-3 text-right">Forecast 1999</th>
              <th className="px-4 py-3 text-center">Danger</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {details.map(d => (
              <tr key={d.lag} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono font-medium">{d.lag}</td>
                <td className="px-4 py-3 text-right text-gray-600">
                  {d.mean_hist?.toFixed(4) ?? '—'}
                </td>
                <td className="px-4 py-3 text-right text-gray-600">
                  {d.mean_recent?.toFixed(4) ?? '—'}
                </td>
                <td className={`px-4 py-3 text-right font-medium ${
                  d.ecart_pct !== null && d.ecart_pct > 3 ? 'text-orange-600' : 'text-gray-700'
                }`}>
                  {d.ecart_pct !== null ? `${d.ecart_pct > 0 ? '+' : ''}${d.ecart_pct.toFixed(1)}%` : '—'}
                </td>
                <td className="px-4 py-3 text-right font-mono text-gray-600">
                  {d.p_value !== null ? d.p_value.toFixed(3) : '—'}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ALERT_BADGE[d.alert_level] ?? ''}`}>
                    {d.alert_level}
                  </span>
                </td>
                <td className={`px-4 py-3 text-center font-medium text-xs ${TREND_BADGE[d.trend_dir] ?? ''}`}>
                  {d.trend_dir === 'HAUSSE' ? '↗ HAUSSE' :
                   d.trend_dir === 'BAISSE' ? '↘ BAISSE' :
                   d.trend_dir === 'STABLE' ? '→ STABLE' : '— N/A'}
                </td>
                <td className="px-4 py-3 text-right font-mono text-gray-600">
                  {d.forecast_1999?.toFixed(4) ?? '—'}
                </td>
                <td className="px-4 py-3 text-center">
                  {d.forecast_danger
                    ? <span className="text-red-500 font-bold">⚠️</span>
                    : <span className="text-green-500">✓</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
