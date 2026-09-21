interface PSIResult {
  variable: string
  psi: number | null
  status: string
  mean_ref: number | null
  mean_rec: number | null
  delta_mean_pct: number | null
}

const STATUS_BADGE: Record<string, string> = {
  'STABLE':           'bg-green-100 text-green-700',
  'SURVEILLANCE':     'bg-amber-100 text-amber-700',
  'DRIFT CRITIQUE':   'bg-red-100 text-red-700',
  'NON DISPONIBLE':   'bg-gray-100 text-gray-500',
}

export function DriftPSITable({ psiResults }: { psiResults: PSIResult[] }) {
  return (
    <div className="rounded-xl border bg-white overflow-hidden">
      <div className="px-6 py-4 border-b">
        <h3 className="font-semibold text-gray-800">Détail PSI par Variable</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 text-left">Variable</th>
              <th className="px-4 py-3 text-right">PSI</th>
              <th className="px-4 py-3 text-center">Statut</th>
              <th className="px-4 py-3 text-right">Moy. Référence</th>
              <th className="px-4 py-3 text-right">Moy. Récent</th>
              <th className="px-4 py-3 text-right">Δ Moyenne</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {psiResults.map(r => (
              <tr key={r.variable} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs font-medium">{r.variable}</td>
                <td className="px-4 py-3 text-right font-mono">
                  {r.psi !== null ? r.psi.toFixed(4) : '—'}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium
                    ${STATUS_BADGE[r.status] ?? ''}`}>
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-gray-600">
                  {r.mean_ref !== null ? r.mean_ref.toFixed(4) : '—'}
                </td>
                <td className="px-4 py-3 text-right text-gray-600">
                  {r.mean_rec !== null ? r.mean_rec.toFixed(4) : '—'}
                </td>
                <td className={`px-4 py-3 text-right font-medium ${
                  r.delta_mean_pct !== null && Math.abs(r.delta_mean_pct) > 5
                    ? 'text-amber-600' : 'text-gray-600'
                }`}>
                  {r.delta_mean_pct !== null
                    ? `${r.delta_mean_pct > 0 ? '+' : ''}${r.delta_mean_pct.toFixed(2)}%`
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
