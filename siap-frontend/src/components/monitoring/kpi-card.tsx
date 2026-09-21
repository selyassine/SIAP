import { ArrowDownRight, ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string;
  benchmark?: string;
  delta?: string;
  deltaPositive?: boolean;
  icon?: React.ReactNode;
}

export function KpiCard({ title, value, benchmark, delta, deltaPositive, icon }: KpiCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 transition-all duration-300 hover:shadow-lg hover:shadow-slate-200/50 hover:border-slate-300 hover:-translate-y-0.5">
      {/* Subtle gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-teal-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-500 tracking-wide uppercase">{title}</p>
          {icon && <div className="text-slate-400">{icon}</div>}
        </div>
        <div className="flex items-end justify-between gap-3">
          <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{value}</h3>
          {delta && (
            <div
              className={`flex items-center gap-1 text-sm font-semibold px-2.5 py-1 rounded-full ${
                deltaPositive
                  ? "text-emerald-700 bg-emerald-50"
                  : "text-red-700 bg-red-50"
              }`}
            >
              {deltaPositive ? (
                <TrendingDown className="w-3.5 h-3.5" />
              ) : (
                <TrendingUp className="w-3.5 h-3.5" />
              )}
              <span>{delta.replace("▼ ", "").replace("▲ ", "")}</span>
            </div>
          )}
        </div>
        {benchmark && (
          <p className="text-xs text-slate-400 mt-0.5 font-medium">{benchmark}</p>
        )}
      </div>
    </div>
  );
}
