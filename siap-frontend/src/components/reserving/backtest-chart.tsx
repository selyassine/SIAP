"use client"
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BacktestResult } from '@/lib/types'
import { CheckCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts'

export function BacktestChart({ data }: { data: BacktestResult }) {
  if (!data) return null

  const chartData = Object.entries(data.by_year).map(([year, info]) => ({
    name: year,
    error: info.error_pct,
    actual: info.actual_ultimate,
    predicted: info.ultimate
  })).sort((a, b) => a.name.localeCompare(b.name))

  return (
    <Card className="border border-slate-200 shadow-sm rounded-xl overflow-hidden transition-all hover:shadow-md bg-white h-full">
      <CardHeader className="border-b bg-emerald-50/30 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            <CardTitle className="text-lg font-semibold text-slate-800">
              Historical Backtesting
            </CardTitle>
          </div>
          <div className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-bold shadow-sm">
            MAPE: {data.mape_pct.toFixed(2)}%
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 h-[300px]">
        <h4 className="text-xs font-semibold text-slate-500 uppercase text-center mb-4">Error % by Origin Year</h4>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <ReferenceLine y={0} stroke="#cbd5e1" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} tickMargin={10} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(val) => `${val}%`} />
            <Tooltip 
              cursor={{ fill: 'rgba(16, 185, 129, 0.1)' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
              formatter={(value: any, name: any) => {
                const numValue = Number(value);
                if (name === 'error') return [`${numValue.toFixed(2)}%`, 'Error']
                return [`€${Math.round(numValue).toLocaleString('fr-FR')}`, name === 'actual' ? 'Actual' : 'Predicted']
              }}
            />
            <Bar dataKey="error" radius={[2, 2, 2, 2]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.error > 0 ? '#ef4444' : '#10b981'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
