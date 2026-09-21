'use client'

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface Props {
  data: Record<string, number>
}

const COLORS = ['#22c55e', '#eab308', '#f97316', '#ef4444', '#94a3b8', '#64748b']

const LABELS: Record<string, string> = {
  pure_risk_factors: "Facteurs de risque pur",
  geographic_proxy_active: "Proxy géo (actif)",
  wealth_proxy: "Proxy de richesse",
  socioeconomic_proxy: "Proxy socio-éco",
  neutral: "Neutre",
  geographic_proxy_grouped_as_reference: "Proxy géo (référence)"
}

export function ShapCategoryPie({ data }: Props) {
  // Transformer l'objet en array pour recharts
  const chartData = Object.entries(data)
    .map(([key, value]) => ({
      name: LABELS[key] || key,
      value: value
    }))
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value)

  return (
    <div className="h-80 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            fill="#8884d8"
            paddingAngle={2}
            dataKey="value"
            labelLine={false}
            label={({ percent }) => `${(percent * 100).toFixed(1)}%`}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, 'Contribution']} />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
