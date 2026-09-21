interface MCPercentilesTableProps {
  percentiles: Record<string, number>
  reserveCentral: number
}

const PERCENTILE_LABELS: Record<string, string> = {
  p5: 'P5', p25: 'P25', p50: 'P50 (Médiane)',
  p75: 'P75', p95: 'P95 ← VaR 95%',
  p99: 'P99', p99_5: 'P99.5 ← SCR Sol. II',
}

export function MCPercentilesTable({ percentiles, reserveCentral }: MCPercentilesTableProps) {
  const fmt = (n: number) => n.toLocaleString('fr-FR', { maximumFractionDigits: 0 })
  const deltaPct = (v: number) => ((v - reserveCentral) / reserveCentral * 100).toFixed(1)

  return (
    <div className="border rounded-xl p-5 bg-white">
      <h3 className="font-semibold text-gray-900 mb-4">Percentiles de la Distribution</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50">
            <th className="text-left px-3 py-2 font-medium text-gray-600">Percentile</th>
            <th className="text-right px-3 py-2 font-medium text-gray-600">Réserve</th>
            <th className="text-right px-3 py-2 font-medium text-gray-600">vs Centrale</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(PERCENTILE_LABELS).map(([key, label]) => {
            const val = percentiles[key]
            const pct = parseFloat(deltaPct(val))
            const isHigh = key === 'p99_5' || key === 'p99'
            const isMid = key === 'p95' || key === 'p75'
            return (
              <tr key={key} className={`border-t ${isHigh ? 'bg-red-50' : isMid ? 'bg-amber-50' : ''}`}>
                <td className="px-3 py-2 text-gray-700">{label}</td>
                <td className="px-3 py-2 text-right font-medium">{fmt(val)}$</td>
                <td className={`px-3 py-2 text-right font-semibold ${pct > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {pct > 0 ? '+' : ''}{pct}%
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
