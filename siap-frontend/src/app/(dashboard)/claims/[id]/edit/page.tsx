'use client'
import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ClaimForm } from '@/components/claims/claim-form'
import { PageHeader } from '@/components/layout/page-header'
import { FraudInput } from '@/lib/types'
import { getClaimDetail, updateClaim } from '@/lib/api'

export default function EditClaimPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  const claimId = parseInt(id, 10)

  const [form, setForm] = useState<FraudInput | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    if (isNaN(claimId)) {
      setFetchError("ID de sinistre invalide.")
      return
    }
    getClaimDetail(claimId)
      .then(data => {
        const formData: FraudInput = {
          months_as_customer: data.months_as_customer,
          age: data.age,
          policy_state: data.policy_state,
          policy_csl: data.policy_csl,
          policy_deductable: data.policy_deductable,
          policy_annual_premium: data.policy_annual_premium,
          umbrella_limit: 0,
          insured_sex: data.insured_sex as "MALE" | "FEMALE",
          insured_education_level: data.insured_education_level,
          insured_occupation: data.insured_occupation,
          insured_hobbies: "reading",
          insured_relationship: "husband",
          capital_gains: 0,
          capital_loss: 0,
          incident_type: data.incident_type,
          collision_type: data.collision_type,
          incident_severity: data.incident_severity,
          authorities_contacted: data.authorities_contacted,
          incident_state: data.incident_state,
          incident_city: data.incident_city,
          incident_location: data.incident_location,
          incident_hour_of_the_day: data.incident_hour_of_the_day,
          number_of_vehicles_involved: data.number_of_vehicles_involved,
          property_damage: data.property_damage,
          bodily_injuries: data.bodily_injuries,
          witnesses: data.witnesses,
          police_report_available: data.police_report_available,
          total_claim_amount: data.total_claim_amount,
          injury_claim: data.injury_claim,
          property_claim: data.property_claim,
          vehicle_claim: data.vehicle_claim,
          auto_make: data.auto_make,
          auto_model: data.auto_model,
          auto_year: data.auto_year,
        }
        setForm(formData)
      })
      .catch(err => {
        console.error(err)
        setFetchError("Impossible de charger le sinistre.")
      })
  }, [claimId])

  const handleSubmit = async (data: FraudInput) => {
    setLoading(true)
    setError(null)
    try {
      await updateClaim(claimId, data)
      router.push(`/claims/${claimId}`)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  if (fetchError) {
    return (
      <div className="p-8 text-center text-red-600">
        <p>{fetchError}</p>
        <Link href="/claims" className="text-sm underline mt-4 inline-block">Retour aux sinistres</Link>
      </div>
    )
  }

  if (!form) {
    return <div className="p-8 text-center text-gray-500">Chargement des données...</div>
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <Link href="/claims" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-slate-900 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Retour aux sinistres
      </Link>

      <PageHeader
        title={`Modifier Sinistre #${claimId}`}
        description="Mettez à jour les informations du sinistre. Le score de fraude sera recalculé automatiquement (Module 2)."
      />

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <ClaimForm
        formData={form}
        onFormDataChange={setForm as React.Dispatch<React.SetStateAction<FraudInput>>}
        onSubmit={handleSubmit}
        isLoading={loading}
        title="Modifier les Informations"
        description="Ajustez les détails du sinistre ci-dessous."
        submitLabel="Enregistrer les Modifications"
      />
    </div>
  )
}