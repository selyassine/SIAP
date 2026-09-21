'use client'
import Link from 'next/link'
import { ClaimStatusBadge } from '@/components/claims/claim-status-badge'
import { RiskBadge } from '@/components/fraud/risk-badge'
import { Pencil, Trash2 } from 'lucide-react'

export interface ClaimRow {
  id: number
  claim_number: string
  incident_type: string
  total_claim_amount: number
  fraud_score: number | null
  fraud_risk_level: string | null
  status: string
  created_at: string
}

interface ClaimsTableProps {
  claims: ClaimRow[]
  onDelete?: (id: number) => void
}

function fraudScoreColor(score: number | null) {
  if (score == null) return 'text-slate-400'
  if (score >= 60) return 'text-red-600 font-semibold'
  if (score >= 30) return 'text-amber-600 font-medium'
  return 'text-emerald-600'
}

export function ClaimsTable({ claims, onDelete }: ClaimsTableProps) {
  return (
    <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-slate-50/80">
              <th className="text-left p-4 font-semibold text-muted-foreground">N° Sinistre</th>
              <th className="text-left p-4 font-semibold text-muted-foreground">Type</th>
              <th className="text-left p-4 font-semibold text-muted-foreground">Montant</th>
              <th className="text-left p-4 font-semibold text-muted-foreground">Score Fraude</th>
              <th className="text-left p-4 font-semibold text-muted-foreground">Risque</th>
              <th className="text-left p-4 font-semibold text-muted-foreground">Statut</th>
              <th className="text-left p-4 font-semibold text-muted-foreground">Date</th>
              <th className="text-right p-4 font-semibold text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {claims.map((claim) => (
              <tr
                key={claim.id}
                className="border-b last:border-0 hover:bg-slate-50/80 transition-colors"
              >
                <td className="p-4">
                  <Link href={`/claims/${claim.id}`} className="font-semibold text-teal-700 hover:text-teal-900">
                    {claim.claim_number}
                  </Link>
                </td>
                <td className="p-4 text-slate-700">{claim.incident_type}</td>
                <td className="p-4 font-medium">{claim.total_claim_amount.toLocaleString('fr-FR')} €</td>
                <td className={`p-4 ${fraudScoreColor(claim.fraud_score)}`}>
                  {claim.fraud_score?.toFixed(0) ?? '—'}
                </td>
                <td className="p-4">
                  {claim.fraud_risk_level ? (
                    <RiskBadge level={claim.fraud_risk_level as 'Low' | 'Medium' | 'High' | 'Very High'} />
                  ) : (
                    '—'
                  )}
                </td>
                <td className="p-4"><ClaimStatusBadge status={claim.status} /></td>
                <td className="p-4 text-muted-foreground">
                  {new Date(claim.created_at).toLocaleDateString('fr-FR')}
                </td>
                <td className="p-4 text-right space-x-2">
                  <Link
                    href={`/claims/${claim.id}/edit`}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-slate-100 h-8 w-8 text-slate-500 hover:text-slate-900"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => {
                      if (window.confirm("Êtes-vous sûr de vouloir supprimer ce sinistre ?")) {
                        onDelete?.(claim.id)
                      }
                    }}
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-red-50 h-8 w-8 text-slate-500 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {claims.length === 0 && (
              <tr>
                <td colSpan={8} className="p-12 text-center text-muted-foreground">
                  Aucun sinistre créé pour le moment.{' '}
                  <Link href="/claims/new" className="text-teal-600 font-medium hover:underline">
                    Créer le premier sinistre
                  </Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
