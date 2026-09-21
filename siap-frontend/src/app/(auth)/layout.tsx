import { Logo } from "@/components/brand/logo"
import { Shield, Zap, BarChart3, Bot } from "lucide-react"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="relative hidden lg:flex flex-col justify-between mesh-gradient grid-pattern p-12 text-white overflow-hidden">
        <Logo variant="light" size="md" href="/" />

        <div className="space-y-8 max-w-md">
          <div>
            <p className="text-teal-300 text-sm font-semibold uppercase tracking-widest mb-4">
              Insurance Analytics
            </p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight">
              Actuarial intelligence, powered by machine learning
            </h1>
            <p className="mt-4 text-slate-300 text-lg leading-relaxed">
              Price risks, detect fraud, and monitor portfolios — all in one enterprise-grade platform.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { icon: Zap, label: "Real-time ML inference", desc: "LightGBM, XGBoost & YOLOv8 models" },
              { icon: Shield, label: "Fraud detection", desc: "81.7% AUC-ROC on claim scoring" },
              { icon: BarChart3, label: "IBNR reserving", desc: "Chain-ladder & Mack analysis" },
              { icon: Bot, label: "AI assistant", desc: "Groq-powered actuarial copilot" },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 backdrop-blur">
                  <item.icon className="h-5 w-5 text-teal-300" />
                </div>
                <div>
                  <p className="font-semibold text-white">{item.label}</p>
                  <p className="text-sm text-slate-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm text-slate-500">
          &copy; {new Date().getFullYear()} SIAP — Smart Insurance Analytics Platform
        </p>
      </div>

      <div className="flex flex-col items-center justify-center bg-background px-6 py-12 sm:px-12">
        <div className="lg:hidden mb-8">
          <Logo size="md" href="/" />
        </div>
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  )
}
