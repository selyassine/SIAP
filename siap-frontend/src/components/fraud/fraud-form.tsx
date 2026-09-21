"use client"
import React, { useRef, useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { FraudInput } from '@/lib/types'
import {
  DEFAULT_FRAUD_INPUT,
  buildFraudInputFromFormData,
  claimsAmountMismatch,
  parseFormField,
} from '@/lib/fraud-form-defaults'
import { User, FileText, Car, Shield, AlertTriangle } from 'lucide-react'

interface FraudFormProps {
  onSubmit: (data: FraudInput) => void
  isLoading: boolean
  submitLabel?: string
  title?: string
  description?: string
  /** Mode contrôlé : state partagé avec le parent (recommandé pour /claims/new) */
  formData?: FraudInput
  onFormDataChange?: React.Dispatch<React.SetStateAction<FraudInput>>
}

export function FraudForm({
  onSubmit,
  isLoading,
  submitLabel = "Analyze Fraud Risk",
  title = "Claim Details",
  description = "Enter the claim information to evaluate the fraud risk.",
  formData: controlledFormData,
  onFormDataChange,
}: FraudFormProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'policy' | 'incident' | 'vehicle'>('profile')
  const [internalData, setInternalData] = useState<FraudInput>(DEFAULT_FRAUD_INPUT)
  const formRef = useRef<HTMLFormElement>(null)

  const isControlled = controlledFormData !== undefined && onFormDataChange !== undefined
  const formData = isControlled ? controlledFormData : internalData

  const formDataRef = useRef(formData)
  useEffect(() => {
    formDataRef.current = formData
  }, [formData])

  const setFormData = (updater: React.SetStateAction<FraudInput>) => {
    if (isControlled && onFormDataChange) {
      onFormDataChange(updater)
    } else {
      setInternalData(updater)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const field = name as keyof FraudInput
    const parsed = type === 'number' ? parseFormField(field, value) : value
    setFormData((prev) => ({ ...prev, [field]: parsed }))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    // Mode contrôlé (/claims/new) : state parent = source de vérité
    // Mode interne (/fraud/detect) : lecture DOM au submit pour éviter désync
    const payload = isControlled
      ? { ...formDataRef.current }
      : formRef.current
        ? buildFraudInputFromFormData(formRef.current)
        : { ...formDataRef.current }
    onSubmit(payload)
  }

  const amountWarning = claimsAmountMismatch(formData)
  const amountSum = formData.injury_claim + formData.property_claim + formData.vehicle_claim

  const tabs = [
    { id: 'profile' as const, label: 'Insured Profile', icon: User },
    { id: 'policy' as const, label: 'Policy Details', icon: Shield },
    { id: 'incident' as const, label: 'Incident', icon: FileText },
    { id: 'vehicle' as const, label: 'Vehicle & Claims', icon: Car },
  ]

  const tabClass = (tab: typeof activeTab) =>
    activeTab === tab ? 'block space-y-4' : 'hidden'

  return (
    <Card className="border border-slate-200/60 bg-white/60 backdrop-blur-xl shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden">
      <CardHeader className="border-b border-slate-200/40 bg-transparent py-5">
        <CardTitle className="text-xl font-bold text-slate-800">{title}</CardTitle>
        <p className="text-sm text-slate-500 mt-1">{description}</p>
      </CardHeader>

      <div className="flex bg-slate-900/5 p-1.5 gap-1 border-b border-slate-200/40 overflow-x-auto">
        {tabs.map((tab) => {
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
                active
                  ? 'bg-white text-teal-600 shadow-sm border border-slate-200/50'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-white/40'
              }`}
              type="button"
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          )
        })}
      </div>

      <CardContent className="p-6">
        <form ref={formRef} onSubmit={handleSubmit}>
          {/* PROFILE */}
          <div className={tabClass('profile')}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age" className="text-slate-600 font-semibold">Âge</Label>
                <Input id="age" type="number" name="age" value={formData.age} onChange={handleInputChange} className="bg-white/50 border-slate-200/80 rounded-xl focus-visible:ring-teal-500/30 focus-visible:border-teal-500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="insured_sex" className="text-slate-600 font-semibold">Sexe</Label>
                <Select id="insured_sex" name="insured_sex" value={formData.insured_sex} onChange={handleInputChange} className="bg-white/50 border-slate-200/80 rounded-xl focus-visible:ring-teal-500/30 focus-visible:border-teal-500 h-11">
                  <option value="MALE">Homme</option>
                  <option value="FEMALE">Femme</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="insured_education_level" className="text-slate-600 font-semibold">Niveau d'Éducation</Label>
                <Input id="insured_education_level" name="insured_education_level" value={formData.insured_education_level} onChange={handleInputChange} className="bg-white/50 border-slate-200/80 rounded-xl focus-visible:ring-teal-500/30 focus-visible:border-teal-500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="insured_occupation" className="text-slate-600 font-semibold">Profession</Label>
                <Input id="insured_occupation" name="insured_occupation" value={formData.insured_occupation} onChange={handleInputChange} className="bg-white/50 border-slate-200/80 rounded-xl focus-visible:ring-teal-500/30 focus-visible:border-teal-500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="insured_hobbies" className="text-slate-600 font-semibold">Loisirs</Label>
                <Input id="insured_hobbies" name="insured_hobbies" value={formData.insured_hobbies} onChange={handleInputChange} className="bg-white/50 border-slate-200/80 rounded-xl focus-visible:ring-teal-500/30 focus-visible:border-teal-500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="months_as_customer" className="text-slate-600 font-semibold">Mois d'Ancienneté Client</Label>
                <Input id="months_as_customer" type="number" name="months_as_customer" value={formData.months_as_customer} onChange={handleInputChange} className="bg-white/50 border-slate-200/80 rounded-xl focus-visible:ring-teal-500/30 focus-visible:border-teal-500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="insured_relationship" className="text-slate-600 font-semibold">Situation Familiale</Label>
                <Input id="insured_relationship" name="insured_relationship" value={formData.insured_relationship} onChange={handleInputChange} className="bg-white/50 border-slate-200/80 rounded-xl focus-visible:ring-teal-500/30 focus-visible:border-teal-500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capital_gains" className="text-slate-600 font-semibold">Gains en Capital</Label>
                <Input id="capital_gains" type="number" name="capital_gains" value={formData.capital_gains} onChange={handleInputChange} className="bg-white/50 border-slate-200/80 rounded-xl focus-visible:ring-teal-500/30 focus-visible:border-teal-500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capital_loss" className="text-slate-600 font-semibold">Pertes en Capital</Label>
                <Input id="capital_loss" type="number" name="capital_loss" value={formData.capital_loss} onChange={handleInputChange} className="bg-white/50 border-slate-200/80 rounded-xl focus-visible:ring-teal-500/30 focus-visible:border-teal-500" />
              </div>
            </div>
          </div>

          {/* POLICY */}
          <div className={tabClass('policy')}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="policy_state" className="text-slate-600 font-semibold">État de la Police</Label>
                <Input id="policy_state" name="policy_state" value={formData.policy_state} onChange={handleInputChange} className="bg-white/50 border-slate-200/80 rounded-xl focus-visible:ring-teal-500/30 focus-visible:border-teal-500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="policy_csl" className="text-slate-600 font-semibold">Limite CSL</Label>
                <Input id="policy_csl" name="policy_csl" value={formData.policy_csl} onChange={handleInputChange} placeholder="ex. 100/300" className="bg-white/50 border-slate-200/80 rounded-xl focus-visible:ring-teal-500/30 focus-visible:border-teal-500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="policy_deductable" className="text-slate-600 font-semibold">Franchise</Label>
                <Input id="policy_deductable" type="number" name="policy_deductable" value={formData.policy_deductable} onChange={handleInputChange} className="bg-white/50 border-slate-200/80 rounded-xl focus-visible:ring-teal-500/30 focus-visible:border-teal-500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="policy_annual_premium" className="text-slate-600 font-semibold">Prime Annuelle (€)</Label>
                <Input id="policy_annual_premium" type="number" name="policy_annual_premium" value={formData.policy_annual_premium} onChange={handleInputChange} className="bg-white/50 border-slate-200/80 rounded-xl focus-visible:ring-teal-500/30 focus-visible:border-teal-500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="umbrella_limit" className="text-slate-600 font-semibold">Limite Umbrella</Label>
                <Input id="umbrella_limit" type="number" name="umbrella_limit" value={formData.umbrella_limit} onChange={handleInputChange} className="bg-white/50 border-slate-200/80 rounded-xl focus-visible:ring-teal-500/30 focus-visible:border-teal-500" />
              </div>
            </div>
          </div>

          {/* INCIDENT */}
          <div className={tabClass('incident')}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="incident_type" className="text-slate-600 font-semibold">Type d'Incident</Label>
                <Select id="incident_type" name="incident_type" value={formData.incident_type} onChange={handleInputChange} className="bg-white/50 border-slate-200/80 rounded-xl focus-visible:ring-teal-500/30 focus-visible:border-teal-500 h-11">
                  <option value="Single Vehicle Collision">Single Vehicle Collision</option>
                  <option value="Multi-vehicle Collision">Multi-vehicle Collision</option>
                  <option value="Parked Car">Parked Car</option>
                  <option value="Vehicle Theft">Vehicle Theft</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="collision_type" className="text-slate-600 font-semibold">Type de Collision</Label>
                <Select id="collision_type" name="collision_type" value={formData.collision_type} onChange={handleInputChange} className="bg-white/50 border-slate-200/80 rounded-xl focus-visible:ring-teal-500/30 focus-visible:border-teal-500 h-11">
                  <option value="Front Collision">Front Collision</option>
                  <option value="Rear Collision">Rear Collision</option>
                  <option value="Side Collision">Side Collision</option>
                  <option value="N/A">N/A</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="incident_severity" className="text-slate-600 font-semibold">Gravité de l'Incident</Label>
                <Select id="incident_severity" name="incident_severity" value={formData.incident_severity} onChange={handleInputChange} className="bg-white/50 border-slate-200/80 rounded-xl focus-visible:ring-teal-500/30 focus-visible:border-teal-500 h-11">
                  <option value="Trivial Damage">Dégâts Superficiels</option>
                  <option value="Minor Damage">Dégâts Mineurs</option>
                  <option value="Major Damage">Dégâts Majeurs</option>
                  <option value="Total Loss">Perte Totale</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="property_damage" className="text-slate-600 font-semibold">Dégâts Matériels Tiers</Label>
                <Select id="property_damage" name="property_damage" value={formData.property_damage} onChange={handleInputChange} className="bg-white/50 border-slate-200/80 rounded-xl focus-visible:ring-teal-500/30 focus-visible:border-teal-500 h-11">
                  <option value="YES">Oui</option>
                  <option value="NO">Non</option>
                  <option value="?">Inconnu</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="incident_state" className="text-slate-600 font-semibold">État de l'Incident</Label>
                <Input id="incident_state" name="incident_state" value={formData.incident_state} onChange={handleInputChange} className="bg-white/50 border-slate-200/80 rounded-xl focus-visible:ring-teal-500/30 focus-visible:border-teal-500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="incident_city" className="text-slate-600 font-semibold">Ville</Label>
                <Input id="incident_city" name="incident_city" value={formData.incident_city} onChange={handleInputChange} className="bg-white/50 border-slate-200/80 rounded-xl focus-visible:ring-teal-500/30 focus-visible:border-teal-500" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="incident_location" className="text-slate-600 font-semibold">Adresse de l'Incident</Label>
                <Input id="incident_location" name="incident_location" value={formData.incident_location} onChange={handleInputChange} className="bg-white/50 border-slate-200/80 rounded-xl focus-visible:ring-teal-500/30 focus-visible:border-teal-500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="authorities_contacted" className="text-slate-600 font-semibold">Autorités Contactées</Label>
                <Input id="authorities_contacted" name="authorities_contacted" value={formData.authorities_contacted} onChange={handleInputChange} className="bg-white/50 border-slate-200/80 rounded-xl focus-visible:ring-teal-500/30 focus-visible:border-teal-500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="police_report_available" className="text-slate-600 font-semibold">Rapport de Police Disponible</Label>
                <Select id="police_report_available" name="police_report_available" value={formData.police_report_available} onChange={handleInputChange} className="bg-white/50 border-slate-200/80 rounded-xl focus-visible:ring-teal-500/30 focus-visible:border-teal-500 h-11">
                  <option value="YES">Oui</option>
                  <option value="NO">Non</option>
                  <option value="?">Inconnu</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="incident_hour_of_the_day" className="text-slate-600 font-semibold">Heure de l'Incident (0-23)</Label>
                <Input id="incident_hour_of_the_day" type="number" name="incident_hour_of_the_day" value={formData.incident_hour_of_the_day} onChange={handleInputChange} className="bg-white/50 border-slate-200/80 rounded-xl focus-visible:ring-teal-500/30 focus-visible:border-teal-500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="number_of_vehicles_involved" className="text-slate-600 font-semibold">Véhicules Impliqués</Label>
                <Input id="number_of_vehicles_involved" type="number" name="number_of_vehicles_involved" value={formData.number_of_vehicles_involved} onChange={handleInputChange} className="bg-white/50 border-slate-200/80 rounded-xl focus-visible:ring-teal-500/30 focus-visible:border-teal-500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="witnesses" className="text-slate-600 font-semibold">Témoins</Label>
                <Input id="witnesses" type="number" name="witnesses" value={formData.witnesses} onChange={handleInputChange} className="bg-white/50 border-slate-200/80 rounded-xl focus-visible:ring-teal-500/30 focus-visible:border-teal-500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bodily_injuries" className="text-slate-600 font-semibold">Blessures Corporelles</Label>
                <Input id="bodily_injuries" type="number" name="bodily_injuries" value={formData.bodily_injuries} onChange={handleInputChange} className="bg-white/50 border-slate-200/80 rounded-xl focus-visible:ring-teal-500/30 focus-visible:border-teal-500" />
              </div>
            </div>
          </div>

          {/* VEHICLE */}
          <div className={tabClass('vehicle')}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="auto_make" className="text-slate-600 font-semibold">Marque Auto</Label>
                <Input id="auto_make" name="auto_make" value={formData.auto_make} onChange={handleInputChange} className="bg-white/50 border-slate-200/80 rounded-xl focus-visible:ring-teal-500/30 focus-visible:border-teal-500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="auto_model" className="text-slate-600 font-semibold">Modèle Auto</Label>
                <Input id="auto_model" name="auto_model" value={formData.auto_model} onChange={handleInputChange} className="bg-white/50 border-slate-200/80 rounded-xl focus-visible:ring-teal-500/30 focus-visible:border-teal-500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="auto_year" className="text-slate-600 font-semibold">Année Modèle</Label>
                <Input id="auto_year" type="number" name="auto_year" value={formData.auto_year} onChange={handleInputChange} className="bg-white/50 border-slate-200/80 rounded-xl focus-visible:ring-teal-500/30 focus-visible:border-teal-500" />
              </div>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-200/40">
              <h4 className="text-sm font-bold text-slate-700 mb-3">Montants Réclamés (€)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="total_claim_amount" className="text-slate-600 font-semibold">Montant Total Réclamé</Label>
                  <Input id="total_claim_amount" type="number" name="total_claim_amount" value={formData.total_claim_amount} onChange={handleInputChange} className="bg-white/50 border-slate-200/80 rounded-xl focus-visible:ring-teal-500/30 focus-visible:border-teal-500" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="injury_claim" className="text-slate-600 font-semibold">Dommages Corporels</Label>
                  <Input id="injury_claim" type="number" name="injury_claim" value={formData.injury_claim} onChange={handleInputChange} className="bg-white/50 border-slate-200/80 rounded-xl focus-visible:ring-teal-500/30 focus-visible:border-teal-500" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="property_claim" className="text-slate-600 font-semibold">Dommages Matériels</Label>
                  <Input id="property_claim" type="number" name="property_claim" value={formData.property_claim} onChange={handleInputChange} className="bg-white/50 border-slate-200/80 rounded-xl focus-visible:ring-teal-500/30 focus-visible:border-teal-500" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicle_claim" className="text-slate-600 font-semibold">Dommages Véhicule</Label>
                  <Input id="vehicle_claim" type="number" name="vehicle_claim" value={formData.vehicle_claim} onChange={handleInputChange} className="bg-white/50 border-slate-200/80 rounded-xl focus-visible:ring-teal-500/30 focus-visible:border-teal-500" />
                </div>
              </div>
              {amountWarning && (
                <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-500/10 px-3 py-2 text-sm text-amber-800">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>
                    Les montants ne correspondent pas : injury + property + vehicle ={' '}
                    {amountSum.toLocaleString('fr-FR')} €, mais total ={' '}
                    {formData.total_claim_amount.toLocaleString('fr-FR')} €.
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto h-11 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 text-white font-bold transition-all active:scale-[0.98]">
              {isLoading ? 'Analyse en cours...' : submitLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
