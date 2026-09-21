'use client'
import { FraudForm } from '@/components/fraud/fraud-form'
import { FraudInput } from '@/lib/types'

interface ClaimFormProps {
  formData: FraudInput
  onFormDataChange: React.Dispatch<React.SetStateAction<FraudInput>>
  onSubmit: (data: FraudInput) => void
  isLoading: boolean
  title?: string
  description?: string
  submitLabel?: string
}

export function ClaimForm({ formData, onFormDataChange, onSubmit, isLoading, title, description, submitLabel }: ClaimFormProps) {
  return (
    <FraudForm
      formData={formData}
      onFormDataChange={onFormDataChange}
      onSubmit={onSubmit}
      isLoading={isLoading}
      title={title || "Nouveau Sinistre"}
      description={description || "Remplissez les informations du sinistre. Le score de fraude sera calculé automatiquement à la création (Module 2 — XGBoost)."}
      submitLabel={submitLabel || "Créer le Sinistre"}
    />
  )
}
