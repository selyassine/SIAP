'use client'
import { useEffect, useState } from 'react'
import { StatCard } from '@/components/ui/stat-card'
import { FileText, DollarSign, ShieldAlert, AlertTriangle } from 'lucide-react'
import { getClaimsStats } from '@/lib/api'

interface ClaimsStats {
  total_claims: number
  total_amount: number
  avg_fraud_score: number
  alerts_count: number
}

export function ClaimsStatsBar({ refreshKey = 0 }: { refreshKey?: number }) {
  const [stats, setStats] = useState<ClaimsStats | null>(null)

  useEffect(() => {
    getClaimsStats()
      .then(setStats)
      .catch(() => setStats(null))
  }, [refreshKey])

  if (!stats) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-xl border bg-card animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4 mb-6">
      <StatCard
        title="Sinistres créés"
        value={String(stats.total_claims)}
        icon={FileText}
        iconColor="text-teal-600 bg-teal-50"
      />
      <StatCard
        title="Montant total"
        value={`${stats.total_amount.toLocaleString('fr-FR')} €`}
        icon={DollarSign}
        iconColor="text-blue-600 bg-blue-50"
      />
      <StatCard
        title="Score fraude moyen"
        value={String(stats.avg_fraud_score)}
        icon={ShieldAlert}
        iconColor="text-violet-600 bg-violet-50"
      />
      <StatCard
        title="Alertes fraude"
        value={String(stats.alerts_count)}
        change={stats.alerts_count > 0 ? 'Nécessite attention' : 'Aucune alerte'}
        trend={stats.alerts_count > 0 ? 'down' : 'neutral'}
        icon={AlertTriangle}
        iconColor={stats.alerts_count > 0 ? 'text-red-600 bg-red-50' : 'text-emerald-600 bg-emerald-50'}
      />
    </div>
  )
}
