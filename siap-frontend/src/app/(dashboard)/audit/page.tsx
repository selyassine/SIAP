'use client'
import { useEffect, useState } from 'react'
import { EquityScoreGauge } from '@/components/audit/equity-score-gauge'
import { RegulatoryComplianceCard } from '@/components/audit/regulatory-compliance-card'
import { DataLimitationsDisclosure } from '@/components/audit/data-limitations-disclosure'
import { RegionalDisparityChart } from '@/components/audit/regional-disparity-chart'
import { ShapCategoryPie } from '@/components/audit/shap-category-pie'
import { DriftSummaryWidget } from '@/components/drift/drift-summary-widget'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function AuditPage() {
  const [report, setReport] = useState<any>(null)
  const [driftSummary, setDriftSummary] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    fetch(`${API_URL}/api/v1/audit/bias-report`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(r => {
        if (!r.ok) throw new Error('Rapport non disponible')
        return r.json()
      })
      .then(setReport)
      .catch(err => setError(err.message))

    fetch(`${API_URL}/api/v1/drift/summary`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(r => r.ok ? r.json() : null)
      .then(setDriftSummary)
      .catch(() => {})
  }, [])

  const handleDownload = () => {
    if (!report) return
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'bias_audit_report.json'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (error) {
    return (
      <div className="p-6 text-center text-gray-500">
        <p>{error}</p>
        <p className="text-sm mt-2">
          Exécuter le notebook 10_bias_detector.ipynb pour générer le rapport.
        </p>
      </div>
    )
  }

  if (!report) return <div className="p-6">Chargement...</div>

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Conformité & Équité Algorithmique
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Audit du modèle de tarification ({report.model_audited}) — IA Act & RGPD
        </p>
      </div>

      <Tabs defaultValue="equity" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="equity">Équité Algorithmique</TabsTrigger>
          <TabsTrigger value="drift">Stabilité Modèle (Drift)</TabsTrigger>
        </TabsList>

        <TabsContent value="equity" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EquityScoreGauge score={report.equity_score} verdict={report.verdict} />
        <RegulatoryComplianceCard
          genderCompliant={report.regulatory_context.gender_directive_compliant}
          genderVariablePresent={report.regulatory_context.gender_variable_present}
          note={report.regulatory_context.note}
        />
      </div>

      {report.flags.length > 0 && (
        <div className="border rounded-xl p-5 bg-amber-50 border-amber-200">
          <h3 className="font-medium text-amber-900 mb-3">
            Points d'attention identifiés ({report.flags.length})
          </h3>
          <ul className="space-y-2">
            {report.flags.map((flag: string, i: number) => (
              <li key={i} className="text-sm text-amber-800 flex gap-2">
                <span>⚠️</span>{flag}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border rounded-xl p-5 bg-white shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-2">Disparité régionale</h3>
          <p className="text-sm text-gray-500 mb-4">
            (Profil identique, seule la région varie)
          </p>
          <RegionalDisparityChart data={report.tests.regional_disparity.detail_by_region} />
        </div>

        <div className="border rounded-xl p-5 bg-white shadow-sm">
          <h3 className="font-semibold text-gray-900 mb-2">Décomposition du pouvoir prédictif</h3>
          <p className="text-sm text-gray-500 mb-4">
            Contribution globale des catégories de features (SHAP)
          </p>
          <ShapCategoryPie data={report.tests.shap_decomposition.category_contribution_pct} />
        </div>
      </div>

      <DataLimitationsDisclosure
        note={report.data_limitations.note}
        zeroVarianceRegions={report.data_limitations.zero_variance_regions}
        coincidenceNote={report.data_limitations.profile_specific_coincidence_note}
      />

      <div className="flex justify-between items-center text-sm text-gray-500 pt-4 border-t">
        <span>Dernière exécution : {new Date(report.audit_date).toLocaleDateString('fr-FR')}</span>
        <button
          onClick={handleDownload}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition-colors"
        >
          📥 Télécharger le rapport complet (JSON)
        </button>
      </div>
        </TabsContent>

        <TabsContent value="drift">
          {driftSummary ? (
            <div className="max-w-2xl">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Surveillance de la Dérive du Modèle (Model Drift)
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Le Model Drift mesure l'évolution de la distribution des variables d'entrée
                et des prédictions par rapport au dataset de référence. Une dérive significative
                peut indiquer une perte de fiabilité du modèle de pricing et une discrimination potentielle.
              </p>
              <DriftSummaryWidget
                score={driftSummary.stability_score}
                stabilityClass={driftSummary.stability_class}
                nAlerts={driftSummary.n_alerts}
                nVariablesStable={driftSummary.n_variables_stable}
                driftDetected={driftSummary.drift_detected}
                giniDelta={driftSummary.gini_delta}
              />
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              Chargement du résumé Model Drift...
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
