interface SolvencyCardProps {
  reserveCentral: number
  var95: number
  var99_5: number
  cvar99_5: number
  buffer95: number
  buffer99_5: number
  buffer95Pct: number
  buffer99_5Pct: number
}

export function MCSolvencyCard({
  reserveCentral, var95, var99_5, cvar99_5,
  buffer95, buffer99_5, buffer95Pct, buffer99_5Pct
}: SolvencyCardProps) {
  const fmt = (n: number) => n.toLocaleString('fr-FR', { maximumFractionDigits: 0 })

  return (
    <div className="border rounded-xl p-5 bg-white">
      <h3 className="font-semibold text-gray-900 mb-4">
        Métriques Solvabilité II
      </h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center py-2 border-b">
          <span className="text-sm text-gray-600">Réserve centrale (Module 3)</span>
          <span className="font-semibold">{fmt(reserveCentral)}$</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b">
          <div>
            <span className="text-sm text-gray-600">VaR 95%</span>
            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
              Capital +{fmt(buffer95)}$ (+{buffer95Pct.toFixed(1)}%)
            </span>
          </div>
          <span className="font-semibold text-amber-700">{fmt(var95)}$</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b">
          <div>
            <span className="text-sm text-gray-600">VaR 99.5% (SCR)</span>
            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">
              Capital +{fmt(buffer99_5)}$ (+{buffer99_5Pct.toFixed(1)}%)
            </span>
          </div>
          <span className="font-semibold text-red-700">{fmt(var99_5)}$</span>
        </div>
        <div className="flex justify-between items-center py-2">
          <span className="text-sm text-gray-600">CVaR 99.5% (Expected Shortfall)</span>
          <span className="font-semibold text-red-900">{fmt(cvar99_5)}$</span>
        </div>
      </div>
      <p className="text-xs text-gray-400 mt-4 italic">
        Le SCR (Solvency Capital Requirement) sous Solvabilité II correspond au VaR 99.5%
        à horizon 1 an. Le CVaR représente la perte moyenne au-delà de ce seuil.
      </p>
    </div>
  )
}
