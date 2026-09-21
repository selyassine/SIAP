'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface RegionDisparityItem {
  region: string
  frequency: number
  has_dedicated_coefficient: boolean
  ecart_vs_min_pct: number
}

interface Props {
  data: RegionDisparityItem[]
}

export function RegionalDisparityChart({ data }: Props) {
  // On trie par écart vs min décroissant pour l'affichage
  const sortedData = [...data].sort((a, b) => b.ecart_vs_min_pct - a.ecart_vs_min_pct)

  return (
    <div className="h-80 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={sortedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="region" />
          <YAxis tickFormatter={(val) => `+${val}%`} />
          <Tooltip 
            formatter={(value: number) => [`+${value.toFixed(1)}%`, 'Écart vs Réf.']}
            labelFormatter={(label) => `Région : ${label}`}
          />
          <Bar dataKey="ecart_vs_min_pct" name="Écart vs min">
            {sortedData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.has_dedicated_coefficient ? '#3b82f6' : '#94a3b8'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-6 mt-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
          <span>Coefficient dédié</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-slate-400 rounded-sm"></div>
          <span>Groupe de référence</span>
        </div>
      </div>
    </div>
  )
}
