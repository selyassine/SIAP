import { Sidebar } from "@/components/layout/sidebar"
import { Topbar } from "@/components/layout/topbar"
import { FloatingAssistant } from "@/components/assistant/floating-assistant"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-slate-50/50">
      {/* Premium background mesh gradient with dynamic colorful orbs */}
      <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none bg-[#f6f9fc]">
        <div className="absolute top-[-30%] left-[-10%] w-[60%] h-[60%] rounded-full bg-teal-400/8 blur-[140px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[-10%] right-[-20%] w-[50%] h-[50%] rounded-full bg-blue-400/8 blur-[120px] animate-pulse" style={{ animationDuration: '12s' }} />
        <div className="absolute bottom-[-20%] left-[20%] w-[45%] h-[45%] rounded-full bg-emerald-400/6 blur-[110px] animate-pulse" style={{ animationDuration: '10s' }} />
        
        {/* Modern Dot Grid Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1.5px,transparent_1.5px)] [background-size:32px_32px] opacity-40" />
      </div>

      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden min-w-0 bg-transparent">
        <Topbar />
        <main className="flex-1 overflow-y-auto bg-transparent">
          <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
            {children}
          </div>
        </main>
      </div>
      <FloatingAssistant />
    </div>
  )
}

