"use client"
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FraudOutput, FraudModelInfo } from '@/lib/types'
import { FraudGauge } from './fraud-gauge'
import { AlertBadge, RiskBadge } from './risk-badge'
import { AlertTriangle, TrendingUp, Info } from 'lucide-react'

interface FraudResultProps {
  result: FraudOutput | null
  modelInfo: FraudModelInfo | null
}

export function FraudResult({ result, modelInfo }: FraudResultProps) {
  if (!result) {
    return (
      <Card className="h-full border border-slate-200/60 bg-white/40 backdrop-blur-xl shadow-sm rounded-2xl flex items-center justify-center min-h-[400px]">
        <div className="text-center text-slate-400 p-6">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-30 text-teal-600" />
          <p className="font-semibold text-slate-600">En attente d'un sinistre à analyser...</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="h-full border border-slate-800/50 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 p-6 shadow-lg rounded-2xl relative overflow-hidden animate-in slide-in-from-right-8 duration-500">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      <CardHeader className="bg-transparent pb-4 flex flex-row items-center justify-between p-0 border-b border-slate-800/50 relative z-10">
        <CardTitle className="text-lg font-bold text-slate-200 flex items-center gap-2">
          Analyse de Fraude
        </CardTitle>
        <AlertBadge isAlert={result.alert} />
      </CardHeader>
      
      <CardContent className="pt-6 p-0 relative z-10">
        
        <FraudGauge score={result.fraud_score} riskLevel={result.risk_level} />
        
        <div className="flex justify-center mt-2 mb-6">
          <RiskBadge level={result.risk_level} className="px-3 py-1 text-sm font-semibold border" />
        </div>

        <div className="space-y-6">
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-rose-400" />
              Facteurs de Risque Majeurs
            </h4>
            <div className="space-y-2">
              {result.top_risk_factors.length > 0 ? (
                result.top_risk_factors.map((factor, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-rose-500/10 text-rose-200 rounded-xl border border-rose-500/20">
                    <AlertTriangle className="h-4 w-4 text-rose-400 flex-shrink-0" />
                    <span className="text-xs font-bold">{factor.replace(/_/g, ' ')}</span>
                  </div>
                ))
              ) : (
                <div className="flex items-center gap-3 p-3 bg-emerald-500/10 text-emerald-200 rounded-xl border border-emerald-500/20">
                  <span className="text-xs font-bold">Aucun facteur suspect détecté</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md p-4 rounded-xl border border-slate-800/60">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Info className="h-4 w-4 text-teal-400" />
              Détails du Modèle
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm mt-3">
              <div>
                <p className="text-slate-400 text-xs font-medium">Probabilité de Fraude</p>
                <p className="font-extrabold text-white text-base mt-0.5">{(result.fraud_probability * 100).toFixed(2)}%</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs font-medium">Seuil de Détection</p>
                <p className="font-extrabold text-white text-base mt-0.5">{(modelInfo?.optimal_threshold ? modelInfo.optimal_threshold * 100 : 14.7).toFixed(1)}%</p>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-800/60">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Performance du Modèle (XGBoost)</p>
              <div className="flex justify-between text-xs text-slate-300">
                <span>AUC-ROC: <strong className="text-teal-400">{result.model_performance.auc_roc_xgb?.toFixed(3) || '0.817'}</strong></span>
                <span>Rappel: <strong className="text-teal-400">{result.model_performance.recall_fraud_optimal?.toFixed(3) || '0.837'}</strong></span>
              </div>
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  )
}
