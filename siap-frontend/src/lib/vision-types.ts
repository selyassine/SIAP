// Vision types matching backend schemas
export interface DamageDetection {
  class_name: string;
  confidence: number;
  severity: 'Minor' | 'Moderate' | 'Severe' | 'Total Loss';
  bbox: [number, number, number, number];
}

export interface CostEstimate {
  min: number;
  central: number;
  max: number;
  currency: string;
}

export interface VisionAnalysisOutput {
  damage_detected: boolean;
  n_damage_zones: number;
  detections: DamageDetection[];
  overall_severity: 'No Damage Detected' | 'Minor' | 'Moderate' | 'Severe' | 'Total Loss';
  cost_estimate: CostEstimate;
  confidence_avg: number;
  annotated_image_b64: string;
}

export interface FraudCoherenceOutput {
  incoherence_score: number;
  visual_severity: string;
  declared_severity: string;
  visual_cost_estimate: CostEstimate;
  declared_amount: number;
  alerts: string[];
  recommendation: 'AUTO_APPROVE' | 'MANUAL_REVIEW' | 'INVESTIGATION_REQUIRED';
  fraud_flag: boolean;
}

export interface VisionWithFraudOutput {
  visual_analysis: VisionAnalysisOutput;
  fraud_coherence: FraudCoherenceOutput;
}

export type DeclaredSeverity = 'Minor' | 'Moderate' | 'Severe' | 'Total Loss';
