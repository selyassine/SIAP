'use client'
import { useEffect, useState } from 'react'
import { EWRiskScoreCard } from '@/components/early-warning/ew-risk-score-card'
import { EWLDFTrendChart } from '@/components/early-warning/ew-ldf-trend-chart'
import { EWReservesComparisonChart } from '@/components/early-warning/ew-reserves-comparison-chart'
import { EWLagTable } from '@/components/early-warning/ew-lag-table'

export default function EarlyWarningPage() {
  const [report, setReport] = useState<any>(null)
  const [error, setError]   = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    fetch('https://localhost:8000/api/v1/early-warning/report', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => { if (!r.ok) throw new Error('Rapport non disponible'); return r.json() })
      .then(setReport)
      .catch(e => setError(e.message))
  }, [])

  const handleDownload = () => {
    if (!report) return
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = Object.assign(document.createElement('a'), { href: url, download: 'early_warning_report.json' })
    a.click()
    URL.revokeObjectURL(url)
  }

  if (error)  return <div className="p-8 text-center text-gray-500">{error}</div>
  if (!report) return <div className="p-8 text-center text-gray-400">Chargement...</div>

  const r = report

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">

      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Reserve Risk Early Warning System
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Surveillance des facteurs de développement — détection précoce de social inflation
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          Source : {r.source}
        </p>
      </div>

      {/* Score + Alertes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EWRiskScoreCard
          score={r.global_score}
          classification={r.classification}
          verdict={r.verdict}
          nAlertesForte={r.summary.n_alerts_forte}
          nTendancesHausse={r.summary.n_trends_hausse}
        />

        {/* Alertes */}
        <div className="rounded-xl border bg-white p-6">
          <h3 className="font-semibold text-gray-800 mb-3">
            Alertes ({r.alerts.length})
          </h3>
          {r.alerts.length === 0 ? (
            <p className="text-sm text-green-600">Aucune alerte détectée.</p>
          ) : (
            <ul className="space-y-2">
              {r.alerts.map((a: any, i: number) => (
                <li key={i} className="flex gap-2 text-sm">
                  <span>
                    {a.type === 'FORTE'    ? '🔴' :
                     a.type === 'MODÉRÉE' ? '🟡' : '📈'}
                  </span>
                  <span className="text-gray-700">{a.message}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Réserves */}
      <EWReservesComparisonChart
        standard={r.reserves.standard}
        historical={r.reserves.historical_ldfs}
        recent={r.reserves.recent_ldfs}
        deltaHistPct={r.reserves.delta_hist_pct}
        deltaRecentPct={r.reserves.delta_recent_pct}
        uncertaintyPct={r.reserves.uncertainty_pct}
      />

      {/* Graphique LDF */}
      <EWLDFTrendChart ldfSeries={r.ldf_series} />

      {/* Tableau */}
      <EWLagTable details={r.lag_details} />

      {/* Note méthodologique */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 text-sm text-blue-800">
        <p className="font-medium mb-1">ℹ️ Note méthodologique</p>
        <p>
          Le scénario RÉCENT utilise les LDFs des {r.methodology.n_recent_years} dernières années
          ({r.methodology.global_ay_recent.join(', ')}) pour les lags où ces années sont observées,
          et les LDFs STD en fallback pour les lags plus longs.
          Les lags 8→9 et 9→10 sont exclus du score faute de données suffisantes.
        </p>
        <p className="mt-1">
          Seuils : alerte FORTE p&lt;{r.methodology.alpha_fort},
          MODÉRÉE p&lt;{r.methodology.alpha_modere},
          zone danger = mean_hist × {r.methodology.forecast_danger_multiplier}.
        </p>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center text-sm text-gray-500 pt-4 border-t">
        <span>
          Dernière analyse : {new Date(r.generated_at).toLocaleDateString('fr-FR')}
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
