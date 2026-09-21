'use client'
import { useEffect, useState } from 'react'

export function MCReservingSummaryWidget() {
  const [summary, setSummary] = useState<any>(null)

  useEffect(() => {
    fetch('https://localhost:8000/api/v1/monte-carlo/summary', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(r => r.ok ? r.json() : null)
      .then(setSummary)
      .catch(() => {})
  }, [])

  if (!summary) return null

  const fmt = (n: number) => n.toLocaleString('fr-FR', { maximumFractionDigits: 0 })

  return (
    <div className="border border-amber-200 bg-amber-50 rounded-xl p-4 mt-4">
      <h4 className="font-medium text-amber-900 mb-2">
        🎲 Stress Test Monte Carlo (100 000 simulations)
      </h4>
      <div className="grid grid-cols-3 gap-3 text-sm">
        <div>
          <p className="text-amber-700 text-xs">Moyenne MC</p>
          <p className="font-semibold">{fmt(summary.mean_mc)}$</p>
          <p className="text-xs text-amber-600">+{summary.mean_delta_pct.toFixed(1)}%</p>
        </div>
        <div>
          <p className="text-red-700 text-xs">VaR 99.5% (SCR)</p>
          <p className="font-semibold text-red-700">{fmt(summary.var_99_5)}$</p>
          <p className="text-xs text-red-600">+{summary.capital_buffer_99_5_pct.toFixed(1)}%</p>
        </div>
        <div>
          <p className="text-gray-600 text-xs">CV</p>
          <p className="font-semibold">{summary.cv_pct.toFixed(1)}%</p>
          <p className="text-xs text-gray-500">Incertitude</p>
        </div>
      </div>
      <a href="/monte-carlo" className="text-xs text-amber-700 hover:underline mt-2 inline-block">
        Voir l'analyse complète →
      </a>
    </div>
  )
}
