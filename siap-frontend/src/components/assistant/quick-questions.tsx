export function QuickQuestions({
  questions,
  onSelect
}: {
  questions: string[]
  onSelect: (q: string) => void
}) {
  return (
    <div className="p-6">
      <div className="text-center mb-6">
        <div className="text-4xl mb-3">🤖</div>
        <h2 className="text-xl font-semibold text-gray-800">
          Assistant Actuaire IA
        </h2>
        <p className="text-gray-500 text-sm mt-1">
          Posez vos questions sur le portefeuille SIAP
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Powered by Groq · llama-3.3-70b
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-2xl mx-auto">
        {questions.map((q, i) => (
          <button
            key={i}
            onClick={() => onSelect(q)}
            className="text-left p-3 rounded-lg border border-gray-200
                       hover:border-primary hover:bg-primary/5
                       text-sm text-gray-700 transition-all duration-150"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  )
}
