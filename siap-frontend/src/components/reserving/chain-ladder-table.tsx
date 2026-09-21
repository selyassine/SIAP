"use client"
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChainLadderResult } from '@/lib/types'
import { TrendingUp } from 'lucide-react'

export function ChainLadderTable({ data }: { data: ChainLadderResult }) {
  if (!data) return null

  const originYears = Object.keys(data.ultimate_by_year).sort()

  return (
    <Card className="border border-slate-200 shadow-sm rounded-xl overflow-hidden transition-all hover:shadow-md bg-white">
      <CardHeader className="border-b bg-white">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-indigo-600" />
          <CardTitle className="text-lg font-semibold text-slate-800">Chain Ladder Projection</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="pt-0 px-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-slate-50 text-slate-500 border-b">
              <tr>
                <th className="p-4 font-semibold text-center border-r">Origin Year</th>
                <th className="p-4 font-semibold">Ultimate Claims</th>
                <th className="p-4 font-semibold text-indigo-700 bg-indigo-50/50">IBNR Reserve</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {originYears.map(year => {
                const ultimate = data.ultimate_by_year[year]
                const reserve = data.reserve_by_year[year]
                return (
                  <tr key={year} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium text-slate-700 text-center border-r bg-white">{year}</td>
                    <td className="p-4 text-slate-600">€{Math.round(ultimate).toLocaleString('fr-FR')}</td>
                    <td className="p-4 font-semibold text-indigo-700 bg-indigo-50/30">
                      {reserve === null ? '—' : `€${Math.round(reserve).toLocaleString('fr-FR')}`}
                    </td>
                  </tr>
                )
              })}
              <tr className="bg-slate-100 font-bold border-t-2 border-slate-200">
                <td className="p-4 text-center text-slate-800 border-r">TOTAL</td>
                <td className="p-4 text-slate-800">
                  €{Math.round(Object.values(data.ultimate_by_year).reduce((a,b)=>a+b,0)).toLocaleString('fr-FR')}
                </td>
                <td className="p-4 text-indigo-800 bg-indigo-100/50">
                  €{Math.round(data.total_reserve).toLocaleString('fr-FR')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t bg-slate-50">
          <h4 className="text-xs font-semibold text-slate-500 uppercase mb-2">Development Factors (LDF)</h4>
          <div className="flex flex-wrap gap-2">
            {data.ldf.slice(0, -1).map((factor, i) => (
              <div key={i} className="px-2 py-1 bg-white border rounded text-xs text-slate-600">
                {factor.toFixed(3)}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
