'use client'
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer, Legend
} from 'recharts'

interface MCDistributionChartProps {
  histogram: { bin_center: number; frequency: number }[]
  cdfCurve:  { reserve: number; percentile: number }[]
  reserveCentral: number
  meanMC:    number
  var95:     number
  var99_5:   number
}

export function MCDistributionChart({
  histogram, cdfCurve, reserveCentral, meanMC, var95, var99_5
}: MCDistributionChartProps) {
  // Combiner histogram + CDF sur le même axe X
  // Règle: L'histogramme dans le JSON contient 200 bins. On ré-échantillonne à 50 bins si lent.
  const displayData = histogram.filter((_, i) => i % 4 === 0).map(h => {
    const cdfMatch = cdfCurve.find(c => Math.abs(c.reserve - h.bin_center) < 5000)
    return {
      reserve: Math.round(h.bin_center / 1000),  // en k$
      frequency: +(h.frequency * 100).toFixed(3),
      cdf: cdfMatch ? +(cdfMatch.percentile).toFixed(1) : undefined,
    }
  })

  return (
    <div className="border rounded-xl p-5 bg-white">
      <h3 className="font-semibold text-gray-900 mb-1">
        Distribution des 100 000 réserves simulées
      </h3>
      <p className="text-xs text-gray-500 mb-4">
        Histogramme de fréquence + courbe CDF (axe droit)
      </p>
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={displayData} margin={{ top: 10, right: 40, left: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="reserve"
            tickFormatter={v => `${v}k$`}
            tick={{ fontSize: 11 }}
            label={{ value: 'Réserve ($)', position: 'insideBottom', offset: -5, fontSize: 11 }}
          />
          <YAxis
            yAxisId="freq"
            tickFormatter={v => v === 0 ? '0' : `${v.toFixed(1)}%`}
            tick={{ fontSize: 11 }}
            label={{ value: 'Fréquence', angle: -90, position: 'insideLeft', fontSize: 11 }}
          />
          <YAxis
            yAxisId="cdf"
            orientation="right"
            domain={[0, 100]}
            tickFormatter={v => v === 0 ? '0' : `${v}%`}
            tick={{ fontSize: 11 }}
          />
          <Tooltip
            formatter={(value, name) =>
              name === 'frequency' ? [`${value}%`, 'Fréquence'] :
              name === 'cdf'       ? [`${value}%`, 'CDF'] : [value, name]
            }
            labelFormatter={v => `${v}k$`}
          />
          <Bar yAxisId="freq" dataKey="frequency" fill="#3b82f6" opacity={0.7} name="frequency" />
          <Line
            yAxisId="cdf" type="monotone" dataKey="cdf"
            stroke="#f59e0b" strokeWidth={2} dot={false} name="cdf"
          />
          {/* Lignes de référence */}
          <ReferenceLine
            yAxisId="freq"
            x={Math.round(reserveCentral / 1000)}
            stroke="#1e3a5f" strokeDasharray="4 2" strokeWidth={2}
            label={{ value: 'Centrale', position: 'top', fontSize: 10, fill: '#1e3a5f' }}
          />
          <ReferenceLine
            yAxisId="freq"
            x={Math.round(meanMC / 1000)}
            stroke="#22c55e" strokeDasharray="4 2" strokeWidth={2}
            label={{ value: 'Moyenne MC', position: 'top', fontSize: 10, fill: '#22c55e' }}
          />
          <ReferenceLine
            yAxisId="freq"
            x={Math.round(var95 / 1000)}
            stroke="#f59e0b" strokeDasharray="4 2" strokeWidth={2}
            label={{ value: 'VaR 95%', position: 'top', fontSize: 10, fill: '#f59e0b' }}
          />
          <ReferenceLine
            yAxisId="freq"
            x={Math.round(var99_5 / 1000)}
            stroke="#dc2626" strokeDasharray="4 2" strokeWidth={2}
            label={{ value: 'VaR 99.5%', position: 'top', fontSize: 10, fill: '#dc2626' }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
