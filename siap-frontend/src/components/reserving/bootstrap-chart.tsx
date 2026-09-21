"use client"
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { BootstrapResult } from '@/lib/types'

export function BootstrapChart({ data }: { data: BootstrapResult }) {
  if (!data || !data.histogram) return null

  // Convert histogram bins & counts into Recharts data format
  const chartData = data.histogram.counts.map((count, idx) => {
    // Label is the bin edge formatted nicely
    const binVal = data.histogram.bins[idx]
    return {
      name: `€${(binVal / 1000).toFixed(0)}k`,
      value: count,
      rawVal: binVal
    }
  })

  return (
    <Card className="border border-slate-200 shadow-sm rounded-xl overflow-hidden transition-all hover:shadow-md bg-white h-full">
      <CardHeader className="border-b bg-white pb-4">
        <CardTitle className="text-lg font-semibold text-slate-800">
          ODP Bootstrap Distribution ({data.n_sims} Simulations)
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} tickMargin={10} minTickGap={30} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <Tooltip 
              cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
              formatter={(value: any) => [Number(value), 'Simulations']}
            />
            <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
            {/* Draw lines for percentiles */}
            {data.percentiles['95'] && (
              <ReferenceLine x={`€${(data.percentiles['95'] / 1000).toFixed(0)}k`} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'top', value: '95th Pct', fill: '#ef4444', fontSize: 11 }} />
            )}
            <ReferenceLine x={`€${(data.mean_reserve / 1000).toFixed(0)}k`} stroke="#10b981" strokeDasharray="3 3" label={{ position: 'top', value: 'Mean', fill: '#10b981', fontSize: 11 }} />
          </BarChart>
        </ResponsiveContainer>
        
        <div className="flex justify-between items-center mt-6 p-4 bg-slate-50 rounded-lg border border-slate-100">
          <div className="text-center">
            <p className="text-xs text-slate-500 uppercase font-semibold">Mean Reserve</p>
            <p className="text-lg font-bold text-slate-900">€{Math.round(data.mean_reserve).toLocaleString('fr-FR')}</p>
          </div>
          <div className="w-px h-8 bg-slate-200"></div>
          <div className="text-center">
            <p className="text-xs text-slate-500 uppercase font-semibold">Standard Error</p>
            <p className="text-lg font-bold text-indigo-600">€{Math.round(data.std_reserve).toLocaleString('fr-FR')}</p>
          </div>
          <div className="w-px h-8 bg-slate-200"></div>
          <div className="text-center">
            <p className="text-xs text-slate-500 uppercase font-semibold">99th Percentile</p>
            <p className="text-lg font-bold text-rose-600">€{Math.round(data.percentiles['99']).toLocaleString('fr-FR')}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
