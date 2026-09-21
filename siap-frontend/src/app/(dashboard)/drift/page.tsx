'use client'
import { useEffect, useState } from 'react'
import { DriftScoreCard }       from '@/components/drift/drift-score-card'
import { DriftPSIChart }        from '@/components/drift/drift-psi-chart'
import { DriftPSITable }        from '@/components/drift/drift-psi-table'
import { DriftPredictionCard }  from '@/components/drift/drift-prediction-card'
import { DriftGiniCard }        from '@/components/drift/drift-gini-card'

export default function DriftPage() {
  const [report, setReport] = useState<any>(null)
  const [error, setError]   = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    fetch('https://localhost:8000/api/v1/drift/report', {
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
    const a    = Object.assign(document.createElement('a'),
                   { href: url, download: 'drift_report.json' })
    a.click()
    URL.revokeObjectURL(url)
  }

  if (error)   return <div className="p-8 text-center text-gray-500">{error}</div>
  if (!report) return <div className="p-8 text-center text-gray-400">Chargement...</div>

  const r = report

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">

      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Model Drift & Performance Monitoring
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Surveillance de la stabilité du modèle de pricing —{' '}
          {r.model_monitored}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          Dataset : {r.dataset} · Split {r.methodology.split_ref_pct}% référence
          / {100 - r.methodology.split_ref_pct}% récent
        </p>
      </div>

      {/* Score + Résumé */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DriftScoreCard
          score={r.stability_score}
          stabilityClass={r.stability_class}
          verdict={r.verdict}
          nAlerts={r.alerts.length}
          nVariablesStable={r.psi_results.filter((p: any) => p.status === 'STABLE').length}
        />

        {/* Score detail */}
        <div className="rounded-xl border bg-white p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Détail du Score</h3>
          {[
            { label: 'PSI variables (top-10 SHAP)', score: r.score_detail.psi_variables, max: 40 },
            { label: 'PSI prédictions',             score: r.score_detail.psi_predictions, max: 30 },
            { label: 'Test KS',                     score: r.score_detail.ks_test, max: 15 },
            { label: 'Gini (performance)',           score: r.score_detail.gini, max: 15 },
          ].map(item => (
            <div key={item.label} className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">{item.label}</span>
                <span className="font-medium">{item.score} / {item.max}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${(item.score / item.max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Graphique PSI */}
      <DriftPSIChart psiResults={r.psi_results} />

      {/* Tableau PSI */}
      <DriftPSITable psiResults={r.psi_results} />

      {/* Drift prédictions + Gini */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <DriftPredictionCard data={r.prediction_drift} />
        <DriftGiniCard perf={r.performance} />
      </div>

      {/* Note méthodologique */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 text-sm text-blue-800">
        <p className="font-medium mb-1">ℹ️ Note méthodologique</p>
        <p>
          Ce rapport est généré sur un split artificiel 80/20 du dataset de test
          (freq_test.csv — {r.dataset}). En production, ce module serait relancé
          mensuellement sur les nouvelles polices souscrites pour détecter une
          dérive réelle dans le temps.
        </p>
        <p className="mt-1">
          Variables surveillées : top-10 selon SHAP (Bonus A — Bias Detector).
          Seuils PSI : stable &lt;{r.methodology.psi_stable_threshold},
          surveillance &lt;{r.methodology.psi_watch_threshold},
          drift critique ≥{r.methodology.psi_watch_threshold}.
        </p>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center text-sm text-gray-500
                      pt-4 border-t">
        <span>
          Dernière analyse : {new Date(r.generated_at).toLocaleDateString('fr-FR')}
        </span>
        <button onClick={handleDownload}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors">
          📥 Télécharger rapport JSON
        </button>
      </div>
    </div>
  )
}
