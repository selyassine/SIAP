"use client"
import { Bell, ChevronRight } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"

const routeMeta: Record<string, { section: string; title: string }> = {
  "/dashboard": { section: "Overview", title: "Dashboard" },
  "/pricing": { section: "Underwriting", title: "Smart Pricing" },
  "/pricing/batch": { section: "Underwriting", title: "Batch Pricing" },
  "/fraud/detect": { section: "Underwriting", title: "Fraud Detection" },
  "/claims": { section: "Underwriting", title: "Sinistres Récents" },
  "/claims/new": { section: "Underwriting", title: "Nouveau Sinistre" },
  "/fraud/batch": { section: "Underwriting", title: "Batch Fraud" },
  "/vision": { section: "Underwriting", title: "Computer Vision" },
  "/reserving": { section: "Analytics", title: "IBNR Reserving" },
  "/monitoring": { section: "Analytics", title: "Risk Analytics" },
  "/assistant": { section: "AI", title: "Assistant IA" },
  "/reports": { section: "Analytics", title: "Rapports Actuariels" },
}

function getMeta(pathname: string) {
  if (pathname.startsWith('/claims/') && pathname !== '/claims/new') {
    return { section: "Underwriting", title: "Détail Sinistre" }
  }
  const exact = routeMeta[pathname]
  if (exact) return exact
  for (const [path, meta] of Object.entries(routeMeta)) {
    if (pathname.startsWith(path + "/") || pathname.startsWith(path)) return meta
  }
  return { section: "SIAP", title: "Dashboard" }
}

export function Topbar() {
  const pathname = usePathname()
  const { section, title } = getMeta(pathname)

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b border-slate-200/40 bg-white/30 backdrop-blur-xl px-6 lg:px-8">
      <div className="flex-1 min-w-0">
        <nav className="flex items-center gap-1.5 text-sm text-slate-500">
          <Link href="/dashboard" className="hover:text-slate-900 transition-colors font-medium hidden sm:inline">
            {section}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400 hidden sm:inline" />
          <span className="font-bold text-slate-800 truncate">{title}</span>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative rounded-lg p-2.5 text-slate-500 transition-colors hover:bg-slate-900/5 hover:text-slate-700">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-teal-500 ring-2 ring-white" />
        </button>

        <div className="h-8 w-px bg-slate-200/60 hidden sm:block" />

        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-bold text-slate-800 leading-none">Actuary</p>
            <p className="text-[10px] font-semibold text-slate-400 mt-0.5">SIAP Workspace</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-teal-600 text-white text-sm font-bold shadow-md shadow-teal-500/25">
            A
          </div>
        </div>
      </div>
    </header>
  )
}
