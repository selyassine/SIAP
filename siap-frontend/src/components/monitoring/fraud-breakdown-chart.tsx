"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
import { AlertTriangle } from "lucide-react";

interface FraudBreakdownChartProps {
  data: any[];
  title: string;
  description: string;
  dataKeyName: string;
  dataKeyValue: string;
  hasHighMajorDamageNote?: boolean;
}

export function FraudBreakdownChart({ data, title, description, dataKeyName, dataKeyValue, hasHighMajorDamageNote }: FraudBreakdownChartProps) {
  const chartData = data.map(item => ({
    ...item,
  })).sort((a, b) => b[dataKeyValue] - a[dataKeyValue]);

  const getBarColor = (value: number) => {
    if (value > 40) return "#DC2626";
    if (value > 30) return "#EF4444";
    if (value > 20) return "#F97316";
    return "#0D9488";
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden">
      <div className="px-6 pt-6 pb-2">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500 mt-1">{description}</p>
      </div>
      <div className="px-4 pb-6">
        {hasHighMajorDamageNote && (
          <div className="mx-2 mb-4 flex items-start gap-2.5 bg-amber-50 border border-amber-200/60 p-3.5 rounded-xl text-xs text-amber-800 leading-relaxed">
            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <p>
              Le taux élevé pour <strong>Major Damage</strong> est caractéristique de ce jeu de données Kaggle, enrichi artificiellement pour démontrer des patterns de fraude.
            </p>
          </div>
        )}
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#F1F5F9" />
              <XAxis 
                type="number" 
                stroke="#94A3B8" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(v) => `${v}%`}
                fontWeight={500}
              />
              <YAxis 
                dataKey={dataKeyName} 
                type="category" 
                stroke="#64748B" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false} 
                width={120}
                fontWeight={500}
              />
              <Tooltip
                cursor={{ fill: '#F8FAFC', radius: 8 }}
                contentStyle={{ 
                  borderRadius: "12px", 
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
                  padding: "10px 14px",
                  fontSize: "13px",
                }}
                formatter={(value) => [`${Number(value ?? 0).toFixed(1)}%`, 'Taux de fraude']}
              />
              <Bar dataKey={dataKeyValue} radius={[0, 6, 6, 0]} barSize={22}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry[dataKeyValue])} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
