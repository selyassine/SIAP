'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { ClaimDetailCard, ClaimDetail } from '@/components/claims/claim-detail-card'
import { getClaimDetail } from '@/lib/api'

export default function ClaimDetailPage() {
  const params = useParams()
  const id = Number(params.id)
  const [claim, setClaim] = useState<ClaimDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    getClaimDetail(id)
      .then(setClaim)
      .catch(() => setError('Sinistre introuvable'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin mr-2" /> Chargement…
      </div>
    )
  }

  if (error || !claim) {
    return (
      <div className="text-center py-24">
        <p className="text-muted-foreground mb-4">{error || 'Sinistre introuvable'}</p>
        <Link href="/claims" className="text-teal-600 font-medium hover:underline">
          Retour à la liste
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <Link href="/claims" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-slate-900 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Retour aux sinistres
      </Link>
      <ClaimDetailCard
        claim={claim}
        onStatusUpdated={(status) => setClaim({ ...claim, status })}
      />
    </div>
  )
}
