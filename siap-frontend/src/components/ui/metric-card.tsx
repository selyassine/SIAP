import { cn } from "@/lib/utils"

export interface MetricCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  subtitle?: string
  trend?: string
  gradient: string
  textColor: string
  iconBg: string
  border?: string
  className?: string
}

export function MetricCard({
  title,
  value,
  icon,
  subtitle,
  trend,
  gradient,
  textColor,
  iconBg,
  border = "border-transparent",
  className,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md relative overflow-hidden",
        "bg-gradient-to-br",
        gradient,
        border,
        className
      )}
    >
      <div className="flex justify-between items-start mb-4 relative z-10">
        <p className={cn("text-sm font-medium opacity-80", textColor)}>{title}</p>
        <div className={cn("p-2.5 rounded-xl flex items-center justify-center", iconBg)}>
          {icon}
        </div>
      </div>
      <div className="relative z-10">
        <h4 className={cn("text-3xl font-bold tracking-tight mb-1", textColor)}>
          {value}
        </h4>
        <div className="flex items-center justify-between mt-2">
          {subtitle && (
            <p className={cn("text-xs opacity-70", textColor)}>{subtitle}</p>
          )}
          {trend && (
            <span
              className={cn(
                "text-[10px] px-2 py-0.5 rounded-full font-bold",
                trend.startsWith("+")
                  ? "bg-emerald-500/20 text-emerald-700"
                  : trend.startsWith("-")
                  ? "bg-red-500/20 text-red-700"
                  : "bg-slate-500/20 text-slate-700"
              )}
            >
              {trend}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
