import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Cell, ResponsiveContainer
} from 'recharts'

interface EWReservesChartProps {
  standard: number
  historical: number
  recent: number
  deltaHistPct: number
  deltaRecentPct: number
  uncertaintyPct: number
}

export function EWReservesComparisonChart({
  standard, historical, recent,
  deltaHistPct, deltaRecentPct, uncertaintyPct
}: EWReservesChartProps) {
  const data = [
    { name: 'STD\n(référence)', value: standard,  color: '#3b82f6', delta: 0 },
    { name: 'HIST\n(plancher)', value: historical, color: '#22c55e', delta: deltaHistPct },
    { name: 'RÉCENT\n(plafond)', value: recent,   color: '#f97316', delta: deltaRecentPct },
  ]

  return (
    <div className="rounded-xl border bg-white p-6">
      <h3 className="font-semibold text-gray-800 mb-1">
        Impact sur les Réserves — 3 Scénarios
      </h3>
      <p className="text-xs text-gray-500 mb-4">
        Plage d'incertitude : {uncertaintyPct.toFixed(1)}% des réserves STD
      </p>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 10, right: 20, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
          <YAxis
            tickFormatter={v => `${(v/1000).toFixed(0)}k$`}
            tick={{ fontSize: 11 }}
          />
          <Tooltip
            formatter={(v: number, _, entry) => [
              `${v.toLocaleString('fr-FR')}$ (${entry.payload.delta >= 0 ? '+' : ''}${entry.payload.delta.toFixed(1)}% vs STD)`,
              'Réserve'
            ]}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="grid grid-cols-3 gap-3 mt-3">
        {data.map(d => (
          <div key={d.name} className="text-center">
            <p className="text-xs text-gray-500">{d.name.replace('\n', ' ')}</p>
            <p className="font-semibold text-sm">{d.value.toLocaleString('fr-FR')}$</p>
            {d.delta !== 0 && (
              <p className={`text-xs ${d.delta > 0 ? 'text-orange-500' : 'text-green-500'}`}>
                {d.delta > 0 ? '+' : ''}{d.delta.toFixed(1)}%
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
