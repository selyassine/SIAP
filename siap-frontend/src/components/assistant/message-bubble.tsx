interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

function formatRelativeTime(date: Date) {
  const seconds = Math.round((date.getTime() - Date.now()) / 1000)
  const rtf = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' })
  const absSeconds = Math.abs(seconds)

  if (absSeconds < 60) return rtf.format(Math.round(seconds), 'second')
  const minutes = Math.round(seconds / 60)
  if (Math.abs(minutes) < 60) return rtf.format(minutes, 'minute')
  const hours = Math.round(seconds / 3600)
  if (Math.abs(hours) < 24) return rtf.format(hours, 'hour')
  const days = Math.round(seconds / 86400)
  return rtf.format(days, 'day')
}

export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} gap-2`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center
                        justify-center text-sm flex-shrink-0 mt-1">
          🤖
        </div>
      )}
      <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'}
                       flex flex-col gap-1`}>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed
          ${isUser
            ? 'bg-primary text-white rounded-tr-sm'
            : 'bg-gray-100 text-gray-800 rounded-tl-sm'
          }`}>
          {/* Formatage markdown basique */}
          {message.content.split('\n').map((line, i) => (
            <p key={i} className={i > 0 ? 'mt-1' : ''}>
              {line}
            </p>
          ))}
        </div>
        <span className="text-xs text-gray-400 px-1">
          {formatRelativeTime(message.timestamp)}
        </span>
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center
                        justify-center text-sm flex-shrink-0 mt-1">
          👤
        </div>
      )}
    </div>
  )
}
