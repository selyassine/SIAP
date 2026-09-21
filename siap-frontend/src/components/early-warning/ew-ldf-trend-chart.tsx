'use client'
import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ReferenceLine, ResponsiveContainer
} from 'recharts'

interface LDFPoint { year: number; ldf: number | null }
interface LDFSeriesData {
  historical: LDFPoint[]
  recent: LDFPoint[]
  forecast: LDFPoint[]
  mean_hist: number
  mean_recent: number
  danger_threshold: number | null
}

interface EWLDFTrendChartProps {
  ldfSeries: Record<string, LDFSeriesData>
}

export function EWLDFTrendChart({ ldfSeries }: EWLDFTrendChartProps) {
  const lags = Object.keys(ldfSeries)
  const [selectedLag, setSelectedLag] = useState(lags[0] || '1->2')

  const series = ldfSeries[selectedLag]
  if (!series) return null

  // Fusionner toutes les années pour le graphique
  const allYears = new Map<number, any>()
  series.historical.forEach(p => {
    allYears.set(p.year, { year: p.year, historique: p.ldf })
  })
  series.recent.forEach(p => {
    const ex = allYears.get(p.year) || { year: p.year }
    allYears.set(p.year, { ...ex, récent: p.ldf })
  })
  series.forecast.forEach(p => {
    const ex = allYears.get(p.year) || { year: p.year }
    allYears.set(p.year, { ...ex, forecast: p.ldf })
  })
  const chartData = Array.from(allYears.values()).sort((a, b) => a.year - b.year)

  return (
    <div className="rounded-xl border bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">
          Évolution LDF — Lag {selectedLag}
        </h3>
        <div className="flex gap-1 flex-wrap">
          {lags.map(lag => (
            <button
              key={lag}
              onClick={() => setSelectedLag(lag)}
              className={`px-2 py-1 text-xs rounded border transition-colors ${
                lag === selectedLag
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {lag}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="year" tick={{ fontSize: 11 }} />
          <YAxis
            domain={['auto', 'auto']}
            tickFormatter={v => v === 0 ? '0' : v.toFixed(3)}
            tick={{ fontSize: 11 }}
          />
          <Tooltip formatter={(v: number) => v?.toFixed(4)} />
          <Legend />

          {/* Ligne de référence : moyenne historique */}
          <ReferenceLine
            y={series.mean_hist}
            stroke="#6b7280"
            strokeDasharray="4 4"
            label={{ value: `Moy. hist. ${series.mean_hist.toFixed(4)}`, position: 'insideRight', fontSize: 10 }}
          />

          {/* Seuil de danger */}
          {series.danger_threshold && (
            <ReferenceLine
              y={series.danger_threshold}
              stroke="#dc2626"
              strokeDasharray="6 2"
              label={{ value: `Seuil danger`, position: 'insideRight', fontSize: 10, fill: '#dc2626' }}
            />
          )}

          <Line
            type="monotone" dataKey="historique"
            stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }}
            connectNulls={false}
          />
          <Line
            type="monotone" dataKey="récent"
            stroke="#f97316" strokeWidth={2} dot={{ r: 4 }}
            connectNulls={false}
          />
          <Line
            type="monotone" dataKey="forecast"
            stroke="#dc2626" strokeWidth={2}
            strokeDasharray="5 3"
            dot={{ r: 3, fill: '#dc2626' }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-xs text-gray-400 mt-2 text-center">
        Bleu = historique (1988–1994) · Orange = récent (1995–1997) · Rouge pointillé = forecast OLS (1998–1999)
      </p>
    </div>
  )
}
