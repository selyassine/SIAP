"use client"
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MackResult } from '@/lib/types'
import { AlertTriangle, Info } from 'lucide-react'

export function MackAnalysis({ data }: { data: MackResult }) {
  if (!data) return null

  const originYears = Object.keys(data.by_year).sort()
  
  return (
    <Card className="border border-slate-200 shadow-sm rounded-xl overflow-hidden transition-all hover:shadow-md bg-white h-full">
      <CardHeader className="border-b bg-amber-50/30 pb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <CardTitle className="text-lg font-semibold text-slate-800">
            Mack Uncertainty Analysis
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex flex-col items-center justify-center">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Standard Error</span>
            <span className="text-2xl font-bold text-amber-600">
              €{Math.round(data.total_std_error).toLocaleString('fr-FR')}
            </span>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex flex-col items-center justify-center">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Coefficient of Variation</span>
            <span className="text-2xl font-bold text-slate-700">
              {((data.total_std_error / data.total_reserve) * 100).toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="mb-6">
          <h4 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
            95% Confidence Interval
          </h4>
          <div className="relative h-12 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200 flex items-center px-4">
            {/* Visual bar for CI */}
            <div className="absolute left-0 h-full bg-amber-100/50" style={{ width: '100%' }}></div>
            <div 
              className="absolute h-full bg-amber-400 opacity-80" 
              style={{ 
                left: '20%', 
                width: '60%',
                boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)'
              }}
            ></div>
            
            <div className="relative w-full flex justify-between z-10 text-xs font-bold">
              <span className="text-slate-600">
                L: €{Math.round(data.ci_95_lower).toLocaleString('fr-FR')}
              </span>
              <span className="text-amber-900 drop-shadow-sm">
                Mean: €{Math.round(data.total_reserve).toLocaleString('fr-FR')}
              </span>
              <span className="text-slate-600">
                U: €{Math.round(data.ci_95_upper).toLocaleString('fr-FR')}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 text-blue-800 p-3 rounded-md text-xs flex items-start gap-2">
          <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p>
            The Mack method provides an analytic estimate of the standard error of the Chain Ladder reserve, assuming the development factors are independent and variance is proportional to the previous cumulative claims.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
