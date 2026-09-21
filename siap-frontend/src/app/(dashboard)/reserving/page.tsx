"use client"
import React, { useEffect, useState } from 'react'
import { getReservingSummary, getReservingTriangle } from '@/lib/api'
import { ReservingSummaryOutput, TriangleOutput } from '@/lib/types'
import { Loader2, AlertCircle } from 'lucide-react'

import { CompanySelector } from '@/components/reserving/company-selector'
import { SummaryCards } from '@/components/reserving/summary-cards'
import { ChainLadderTable } from '@/components/reserving/chain-ladder-table'
import { MackAnalysis } from '@/components/reserving/mack-analysis'
import { BFComparison } from '@/components/reserving/bf-comparison'
import { BootstrapChart } from '@/components/reserving/bootstrap-chart'
import { TriangleHeatmap } from '@/components/reserving/triangle-heatmap'
import { BacktestChart } from '@/components/reserving/backtest-chart'
import { EWSummaryWidget } from '@/components/early-warning/ew-summary-widget'
import { MCReservingSummaryWidget } from '@/components/monte-carlo/mc-reserving-summary-widget'

export default function ReservingPage() {
  const [grcode, setGrcode] = useState<number | null>(null)
  const [summaryData, setSummaryData] = useState<ReservingSummaryOutput | null>(null)
  const [triangleData, setTriangleData] = useState<TriangleOutput | null>(null)
  const [ewSummary, setEwSummary] = useState<any>(null)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!grcode) return
    
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const token = localStorage.getItem('token')
        const [summary, triangle, ewRes] = await Promise.all([
          getReservingSummary(grcode),
          getReservingTriangle(grcode),
          fetch('https://localhost:8000/api/v1/early-warning/summary', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ])
        setSummaryData(summary)
        setTriangleData(triangle)
        if (ewRes.ok) {
          setEwSummary(await ewRes.json())
        }
      } catch (err: any) {
        setError(err.response?.data?.detail || "Failed to load reserving data. Ensure backend is running and authenticated.")
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [grcode])

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-10 relative">
      {/* Decorative gradients */}
      <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-indigo-50/40 to-transparent -z-10 pointer-events-none" />
      <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-indigo-400/5 blur-[100px] -z-10 pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Moteur de Provisionnement IBNR</h1>
          <p className="text-slate-500 mt-1">Module actuariel de provisionnement : Chain Ladder, Mack, Bornhuetter-Ferguson et ODP Bootstrap.</p>
        </div>
        <CompanySelector selectedGrcode={grcode} onCompanyChange={setGrcode} />
      </div>
      
      {error && (
        <div className="p-4 bg-red-500/10 text-red-700 border border-red-500/20 rounded-xl flex items-start gap-3">
          <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      {loading && !summaryData && (
        <div className="flex h-[40vh] items-center justify-center">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 rounded-full border-t-2 border-indigo-500 animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-t-2 border-teal-400 animate-spin opacity-50" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
        </div>
      )}

      {!loading && !error && summaryData && triangleData && (
        <div className="space-y-8 animate-in fade-in duration-500">
          
          <SummaryCards data={summaryData} />
          
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 space-y-8">
              <TriangleHeatmap data={triangleData.triangle} />
              <ChainLadderTable data={summaryData.chain_ladder} />
            </div>
            
            <div className="space-y-8">
              <MackAnalysis data={summaryData.mack} />
              <BFComparison bfData={summaryData.bornhuetter_ferguson} clData={summaryData.chain_ladder} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <BootstrapChart data={summaryData.bootstrap} />
            <BacktestChart data={summaryData.backtest} />
          </div>

          {ewSummary && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Surveillance du Risque de Réserves
              </h3>
              <EWSummaryWidget
                score={ewSummary.global_score}
                classification={ewSummary.classification}
                nAlertesForte={ewSummary.n_alerts_forte}
                deltaRecentPct={ewSummary.delta_recent_pct}
                uncertaintyPct={ewSummary.uncertainty_pct}
              />
            </div>
          )}

          <MCReservingSummaryWidget />
          
        </div>
      )}
      
      {!loading && !grcode && !error && (
        <div className="flex flex-col items-center justify-center h-[300px] border border-slate-200/60 bg-white/40 backdrop-blur-xl rounded-2xl text-slate-400 p-6 text-center shadow-sm">
          <div className="h-16 w-16 rounded-full bg-slate-900/5 flex items-center justify-center mb-4 text-2xl">
            📊
          </div>
          <h3 className="font-bold text-slate-700">Aucune Compagnie Sélectionnée</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm">Veuillez sélectionner une compagnie d'assurance dans le sélecteur ci-dessus pour visualiser l'analyse des provisions.</p>
        </div>
      )}
    </div>
  )
}
