"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ReservesStackedChartProps {
  data: Record<string, { ultimate: number; paid_to_date: number; ibnr_reserve: number; development_pct: number }>;
}

export function ReservesStackedChart({ data }: ReservesStackedChartProps) {
  const chartData = Object.entries(data).map(([year, values]) => ({
    year,
    ...values,
  })).sort((a, b) => parseInt(a.year) - parseInt(b.year));

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden">
      <div className="px-6 pt-6 pb-2">
        <h3 className="text-lg font-semibold text-slate-900">Développement des Sinistres par Année</h3>
        <p className="text-sm text-slate-500 mt-1">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 inline-block"></span>
            Payé à date
          </span>
          {" + "}
          <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span>
            Réserves IBNR
          </span>
          {" = Charge Ultime Estimée"}
        </p>
      </div>
      <div className="px-4 pb-6">
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <defs>
                <linearGradient id="paidGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#14B8A6" />
                  <stop offset="100%" stopColor="#0D9488" />
                </linearGradient>
                <linearGradient id="ibnrGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FBBF24" />
                  <stop offset="100%" stopColor="#F59E0B" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis 
                dataKey="year" 
                stroke="#94A3B8" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                fontWeight={500}
              />
              <YAxis 
                stroke="#94A3B8" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k$`}
                fontWeight={500}
              />
              <Tooltip
                cursor={{ fill: '#F8FAFC', radius: 4 }}
                contentStyle={{ 
                  borderRadius: "12px", 
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                  padding: "10px 14px",
                  fontSize: "13px",
                }}
                formatter={(value, name) => [
                  Number(value ?? 0).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }),
                  name === 'paid_to_date' ? 'Payé à date' : 'Réserve IBNR'
                ]}
              />
              <Legend 
                iconType="circle" 
                wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
                formatter={(value: string) => value === "Payé à date" ? "Payé à date" : "Réserve IBNR"}
              />
              <Bar dataKey="paid_to_date" name="Payé à date" stackId="a" fill="url(#paidGradient)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="ibnr_reserve" name="Réserve IBNR" stackId="a" fill="url(#ibnrGradient)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
