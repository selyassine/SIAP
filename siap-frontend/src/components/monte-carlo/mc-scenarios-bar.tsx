'use client'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts'

interface Scenario {
  label: string
  reserve: number
  delta_pct: number
  percentile_mc: number
}

const COLORS = ['#1e3a5f', '#22c55e', '#f59e0b', '#dc2626']

export function MCScenariosBar({ scenarios }: { scenarios: Scenario[] }) {
  const data = scenarios.map(s => ({
    name: s.label,
    reserve: Math.round(s.reserve),
    delta_pct: s.delta_pct,
    percentile: s.percentile_mc,
  }))

  return (
    <div className="border rounded-xl p-5 bg-white">
      <h3 className="font-semibold text-gray-900 mb-1">Scénarios de Stress</h3>
      <p className="text-xs text-gray-500 mb-4">
        Basés sur le drift Option C (social inflation détectée)
      </p>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis
            tickFormatter={v => v === 0 ? '0' : `${Math.round(v / 1000)}k$`}
            tick={{ fontSize: 11 }}
          />
          <Tooltip
            formatter={(value: number) => [`${value.toLocaleString('fr-FR')}$`, 'Réserve']}
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const d = payload[0].payload
              return (
                <div className="bg-white border rounded-lg p-3 shadow text-xs">
                  <p className="font-semibold">{d.name}</p>
                  <p>Réserve : {d.reserve.toLocaleString('fr-FR')}$</p>
                  <p>Delta : +{d.delta_pct.toFixed(1)}% vs centrale</p>
                  <p>Percentile MC : P{d.percentile.toFixed(0)}</p>
                </div>
              )
            }}
          />
          <Bar dataKey="reserve" radius={[4, 4, 0, 0]}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
