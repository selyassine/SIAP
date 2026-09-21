"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { YearlyKpiItem } from "@/lib/types";

interface LossRatioChartProps {
  data: YearlyKpiItem[];
}

export function LossRatioChart({ data }: LossRatioChartProps) {
  const chartData = data.map((item) => ({
    year: item.year,
    loss_ratio: +(item.loss_ratio * 100).toFixed(2),
    combined_ratio: +(item.combined_ratio * 100).toFixed(2),
  }));

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden">
      <div className="px-6 pt-6 pb-2">
        <h3 className="text-lg font-semibold text-slate-900">Évolution des Ratios</h3>
        <p className="text-sm text-slate-500 mt-1">
          Loss Ratio et Combined Ratio par année
        </p>
      </div>
      <div className="px-4 pb-6">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
              <defs>
                <linearGradient id="lossGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#0D9488" />
                  <stop offset="100%" stopColor="#14B8A6" />
                </linearGradient>
                <linearGradient id="combinedGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#6366F1" />
                  <stop offset="100%" stopColor="#818CF8" />
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
                tickFormatter={(value) => `${value}%`}
                fontWeight={500}
              />
              <Tooltip
                contentStyle={{ 
                  borderRadius: "12px", 
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                  padding: "12px 16px",
                  fontSize: "13px",
                }}
                formatter={(value, name) => [
                  `${Number(value ?? 0).toFixed(1)}%`,
                  name === "loss_ratio" ? "Loss Ratio" : "Combined Ratio"
                ]}
              />
              <Legend 
                iconType="circle" 
                wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
                formatter={(value: string) => value === "loss_ratio" ? "Loss Ratio" : "Combined Ratio"}
              />
              <ReferenceLine 
                y={72} 
                stroke="#CBD5E1" 
                strokeDasharray="6 4"
                label={{ position: 'right', value: 'Marché 72%', fill: '#94A3B8', fontSize: 10, fontWeight: 600 }} 
              />
              <Line
                type="monotone"
                dataKey="loss_ratio"
                name="loss_ratio"
                stroke="url(#lossGradient)"
                strokeWidth={2.5}
                dot={{ r: 4, strokeWidth: 2, fill: "#fff", stroke: "#0D9488" }}
                activeDot={{ r: 6, fill: "#0D9488", stroke: "#fff", strokeWidth: 3 }}
              />
              <Line
                type="monotone"
                dataKey="combined_ratio"
                name="combined_ratio"
                stroke="url(#combinedGradient)"
                strokeWidth={2.5}
                dot={{ r: 4, strokeWidth: 2, fill: "#fff", stroke: "#6366F1" }}
                activeDot={{ r: 6, fill: "#6366F1", stroke: "#fff", strokeWidth: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
