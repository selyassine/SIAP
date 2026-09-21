'use client'
import { useEffect, useState } from 'react'
import { MCDistributionChart } from '@/components/monte-carlo/mc-distribution-chart'
import { MCScenariosBar }      from '@/components/monte-carlo/mc-scenarios-bar'
import { MCSolvencyCard }      from '@/components/monte-carlo/mc-solvency-card'
import { MCPercentilesTable }  from '@/components/monte-carlo/mc-percentiles-table'

export default function MonteCarloPage() {
  const [report, setReport] = useState<any>(null)
  const [error, setError]   = useState<string | null>(null)

  useEffect(() => {
    fetch('https://localhost:8000/api/v1/monte-carlo/report', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(r => { if (!r.ok) throw new Error('Rapport non disponible'); return r.json() })
      .then(setReport)
      .catch(e => setError(e.message))
  }, [])

  const handleDownload = () => {
    if (!report) return
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = 'mc_stress_report.json'; a.click()
    URL.revokeObjectURL(url)
  }

  if (error)  return <div className="p-6 text-center text-gray-500">{error}</div>
  if (!report) return <div className="p-6 text-center text-gray-400">Chargement...</div>

  const stats = report.simulation_stats
  const solv  = report.solvency_metrics
  const pct   = report.percentiles
  const fmt   = (n: number) => n.toLocaleString('fr-FR', { maximumFractionDigits: 0 })

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Monte Carlo Stress Testing
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Distribution des réserves IBNR — {(report.methodology.n_simulations).toLocaleString()} simulations
          calibrées sur les signaux Option C (social inflation)
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          Source : {report.source}
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            label: 'Moyenne MC',
            value: `${fmt(stats.mean)}$`,
            sub: `+${stats.mean_delta_pct.toFixed(1)}% vs réserve centrale`,
            color: 'text-blue-700',
          },
          {
            label: 'VaR 99.5% (SCR)',
            value: `${fmt(solv.var_99_5)}$`,
            sub: `+${solv.capital_buffer_99_5_pct.toFixed(1)}% capital requis`,
            color: 'text-red-700',
          },
          {
            label: 'CVaR 99.5%',
            value: `${fmt(solv.cvar_99_5)}$`,
            sub: `Expected Shortfall au-delà du SCR`,
            color: 'text-red-900',
          },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="border rounded-xl p-5 bg-white">
            <p className="text-sm text-gray-500">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
            <p className="text-xs text-gray-400 mt-1">{sub}</p>
          </div>
        ))}
      </div>

      {/* Histogramme distribution */}
      <MCDistributionChart
        histogram={report.histogram}
        cdfCurve={report.cdf_curve}
        reserveCentral={report.reserve_reference}
        meanMC={stats.mean}
        var95={solv.var_95}
        var99_5={solv.var_99_5}
      />

      {/* Scénarios + Solvency côte à côte */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MCScenariosBar scenarios={report.scenarios} />
        <MCSolvencyCard
          reserveCentral={report.reserve_reference}
          var95={solv.var_95}
          var99_5={solv.var_99_5}
          cvar99_5={solv.cvar_99_5}
          buffer95={solv.capital_buffer_95}
          buffer99_5={solv.capital_buffer_99_5}
          buffer95Pct={solv.capital_buffer_95_pct}
          buffer99_5Pct={solv.capital_buffer_99_5_pct}
        />
      </div>

      {/* Percentiles */}
      <MCPercentilesTable
        percentiles={pct}
        reserveCentral={report.reserve_reference}
      />

      {/* Note méthodologique + téléchargement */}
      <div className="border border-blue-200 bg-blue-50 rounded-xl p-5">
        <h3 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
          <span>ℹ️</span> Note méthodologique
        </h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>
            100 000 simulations Chain Ladder avec LDFs tirés d'une loi log-normale
            calibrée sur le triangle CAS (NJ Manufacturers, ppauto, 1988–1997).
          </li>
          <li>
            Le drift est capé à 3% du LDF moyen par lag pour rester actuariellement
            conservateur — correspondant aux signaux FORTE de l'Option C
            (lags 2→3 et 4→5, p&lt;0.05).
          </li>
          <li>
            La réserve centrale (494 113$) correspond au P17 de la distribution MC
            — signal que les tendances récentes hausseraient les réserves si elles se maintiennent.
          </li>
          <li>
            VaR 99.5% = SCR (Solvency Capital Requirement) Solvabilité II.
            CVaR = Expected Shortfall (perte moyenne au-delà du SCR).
          </li>
        </ul>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center text-sm text-gray-500 pt-4 border-t">
        <span>
          Dernière simulation : {new Date(report.generated_at).toLocaleDateString('fr-FR')}
        </span>
        <button
          onClick={handleDownload}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
        >
          📥 Télécharger rapport JSON
        </button>
      </div>
    </div>
  )
}
