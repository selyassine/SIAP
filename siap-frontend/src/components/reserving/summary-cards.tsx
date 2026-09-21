"use client"
import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { ShieldAlert, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'
import { ReservingSummaryOutput } from '@/lib/types'

export function SummaryCards({ data }: { data: ReservingSummaryOutput }) {
  if (!data) return null

  const cards = [
    {
      title: 'Total Chain Ladder Reserve',
      value: `€${Math.round(data.chain_ladder.total_reserve).toLocaleString('fr-FR')}`,
      subtitle: 'Deterministic Base',
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-100'
    },
    {
      title: 'Bornhuetter-Ferguson Reserve',
      value: `€${Math.round(data.bornhuetter_ferguson.total_reserve).toLocaleString('fr-FR')}`,
      subtitle: `Apriori LR: ${(data.bornhuetter_ferguson.apriori_loss_ratio * 100).toFixed(1)}%`,
      icon: ShieldAlert,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-100'
    },
    {
      title: 'Mack Uncertainty (95% CI)',
      value: `€${Math.round(data.mack.ci_95_upper).toLocaleString('fr-FR')}`,
      subtitle: `Lower: €${Math.round(data.mack.ci_95_lower).toLocaleString('fr-FR')}`,
      icon: AlertTriangle,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-100'
    },
    {
      title: 'Backtest Accuracy (MAPE)',
      value: `${data.backtest.mape_pct.toFixed(2)}%`,
      subtitle: 'Historical Error Margin',
      icon: CheckCircle,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, i) => {
        const Icon = card.icon
        return (
          <Card key={i} className={`border ${card.borderColor} shadow-sm transition-all hover:shadow-md animate-in fade-in slide-in-from-bottom-4`} style={{ animationDelay: `${i * 100}ms` }}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`p-3 rounded-full ${card.bgColor} ${card.color}`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{card.title}</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{card.value}</h3>
                <p className="text-xs text-slate-400 mt-1">{card.subtitle}</p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
