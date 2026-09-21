import Link from 'next/link'

interface EWSummaryWidgetProps {
  score: number
  classification: 'VERT' | 'AMBRE' | 'ROUGE'
  nAlertesForte: number
  deltaRecentPct: number
  uncertaintyPct: number
}

const COLOR: Record<string, string> = {
  VERT:  'border-green-400 bg-green-50',
  AMBRE: 'border-amber-400 bg-amber-50',
  ROUGE: 'border-red-400 bg-red-50',
}
const ICON: Record<string, string> = { VERT: '🟢', AMBRE: '🟡', ROUGE: '🔴' }

export function EWSummaryWidget({
  score, classification, nAlertesForte, deltaRecentPct, uncertaintyPct
}: EWSummaryWidgetProps) {
  return (
    <div className={`rounded-xl border-l-4 p-5 ${COLOR[classification] || COLOR.VERT}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            Early Warning — Social Inflation
          </p>
          <div className="flex items-center gap-2">
            <span className="text-lg">{ICON[classification] || '🟢'}</span>
            <span className="text-2xl font-bold text-gray-900">{score}<span className="text-sm font-normal text-gray-500">/100</span></span>
            <span className="text-sm font-semibold text-gray-700">{classification}</span>
          </div>
        </div>
        <Link
          href="/early-warning"
          className="text-xs text-blue-600 hover:underline whitespace-nowrap mt-1"
        >
          Voir l'analyse →
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-3 mt-3 text-center">
        <div>
          <p className="text-xs text-gray-500">Alertes FORTES</p>
          <p className="font-bold text-red-600">{nAlertesForte}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Réserve récente</p>
          <p className={`font-bold ${deltaRecentPct > 0 ? 'text-orange-600' : 'text-green-600'}`}>
            {deltaRecentPct > 0 ? '+' : ''}{deltaRecentPct.toFixed(1)}%
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Incertitude</p>
          <p className="font-bold text-gray-700">{uncertaintyPct.toFixed(1)}%</p>
        </div>
      </div>
    </div>
  )
}
