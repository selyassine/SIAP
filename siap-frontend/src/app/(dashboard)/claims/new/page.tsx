'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ClaimForm } from '@/components/claims/claim-form'
import { PageHeader } from '@/components/layout/page-header'
import { FraudInput } from '@/lib/types'
import { DEFAULT_FRAUD_INPUT } from '@/lib/fraud-form-defaults'
import { createClaim } from '@/lib/api'

export default function NewClaimPage() {
  const router = useRouter()
  const [form, setForm] = useState<FraudInput>({ ...DEFAULT_FRAUD_INPUT })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (data: FraudInput) => {
    console.log('Données envoyées à l\'API :', data)

    setLoading(true)
    setError(null)
    try {
      const claim = await createClaim(data)
      router.push(`/claims/${claim.id}`)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <Link href="/claims" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-slate-900 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Retour aux sinistres
      </Link>

      <PageHeader
        title="Nouveau Sinistre"
        description="Le score de fraude sera calculé automatiquement à la création (Module 2 — XGBoost, AUC=0.82)."
      />

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <ClaimForm
        formData={form}
        onFormDataChange={setForm}
        onSubmit={handleSubmit}
        isLoading={loading}
      />
    </div>
  )
}
