'use client'
import { useState, useRef, useEffect } from 'react'
import { MessageBubble } from './message-bubble'
import { QuickQuestions } from './quick-questions'
import { TypingIndicator } from './typing-indicator'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [quickQuestions, setQuickQuestions] = useState<string[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)

  // Charger les questions suggérées au montage
  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    fetch(`${API_URL}/api/v1/assistant/capabilities`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(r => r.json())
      .then(data => setQuickQuestions(data.quick_questions || []))
      .catch(err => console.error("Could not fetch capabilities", err))
  }, [])

  // Auto-scroll vers le bas
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return

    const userMessage: Message = {
      role: 'user',
      content: text,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const history = messages.map(m => ({
        role: m.role,
        content: m.content
      }))

      // The backend is on another port/domain, we should use our api client or build absolute URL
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
      const response = await fetch(`${API_URL}/api/v1/assistant/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ message: text, history })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Erreur de communication')
      }

      const data = await response.json()
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])

    } catch (error: any) {
      const errorMessage: Message = {
        role: 'assistant',
        content: `Désolé, une erreur est survenue : ${error.message}`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Questions suggérées */}
      {messages.length === 0 && (
        <QuickQuestions
          questions={quickQuestions}
          onSelect={sendMessage}
        />
      )}

      {/* Zone de messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}
        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Zone de saisie */}
      <div className="border-t p-4 flex gap-2">
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Posez votre question actuarielle..."
          className="flex-1 resize-none rounded-lg border p-3 text-sm
                     focus:outline-none focus:ring-2 focus:ring-primary
                     min-h-[44px] max-h-[120px]"
          rows={1}
          disabled={loading}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={loading || !input.trim()}
          className="px-4 py-2 bg-primary text-white rounded-lg
                     hover:bg-primary/90 disabled:opacity-50
                     disabled:cursor-not-allowed transition-colors"
        >
          ➤
        </button>
      </div>
      <p className="text-xs text-center text-gray-400 pb-2">
        Entrée pour envoyer · Shift+Entrée pour nouvelle ligne
      </p>
    </div>
  )
}
