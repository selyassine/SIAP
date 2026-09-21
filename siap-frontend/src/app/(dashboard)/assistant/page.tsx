import { ChatWindow } from '@/components/assistant/chat-window'

export default function AssistantPage() {
  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Header */}
      <div className="border-b px-6 py-4">
        <h1 className="text-2xl font-semibold text-gray-900">
          Assistant Actuaire IA
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Interrogez le portefeuille SIAP en langage naturel ·
          Powered by Groq llama-3.3-70b
        </p>
      </div>

      {/* Chat */}
      <div className="flex-1 overflow-hidden">
        <ChatWindow />
      </div>
    </div>
  )
}
