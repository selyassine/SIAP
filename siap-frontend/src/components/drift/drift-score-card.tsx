interface DriftScoreCardProps {
  score: number
  stabilityClass: 'STABLE' | 'SURVEILLANCE' | 'DRIFT'
  verdict: string
  nAlerts: number
  nVariablesStable: number
}

const COLOR_MAP = {
  STABLE:       { bg: 'bg-green-50', border: 'border-green-200',
                  text: 'text-green-700', hex: '#16a34a', icon: '🟢' },
  SURVEILLANCE: { bg: 'bg-amber-50', border: 'border-amber-200',
                  text: 'text-amber-700', hex: '#d97706', icon: '🟡' },
  DRIFT:        { bg: 'bg-red-50',   border: 'border-red-200',
                  text: 'text-red-700',   hex: '#dc2626', icon: '🔴' },
}

export function DriftScoreCard({
  score, stabilityClass, verdict, nAlerts, nVariablesStable
}: DriftScoreCardProps) {
  const c = COLOR_MAP[stabilityClass] || COLOR_MAP.STABLE
  const circumference = 2 * Math.PI * 54

  return (
    <div className={`rounded-xl border p-6 ${c.bg} ${c.border}`}>
      <h3 className="font-semibold text-gray-800 mb-4">Score de Stabilité</h3>
      <div className="flex items-center gap-6">
        <svg width="130" height="130" viewBox="0 0 130 130">
          <circle cx="65" cy="65" r="54" fill="none"
                  stroke="#e5e7eb" strokeWidth="12" />
          <circle cx="65" cy="65" r="54" fill="none"
                  stroke={c.hex} strokeWidth="12"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference - (score/100)*circumference}
                  strokeLinecap="round"
                  transform="rotate(-90 65 65)" />
          <text x="65" y="60" textAnchor="middle"
                fontSize="22" fontWeight="bold" fill="#1f2937">{score}</text>
          <text x="65" y="76" textAnchor="middle"
                fontSize="11" fill="#6b7280">/ 100</text>
        </svg>
        <div>
          <div className="flex items-center gap-2">
            <span>{c.icon}</span>
            <p className={`text-xl font-bold ${c.text}`}>{stabilityClass}</p>
          </div>
          <p className="text-sm text-gray-600 mt-1 max-w-[180px]">{verdict}</p>
          <div className="mt-3 space-y-1 text-xs text-gray-500">
            <p>Alertes détectées : <span className={`font-medium ${nAlerts > 0 ? 'text-red-600' : 'text-green-600'}`}>{nAlerts}</span></p>
            <p>Variables stables : <span className="font-medium text-green-600">{nVariablesStable}/10</span></p>
          </div>
        </div>
      </div>
    </div>
  )
}
