from pydantic import BaseModel, ConfigDict
from typing import Literal, Optional


class DamageDetection(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    class_name: str
    confidence: float
    severity: Literal['Minor', 'Moderate', 'Severe', 'Total Loss']
    bbox: list[float]  # [x1, y1, x2, y2]


class CostEstimate(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    min: float
    central: float
    max: float
    currency: str = 'EUR'


class VisionAnalysisOutput(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    damage_detected: bool
    n_damage_zones: int
    detections: list[DamageDetection]
    overall_severity: Literal[
        'No Damage Detected', 'Minor', 'Moderate', 'Severe', 'Total Loss'
    ]
    cost_estimate: CostEstimate
    confidence_avg: float
    annotated_image_b64: str  # JPEG encodé en base64


class FraudCoherenceInput(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    declared_severity: Literal['Minor', 'Moderate', 'Severe', 'Total Loss']
    declared_amount: float


class FraudCoherenceOutput(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    incoherence_score: float        # 0-100
    visual_severity: str
    declared_severity: str
    visual_cost_estimate: CostEstimate
    declared_amount: float
    alerts: list[str]
    recommendation: Literal[
        'AUTO_APPROVE', 'MANUAL_REVIEW', 'INVESTIGATION_REQUIRED'
    ]
    fraud_flag: bool


class VisionWithFraudOutput(BaseModel):
    """Analyse complète : dégâts + cohérence fraude en 1 appel"""
    model_config = ConfigDict(from_attributes=True)
    visual_analysis: VisionAnalysisOutput
    fraud_coherence: FraudCoherenceOutput


class VisionModelInfoOutput(BaseModel):
    model_config = ConfigDict(from_attributes=True, protected_namespaces=())
    model_type: str
    dataset: str
    n_classes: int
    performance: dict
    severity_mapping: dict
    cost_estimate: dict
