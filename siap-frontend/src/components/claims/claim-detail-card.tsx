'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ClaimStatusBadge } from '@/components/claims/claim-status-badge'
import { RiskBadge, AlertBadge } from '@/components/fraud/risk-badge'
import { Button } from '@/components/ui/button'
import { updateClaimStatus } from '@/lib/api'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'

export interface ClaimDetail {
  id: number
  claim_number: string
  incident_type: string
  incident_severity: string
  collision_type: string
  total_claim_amount: number
  injury_claim: number
  property_claim: number
  vehicle_claim: number
  auto_make: string
  auto_model: string
  auto_year: number
  age: number
  policy_state: string
  incident_state: string
  incident_city: string
  incident_location: string
  witnesses: number
  police_report_available: string
  fraud_score: number | null
  fraud_risk_level: string | null
  fraud_alert: boolean
  status: string
  created_at: string
}

interface ClaimDetailCardProps {
  claim: ClaimDetail
  onStatusUpdated: (status: string) => void
}

export function ClaimDetailCard({ claim, onStatusUpdated }: ClaimDetailCardProps) {
  const [updating, setUpdating] = useState(false)

  const handleStatus = async (status: 'pending' | 'reviewed' | 'closed') => {
    setUpdating(true)
    try {
      await updateClaimStatus(claim.id, status)
      onStatusUpdated(status)
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{claim.claim_number}</p>
            <CardTitle className="text-xl">{claim.incident_type}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {claim.incident_city}, {claim.incident_state} — {new Date(claim.created_at).toLocaleString('fr-FR')}
            </p>
          </div>
          <ClaimStatusBadge status={claim.status} />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap items-center gap-4">
            {claim.fraud_risk_level && (
              <RiskBadge level={claim.fraud_risk_level as 'Low' | 'Medium' | 'High' | 'Very High'} />
            )}
            <AlertBadge isAlert={claim.fraud_alert} />
            {claim.fraud_score != null && (
              <span className="text-sm text-muted-foreground">
                Score fraude : <strong className="text-slate-900">{claim.fraud_score.toFixed(1)}</strong>/100
              </span>
            )}
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">Montant total</p>
              <p className="text-lg font-bold">{claim.total_claim_amount.toLocaleString('fr-FR')} €</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">Véhicule</p>
              <p className="text-lg font-bold">{claim.auto_make} {claim.auto_model}</p>
              <p className="text-xs text-muted-foreground">{claim.auto_year}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">Sévérité</p>
              <p className="text-lg font-bold">{claim.incident_severity}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs text-muted-foreground">Assuré</p>
              <p className="text-lg font-bold">{claim.age} ans</p>
              <p className="text-xs text-muted-foreground">{claim.policy_state}</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Détail des montants</h3>
            <div className="grid sm:grid-cols-3 gap-3 text-sm">
              <div className="rounded-lg bg-slate-50 p-3">
                <span className="text-muted-foreground">Blessures : </span>
                <strong>{claim.injury_claim.toLocaleString('fr-FR')} €</strong>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <span className="text-muted-foreground">Biens : </span>
                <strong>{claim.property_claim.toLocaleString('fr-FR')} €</strong>
              </div>
              <div className="rounded-lg bg-slate-50 p-3">
                <span className="text-muted-foreground">Véhicule : </span>
                <strong>{claim.vehicle_claim.toLocaleString('fr-FR')} €</strong>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Workflow de révision</h3>
            <div className="flex flex-wrap gap-2">
              {(['pending', 'reviewed', 'closed'] as const).map((status) => (
                <Button
                  key={status}
                  size="sm"
                  variant={claim.status === status ? 'default' : 'outline'}
                  disabled={updating || claim.status === status}
                  onClick={() => handleStatus(status)}
                >
                  {updating && claim.status !== status && <Loader2 className="h-3 w-3 animate-spin" />}
                  {status === 'pending' ? 'En attente' : status === 'reviewed' ? 'Révisé' : 'Clôturé'}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
