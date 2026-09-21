"use client"
import React, { useState, useEffect } from 'react'
import { PricingForm } from '@/components/pricing/pricing-form'
import { PricingResult } from '@/components/pricing/pricing-result'
import { PricingOutput } from '@/lib/types'
import { DriftSummaryWidget } from '@/components/drift/drift-summary-widget'

export default function PricingPage() {
  const [result, setResult] = useState<PricingOutput | null>(null)
  const [driftSummary, setDriftSummary] = useState<any>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    fetch('https://localhost:8000/api/v1/drift/summary', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.ok ? r.json() : null)
      .then(setDriftSummary)
      .catch(() => {})
  }, [])

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Smart Pricing Engine</h2>
        <p className="text-slate-500 mt-2">Enter the policy details below to calculate the actuarial risk and commercial premium.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7">
          <PricingForm onResult={setResult} />
        </div>
        <div className="lg:col-span-5 sticky top-8">
          {result ? (
            <PricingResult data={result} />
          ) : (
            <div className="h-[400px] rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 bg-slate-50 p-8 text-center">
              <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="font-semibold text-slate-700">Awaiting Input</h3>
              <p className="text-sm mt-2">Fill out the form and click Calculate Premium to see the risk assessment and pricing results.</p>
            </div>
          )}
          {driftSummary && (
            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">
                Stabilité du Modèle de Pricing
              </h3>
              <DriftSummaryWidget
                score={driftSummary.stability_score}
                stabilityClass={driftSummary.stability_class}
                nAlerts={driftSummary.n_alerts}
                nVariablesStable={driftSummary.n_variables_stable}
                driftDetected={driftSummary.drift_detected}
                giniDelta={driftSummary.gini_delta}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
