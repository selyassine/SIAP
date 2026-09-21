'use client'
import { useState } from 'react'
import { Bot, X } from 'lucide-react'
import { FloatingChat } from './floating-chat'

export function FloatingAssistant() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="mb-4 w-96 h-[32rem] bg-card rounded-2xl shadow-2xl shadow-slate-900/10 border flex flex-col overflow-hidden">
          <div className="bg-primary text-primary-foreground px-4 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold">SIAP Assistant</p>
                <p className="text-xs opacity-75">Groq · Llama 3.3 70B</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-lg p-1.5 text-white/80 hover:bg-white/10 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <FloatingChat />
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-teal-600/30 hover:shadow-xl hover:shadow-teal-600/40 transition-all duration-200 hover:scale-105 active:scale-95"
        title="AI Actuarial Assistant"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Bot className="h-6 w-6" />}
      </button>
    </div>
  )
}
