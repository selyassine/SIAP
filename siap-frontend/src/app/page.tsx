import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/brand/logo"
import {
  Shield, TrendingUp, Zap, BarChart3, ShieldAlert, Camera, Bot,
  ArrowRight, CheckCircle2, Calculator, Files
} from "lucide-react"

const stats = [
  { value: "81.7%", label: "Fraud detection AUC" },
  { value: "<50ms", label: "Pricing inference" },
  { value: "6", label: "ML modules" },
  { value: "99.9%", label: "Platform uptime" },
]

const modules = [
  {
    icon: Calculator,
    title: "Smart Pricing",
    desc: "LightGBM frequency + GLM severity models for real-time premium calculation.",
    color: "teal",
    href: "/pricing",
  },
  {
    icon: ShieldAlert,
    title: "Fraud Detection",
    desc: "XGBoost classifier with SHAP explainability and batch claim scoring.",
    color: "amber",
    href: "/fraud/detect",
  },
  {
    icon: Camera,
    title: "Computer Vision",
    desc: "YOLOv8 damage detection with cost estimation and fraud coherence checks.",
    color: "blue",
    href: "/vision",
  },
  {
    icon: BarChart3,
    title: "IBNR Reserving",
    desc: "Chain-ladder, Bornhuetter-Ferguson, Mack analysis and bootstrap simulations.",
    color: "violet",
    href: "/reserving",
  },
  {
    icon: TrendingUp,
    title: "Risk Analytics",
    desc: "Portfolio monitoring with loss ratios, fraud trends and regional risk maps.",
    color: "emerald",
    href: "/monitoring",
  },
  {
    icon: Bot,
    title: "AI Assistant",
    desc: "Groq-powered copilot for actuarial questions, model insights and data queries.",
    color: "rose",
    href: "/assistant",
  },
]

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  teal: { bg: "bg-teal-50", text: "text-teal-600", border: "hover:border-teal-200" },
  amber: { bg: "bg-amber-50", text: "text-amber-600", border: "hover:border-amber-200" },
  blue: { bg: "bg-blue-50", text: "text-blue-600", border: "hover:border-blue-200" },
  violet: { bg: "bg-violet-50", text: "text-violet-600", border: "hover:border-violet-200" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600", border: "hover:border-emerald-200" },
  rose: { bg: "bg-rose-50", text: "text-rose-600", border: "hover:border-rose-200" },
}

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 glass border-b">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Logo size="md" href="/" />
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#modules" className="hover:text-slate-900 transition-colors">Modules</a>
            <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
            <a href="#stats" className="hover:text-slate-900 transition-colors">Performance</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-3 py-2">
              Sign in
            </Link>
            <Button asChild>
              <Link href="/register">Get started <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative mesh-gradient grid-pattern overflow-hidden">
        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-teal-300 mb-8 backdrop-blur">
              <Zap className="h-3.5 w-3.5" />
              Enterprise actuarial intelligence
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl leading-[1.1]">
              Price smarter.{" "}
              <span className="bg-gradient-to-r from-teal-300 to-emerald-300 bg-clip-text text-transparent">
                Detect faster.
              </span>
            </h1>
            <p className="mt-6 text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              SIAP unifies machine learning pricing, fraud detection, computer vision,
              and reserving into one platform built for modern insurers.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild className="w-full sm:w-auto">
                <Link href="/register">Start free trial <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="w-full sm:w-auto border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white">
                <Link href="/login">View demo</Link>
              </Button>
            </div>
          </div>

          {/* Stats bar */}
          <div id="stats" className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl border border-white/10 bg-white/5 backdrop-blur px-6 py-5 text-center">
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-slate-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules */}
      <section id="modules" className="py-24 bg-background">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">Platform modules</p>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Six ML engines, one unified workspace
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Every tool an actuary needs — from quote to claim to reserve.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((m) => {
              const c = colorMap[m.color]
              return (
                <Link
                  key={m.title}
                  href={m.href}
                  className={`group rounded-2xl border bg-card p-8 transition-all hover:shadow-lg ${c.border}`}
                >
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${c.bg} ${c.text} mb-5`}>
                    <m.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 group-hover:text-primary transition-colors">
                    {m.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{m.desc}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    Explore <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-slate-50 border-y">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">Why SIAP</p>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Built for actuaries who demand precision
              </h2>
              <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
                From frequency-severity decomposition to real-time fraud scoring,
                every module is backed by production-grade ML models with full explainability.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  "Separate LightGBM frequency & GLM severity models",
                  "Batch processing up to 1,000 policies per request",
                  "SHAP-based risk factor explanations",
                  "YOLOv8 visual damage assessment with cost estimates",
                  "Chain-ladder & Mack reserving with bootstrap confidence",
                  "AI copilot powered by Llama 3.3 70B",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm text-slate-700">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Zap, title: "Sub-50ms", sub: "Inference latency", color: "teal" },
                { icon: Shield, title: "0.323 Gini", sub: "Pricing model", color: "amber" },
                { icon: Files, title: "1,000+", sub: "Batch policies", color: "blue" },
                { icon: TrendingUp, title: "Real-time", sub: "Risk monitoring", color: "emerald" },
              ].map((item) => {
                const c = colorMap[item.color]
                return (
                  <div key={item.title} className="rounded-2xl border bg-card p-6 shadow-sm">
                    <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${c.bg} ${c.text} mb-4`}>
                      <item.icon className="h-5 w-5" />
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{item.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{item.sub}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl mesh-gradient grid-pattern px-8 py-16 sm:px-16 text-center">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Ready to transform your underwriting?
            </h2>
            <p className="mt-4 text-slate-300 text-lg max-w-xl mx-auto">
              Join insurers using SIAP to price risks faster and detect fraud earlier.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/register">Create free account</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white">
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo size="sm" />
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} SIAP — Smart Insurance Analytics Platform
          </p>
        </div>
      </footer>
    </div>
  )
}
