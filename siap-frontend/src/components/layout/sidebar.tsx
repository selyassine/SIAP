"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/brand/logo"
import {
  LayoutDashboard, Calculator, Files, BarChart3, BarChart4, Briefcase, FileText,
  LogOut, ShieldAlert, Camera, Bot, Activity, ClipboardList, Scale, Target
} from "lucide-react"
import { logout } from "@/lib/api"

const navGroups = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, active: true },
      { title: "Portfolio Manager", href: "/portfolio", icon: Briefcase, active: true },
    ],
  },
  {
    label: "Underwriting",
    items: [
      { title: "Smart Pricing", href: "/pricing", icon: Calculator, active: true },
      { title: "Fraud Detection", href: "/fraud/detect", icon: ShieldAlert, active: true },
      { title: "Sinistres Récents", href: "/claims", icon: ClipboardList, active: true },
      { title: "Batch Fraud", href: "/fraud/batch", icon: Files, active: true },
      { title: "Computer Vision", href: "/vision", icon: Camera, active: true },
    ],
  },
  {
    label: "Analytics",
    items: [
      { title: "IBNR Reserving", href: "/reserving", icon: BarChart3, active: true },
      { title: "Early Warning", href: "/early-warning", icon: ShieldAlert, active: true },
      { title: "Monte Carlo", href: "/monte-carlo", icon: Target, active: true },
      { title: "Risk Analytics", href: "/monitoring", icon: Activity, active: true },
      { title: "Reports", href: "/reports", icon: FileText, active: true },
    ],
  },
  {
    label: "AI",
    items: [
      { title: "Assistant IA", href: "/assistant", icon: Bot, active: true },
    ],
  },
  {
    label: "Compliance",
    items: [
      { title: "Conformité & Équité", href: "/audit", icon: Scale, active: true },
      { title: "Model Drift", href: "/drift", icon: BarChart4, active: true },
    ],
  },
  {
    label: "Coming soon",
    items: [
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard"
    return pathname === href || pathname.startsWith(href + "/")
  }

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-slate-200/40 bg-white/30 backdrop-blur-xl">
      <div className="flex h-16 items-center border-b border-slate-200/40 px-5">
        <Logo variant="dark" size="sm" href="/dashboard" />
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-5">
            <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {group.label}
            </p>
            <nav className="space-y-0.5">
              {group.items.map((item) => {
                const active = item.active && isActive(item.href)
                return (
                  <Link
                    key={item.title}
                    href={item.active ? item.href : "#"}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-200",
                      active
                        ? "bg-teal-500/10 text-teal-700 shadow-sm border border-teal-500/20"
                        : "text-slate-500 hover:bg-slate-900/5 hover:text-slate-800",
                      !item.active && "opacity-50 cursor-not-allowed hover:bg-transparent"
                    )}
                    onClick={(e) => { if (!item.active) e.preventDefault() }}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-teal-500" />
                    )}
                    <item.icon className={cn("h-4 w-4 shrink-0 transition-colors", active ? "text-teal-600" : "text-slate-400 group-hover:text-slate-600")} />
                    <span className="truncate">{item.title}</span>
                    {!item.active && (
                      <span className="ml-auto text-[9px] uppercase tracking-wider text-slate-400 font-bold">Soon</span>
                    )}
                  </Link>
                )
              })}
            </nav>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-200/40 p-3">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 transition-all hover:bg-red-500/10 hover:text-red-600"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  )
}
