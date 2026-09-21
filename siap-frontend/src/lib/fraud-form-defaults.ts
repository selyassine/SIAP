import { FraudInput } from './types'

export const DEFAULT_FRAUD_INPUT: FraudInput = {
  months_as_customer: 120,
  age: 35,
  policy_state: 'OH',
  policy_csl: '250/500',
  policy_deductable: 1000,
  policy_annual_premium: 1400.0,
  umbrella_limit: 0,
  insured_sex: 'MALE',
  insured_education_level: 'MD',
  insured_occupation: 'craft-repair',
  insured_hobbies: 'reading',
  insured_relationship: 'husband',
  capital_gains: 0,
  capital_loss: 0,
  incident_type: 'Multi-vehicle Collision',
  collision_type: 'Rear Collision',
  incident_severity: 'Minor Damage',
  authorities_contacted: 'Police',
  incident_state: 'NY',
  incident_city: 'Arlington',
  incident_location: '9935 4th Drive',
  incident_hour_of_the_day: 12,
  number_of_vehicles_involved: 3,
  property_damage: '?',
  bodily_injuries: 1,
  witnesses: 2,
  police_report_available: 'YES',
  total_claim_amount: 50000,
  injury_claim: 10000,
  property_claim: 10000,
  vehicle_claim: 30000,
  auto_make: 'Saab',
  auto_model: '92x',
  auto_year: 2004,
}

export const FRAUD_NUMERIC_FIELDS: (keyof FraudInput)[] = [
  'months_as_customer', 'age', 'policy_deductable', 'policy_annual_premium',
  'umbrella_limit', 'capital_gains', 'capital_loss', 'incident_hour_of_the_day',
  'number_of_vehicles_involved', 'bodily_injuries', 'witnesses',
  'total_claim_amount', 'injury_claim', 'property_claim', 'vehicle_claim', 'auto_year',
]

export function parseFormField(name: keyof FraudInput, raw: string): string | number {
  if (FRAUD_NUMERIC_FIELDS.includes(name)) {
    const n = parseFloat(raw)
    return isNaN(n) ? 0 : n
  }
  return raw
}

export function buildFraudInputFromFormData(form: HTMLFormElement): FraudInput {
  const fd = new FormData(form)
  const result = { ...DEFAULT_FRAUD_INPUT }

  for (const key of Object.keys(DEFAULT_FRAUD_INPUT) as (keyof FraudInput)[]) {
    const raw = fd.get(key)
    if (raw !== null && raw !== undefined) {
      result[key] = parseFormField(key, String(raw)) as never
    }
  }

  return result
}

export function claimsAmountMismatch(form: FraudInput): boolean {
  const sum = form.injury_claim + form.property_claim + form.vehicle_claim
  return Math.abs(sum - form.total_claim_amount) > 0.01
}
