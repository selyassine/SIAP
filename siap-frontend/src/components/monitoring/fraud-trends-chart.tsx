"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { QuarterlyKpiItem } from "@/lib/types";

interface FraudTrendsChartProps {
  data: QuarterlyKpiItem[];
  globalFraudRate: number;
}

export function FraudTrendsChart({ data, globalFraudRate }: FraudTrendsChartProps) {
  const chartData = data.filter(d => !d.quarter.startsWith('2015'));

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden">
      <div className="px-6 pt-6 pb-2">
        <h3 className="text-lg font-semibold text-slate-900">Tendance Fraude (Trimestriel)</h3>
        <p className="text-sm text-slate-500 mt-1">Évolution du taux de fraude par trimestre</p>
      </div>
      <div className="px-4 pb-6">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 15, right: 20, bottom: 5, left: 0 }}>
              <defs>
                <linearGradient id="fraudGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0F172A" stopOpacity={1} />
                  <stop offset="100%" stopColor="#475569" stopOpacity={0.8} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis 
                dataKey="quarter" 
                stroke="#94A3B8" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                interval={3}
                fontWeight={500}
              />
              <YAxis
                stroke="#94A3B8"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}%`}
                fontWeight={500}
              />
              <Tooltip
                contentStyle={{ 
                  borderRadius: "12px", 
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                  padding: "10px 14px",
                  fontSize: "13px",
                }}
                formatter={(value) => [`${Number(value ?? 0).toFixed(1)}%`, 'Taux de fraude']}
                labelFormatter={(label) => `Trimestre : ${label}`}
              />
              <ReferenceLine 
                y={globalFraudRate} 
                stroke="#F97316" 
                strokeDasharray="6 4"
                strokeWidth={1.5}
                label={{ position: 'top', value: `Moyenne ${globalFraudRate.toFixed(1)}%`, fill: '#F97316', fontSize: 10, fontWeight: 600 }} 
              />
              <Line
                type="monotone"
                dataKey="fraud_rate_pct"
                stroke="#0F172A"
                strokeWidth={2.5}
                dot={{ r: 2.5, fill: "#0F172A", strokeWidth: 0 }}
                activeDot={{ r: 6, fill: "#EF4444", stroke: "#fff", strokeWidth: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
