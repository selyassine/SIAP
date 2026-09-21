'use client'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer, Cell
} from 'recharts'

interface PSIResult {
  variable: string
  psi: number | null
  status: string
  delta_mean_pct: number | null
}

export function DriftPSIChart({ psiResults }: { psiResults: PSIResult[] }) {
  const data = psiResults
    .filter(r => r.psi !== null)
    .map(r => ({
      variable: r.variable.length > 18 ? r.variable.slice(0, 16) + '..' : r.variable,
      fullName: r.variable,
      psi: r.psi!,
      status: r.status,
    }))
    .sort((a, b) => b.psi - a.psi)

  const getColor = (status: string) => {
    if (status === 'STABLE')        return '#22c55e'
    if (status === 'SURVEILLANCE')  return '#f59e0b'
    return '#ef4444'
  }

  return (
    <div className="rounded-xl border bg-white p-6">
      <h3 className="font-semibold text-gray-800 mb-1">
        PSI par Variable (Top-10 SHAP)
      </h3>
      <p className="text-xs text-gray-500 mb-4">
        Population Stability Index — seuil surveillance 0.10, drift critique 0.25
      </p>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical"
                  margin={{ top: 5, right: 40, left: 130, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
          <XAxis
            type="number"
            domain={[0, 0.30]}
            tickFormatter={v => v === 0 ? '0' : v.toFixed(2)}
            tick={{ fontSize: 11 }}
          />
          <YAxis type="category" dataKey="variable" tick={{ fontSize: 11 }} width={120} />
          <Tooltip
            formatter={(v: number, _, entry) => [
              `PSI = ${v.toFixed(4)} (${entry.payload.status})`,
              entry.payload.fullName
            ]}
          />
          {/* Seuil surveillance */}
          <ReferenceLine x={0.10} stroke="#f59e0b" strokeDasharray="4 4"
            label={{ value: 'Surveillance 0.10', position: 'top', fontSize: 10, fill: '#f59e0b' }} />
          {/* Seuil drift critique */}
          <ReferenceLine x={0.25} stroke="#ef4444" strokeDasharray="4 4"
            label={{ value: 'Drift 0.25', position: 'top', fontSize: 10, fill: '#ef4444' }} />
          <Bar dataKey="psi" radius={[0, 4, 4, 0]}>
            {data.map((entry, i) => (
              <Cell key={i} fill={getColor(entry.status)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
