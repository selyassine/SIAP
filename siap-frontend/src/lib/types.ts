export interface PricingInput {
  veh_power: number;
  veh_age: number;
  driv_age: number;
  bonus_malus: number;
  density: number;
  area: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  veh_brand: string;
  veh_gas: 'Diesel' | 'Regular';
  region: string;
  exposure: number;
}

export interface PricingOutput {
  pure_premium: number;
  commercial_premium: number;
  frequency: number;
  severity: number;
  risk_level: 'Low' | 'Medium' | 'High' | 'Very High';
  model_used: string;
  loading_factor: number;
}

export interface BatchPricingOutput {
  results: PricingOutput[];
  summary: {
    total_pure_premium: number;
    avg_pure_premium: number;
    count: number;
  };
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  company: string | null;
  role: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token?: string;
  token_type: string;
}

// ─── Module 3: IBNR Reserving ─────────────────────────────────

export interface CompanyInfo {
  grcode: number;
  name: string;
  line_of_business: string;
}

export interface ChainLadderResult {
  ldf: number[];
  cdf: number[];
  ultimate_by_year: Record<string, number>;
  reserve_by_year: Record<string, number | null>;
  total_reserve: number;
}

export interface MackResult {
  total_reserve: number;
  total_std_error: number;
  ci_95_lower: number;
  ci_95_upper: number;
  by_year: Record<string, { reserve_ibnr: number | null; std_error: number | null }>;
}

export interface BFResult {
  apriori_loss_ratio: number;
  total_reserve: number;
  by_year: Record<string, number | null>;
}

export interface BootstrapHistogram {
  bins: number[];
  counts: number[];
}

export interface BootstrapResult {
  n_sims: number;
  mean_reserve: number;
  std_reserve: number;
  percentiles: Record<string, number>;
  histogram: BootstrapHistogram;
}

export interface BacktestByYear {
  ultimate: number;
  actual_ultimate: number;
  error_pct: number;
}

export interface BacktestResult {
  mape_pct: number;
  by_year: Record<string, BacktestByYear>;
}

export interface TriangleData {
  origin_years: number[];
  development_lags: number[];
  cumulative_paid: (number | null)[][];
}

export interface ReservingSummaryOutput {
  company: CompanyInfo;
  snapshot_date: string;
  chain_ladder: ChainLadderResult;
  mack: MackResult;
  bornhuetter_ferguson: BFResult;
  bootstrap: BootstrapResult;
  backtest: BacktestResult;
}

export interface TriangleOutput {
  company: CompanyInfo;
  snapshot_date: string;
  triangle: TriangleData;
}

export interface BootstrapOutput {
  company: CompanyInfo;
  n_sims: number;
  mean_reserve: number;
  std_reserve: number;
  percentiles: Record<string, number>;
  histogram: BootstrapHistogram;
}

export interface BacktestOutput {
  company: CompanyInfo;
  mape_pct: number;
  by_year: Record<string, BacktestByYear>;
}

export interface ModelInfoOutput {
  available_grcodes: number[];
  companies: CompanyInfo[];
  methods: string[];
  artifacts: string[];
}

// ─── Module 2: Fraud Detection ─────────────────────────────────

export interface FraudInput {
  months_as_customer: number;
  age: number;
  policy_state: string;
  policy_csl: string;
  policy_deductable: number;
  policy_annual_premium: number;
  umbrella_limit: number;
  insured_sex: string;
  insured_education_level: string;
  insured_occupation: string;
  insured_hobbies: string;
  insured_relationship: string;
  capital_gains: number;
  capital_loss: number;
  incident_type: string;
  collision_type: string;
  incident_severity: string;
  authorities_contacted: string;
  incident_state: string;
  incident_city: string;
  incident_location: string;
  incident_hour_of_the_day: number;
  number_of_vehicles_involved: number;
  property_damage: string;
  bodily_injuries: number;
  witnesses: number;
  police_report_available: string;
  total_claim_amount: number;
  injury_claim: number;
  property_claim: number;
  vehicle_claim: number;
  auto_make: string;
  auto_model: string;
  auto_year: number;
}

export interface FraudOutput {
  fraud_score: number;
  risk_level: 'Low' | 'Medium' | 'High' | 'Very High';
  fraud_probability: number;
  alert: boolean;
  top_risk_factors: string[];
  model_performance: Record<string, number>;
}

export interface BatchFraudOutput {
  results: FraudOutput[];
  summary: {
    total_claims: number;
    alerts_raised: number;
    alert_rate: number;
    avg_fraud_score: number;
  };
}

export interface FraudModelInfo {
  model_type: string;
  performance: Record<string, number>;
  optimal_threshold: number;
  top_features: Array<{feature: string; importance: number}>;
  risk_thresholds: Record<string, [number, number]>;
}

export interface RegionKpiItem { region_code: string; policies: number; exposure: number; claims: number; claim_amount: number; premium: number; frequency: number; severity: number; loss_ratio: number; combined_ratio: number; risk_level: string; }
export interface YearlyKpiItem { year: number; total_claims: number; fraud_claims: number; fraud_rate_pct: number; avg_total_claim: number; loss_ratio: number; combined_ratio: number; }
export interface QuarterlyKpiItem { quarter: string; total_claims: number; fraud_claims: number; avg_claim: number; fraud_rate_pct: number; }
