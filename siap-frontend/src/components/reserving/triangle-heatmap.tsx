"use client"
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TriangleData } from '@/lib/types'

export function TriangleHeatmap({ data }: { data: TriangleData }) {
  if (!data) return null

  // Function to calculate color intensity for heatmap effect
  const getCellColor = (val: number | null, maxVal: number) => {
    if (val === null) return 'bg-slate-50 text-slate-300'
    const intensity = Math.max(0.1, val / maxVal)
    // Blue/Indigo scale
    return `bg-indigo-[${Math.floor(intensity * 100)}] bg-opacity-${Math.min(Math.floor(intensity * 100), 100)} text-slate-800`
  }

  // Find max value for color scaling
  let maxVal = 0;
  data.cumulative_paid.forEach(row => {
    row.forEach(val => {
      if (val && val > maxVal) maxVal = val;
    })
  })

  return (
    <Card className="border border-slate-200 shadow-sm rounded-xl overflow-hidden transition-all hover:shadow-md bg-white">
      <CardHeader className="border-b bg-white">
        <CardTitle className="text-lg font-semibold text-slate-800">Cumulative Paid Claims Triangle</CardTitle>
      </CardHeader>
      <CardContent className="pt-6 overflow-x-auto">
        <table className="w-full text-sm text-right border-collapse">
          <thead>
            <tr>
              <th className="p-3 font-semibold text-slate-500 border-b border-r bg-slate-50 text-center">Origin \ Lag</th>
              {data.development_lags.map(lag => (
                <th key={lag} className="p-3 font-semibold text-slate-500 border-b bg-slate-50 text-center w-24">
                  {lag}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.origin_years.map((year, i) => (
              <tr key={year} className="hover:bg-slate-50 transition-colors">
                <td className="p-3 font-semibold text-slate-700 border-r bg-white text-center">
                  {year}
                </td>
                {data.cumulative_paid[i].map((val, j) => {
                  const isNull = val === null;
                  // Dynamic inline style for opacity based color scaling
                  const intensity = !isNull && maxVal > 0 ? Math.max(0.05, val / maxVal) : 0;
                  const bgColor = isNull ? '#f8fafc' : `rgba(99, 102, 241, ${intensity * 0.4})`;
                  
                  return (
                    <td 
                      key={j} 
                      className={`p-3 border-b border-slate-100 ${isNull ? 'text-slate-300' : 'text-slate-700 font-medium'}`}
                      style={{ backgroundColor: bgColor }}
                    >
                      {isNull ? '—' : Math.round(val).toLocaleString('fr-FR')}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}
