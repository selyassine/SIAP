"use client"
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BFResult, ChainLadderResult } from '@/lib/types'
import { TrendingUp, ShieldAlert, ArrowRight } from 'lucide-react'

export function BFComparison({ bfData, clData }: { bfData: BFResult, clData: ChainLadderResult }) {
  if (!bfData || !clData) return null

  const diff = bfData.total_reserve - clData.total_reserve
  const diffPct = (diff / clData.total_reserve) * 100
  const isBfHigher = diff > 0

  return (
    <Card className="border border-slate-200 shadow-sm rounded-xl overflow-hidden transition-all hover:shadow-md bg-white h-full">
      <CardHeader className="border-b bg-teal-50/30 pb-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-teal-600" />
          <CardTitle className="text-lg font-semibold text-slate-800">
            Bornhuetter-Ferguson vs CL
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        
        <div className="flex items-center justify-between mb-6">
          <div className="text-center flex-1">
            <p className="text-xs font-semibold text-slate-500 uppercase">Chain Ladder</p>
            <p className="text-xl font-bold text-slate-800 mt-1">€{Math.round(clData.total_reserve).toLocaleString('fr-FR')}</p>
          </div>
          
          <div className="flex flex-col items-center px-4">
            <span className={`text-sm font-bold ${isBfHigher ? 'text-teal-600' : 'text-rose-600'} flex items-center`}>
              {isBfHigher ? '+' : ''}{diffPct.toFixed(1)}%
            </span>
            <ArrowRight className="h-4 w-4 text-slate-400 my-1" />
            <span className="text-xs text-slate-400">Diff: €{Math.round(Math.abs(diff)).toLocaleString('fr-FR')}</span>
          </div>
          
          <div className="text-center flex-1">
            <p className="text-xs font-semibold text-teal-600 uppercase">B-F Method</p>
            <p className="text-xl font-bold text-teal-700 mt-1">€{Math.round(bfData.total_reserve).toLocaleString('fr-FR')}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-md border border-slate-100">
            <span className="text-sm font-medium text-slate-600">Apriori Loss Ratio</span>
            <span className="text-sm font-bold text-slate-900">{(bfData.apriori_loss_ratio * 100).toFixed(1)}%</span>
          </div>
        </div>

        <div className="mt-6 text-xs text-slate-500 leading-relaxed bg-slate-50 p-3 rounded-md border border-slate-100">
          The BF method combines the Chain Ladder development pattern with an expected a priori loss ratio. It is particularly stable for recent origin years where the CL method can be highly volatile. 
          {isBfHigher ? " In this case, BF suggests higher reserves." : " In this case, BF suggests lower reserves."}
        </div>
      </CardContent>
    </Card>
  )
}
