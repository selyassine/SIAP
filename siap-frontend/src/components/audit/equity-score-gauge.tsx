interface EquityScoreGaugeProps {
  score: number   // 0-100
  verdict: string
}

function getColor(score: number): string {
  if (score >= 80) return '#22c55e'   // vert
  if (score >= 60) return '#f59e0b'   // ambre
  return '#dc2626'                     // rouge
}

export function EquityScoreGauge({ score, verdict }: EquityScoreGaugeProps) {
  const color = getColor(score)
  const circumference = 2 * Math.PI * 80
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="flex flex-col items-center justify-center p-6 border rounded-xl bg-white">
      <svg width="200" height="200" viewBox="0 0 200 200">
        <circle cx="100" cy="100" r="80" fill="none" stroke="#e5e7eb" strokeWidth="16" />
        <circle
          cx="100" cy="100" r="80" fill="none"
          stroke={color} strokeWidth="16"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 100 100)"
        />
        <text x="100" y="95" textAnchor="middle" fontSize="32" fontWeight="bold" fill="#1f2937">
          {score}
        </text>
        <text x="100" y="118" textAnchor="middle" fontSize="12" fill="#6b7280">
          / 100
        </text>
      </svg>
      <p className="mt-2 font-semibold" style={{ color }}>
        {verdict}
      </p>
    </div>
  )
}
