"use client"
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RiskGauge } from '@/components/charts/risk-gauge'
import { PricingOutput } from '@/lib/types'

export function PricingResult({ data }: { data: PricingOutput }) {
  if (!data) return null

  const getVariant = (level: string) => {
    switch (level) {
      case 'Low': return 'success'
      case 'Medium': return 'warning'
      case 'High': return 'warning'
      case 'Very High': return 'destructive'
      default: return 'default'
    }
  }

  return (
    <Card className="overflow-hidden rounded-2xl border border-slate-800/50 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-6 shadow-lg relative animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Decorative background glows */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <CardHeader className="bg-transparent pb-6 p-0 relative z-10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-slate-200 text-lg font-bold">Prime Recommandée</CardTitle>
          <Badge variant={getVariant(data.risk_level)} className="px-3 py-1 text-xs font-semibold rounded-full border border-current bg-transparent">
            {data.risk_level === 'Low' ? 'Risque Faible' :
             data.risk_level === 'Medium' ? 'Risque Modéré' :
             data.risk_level === 'High' ? 'Risque Élevé' : 'Risque Critique'}
          </Badge>
        </div>
        <div className="mt-8 flex flex-col items-center justify-center space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Commercial Premium</span>
          <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 tracking-tight py-2">
            €{data.commercial_premium.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-xs text-slate-400 font-medium">
            Pure Premium: €{data.pure_premium.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-4 p-0 relative z-10">
        <div className="py-4">
          <RiskGauge level={data.risk_level} />
        </div>
        
        <div className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-slate-800/60 bg-white/5 backdrop-blur-md p-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Fréquence (LGBM)</span>
            <span className="font-bold text-white text-base mt-0.5">{(data.frequency * 100).toFixed(2)}%</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Sévérité (GLM)</span>
            <span className="font-bold text-white text-base mt-0.5">€{data.severity.toLocaleString('fr-FR', { maximumFractionDigits: 0 })}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Facteur de Chargement</span>
            <span className="font-bold text-white text-base mt-0.5">{(data.loading_factor * 100).toFixed(1)}%</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Modèle Champion</span>
            <span className="font-bold text-emerald-400 truncate text-base mt-0.5">{data.model_used}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
