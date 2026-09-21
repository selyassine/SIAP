from pydantic import BaseModel, Field, ConfigDict
from typing import List, Dict, Any

class FraudInput(BaseModel):
    # Profil assuré
    months_as_customer: int
    age: int
    policy_state: str
    policy_csl: str
    policy_deductable: int
    policy_annual_premium: float
    umbrella_limit: int
    insured_sex: str
    insured_education_level: str
    insured_occupation: str
    insured_hobbies: str
    insured_relationship: str
    capital_gains: float
    capital_loss: float

    # Sinistre
    incident_type: str
    collision_type: str
    incident_severity: str
    authorities_contacted: str
    incident_state: str
    incident_city: str
    incident_location: str
    incident_hour_of_the_day: int
    number_of_vehicles_involved: int
    property_damage: str
    bodily_injuries: int
    witnesses: int
    police_report_available: str
    total_claim_amount: float
    injury_claim: float
    property_claim: float
    vehicle_claim: float

    # Véhicule
    auto_make: str
    auto_model: str
    auto_year: int

    model_config = ConfigDict(from_attributes=True, protected_namespaces=())

class FraudOutput(BaseModel):
    fraud_score: float
    risk_level: str
    fraud_probability: float
    alert: bool
    top_risk_factors: List[str]
    model_performance: Dict[str, float]

    model_config = ConfigDict(from_attributes=True, protected_namespaces=())

class BatchFraudInput(BaseModel):
    claims: List[FraudInput] = Field(..., max_length=50)

    model_config = ConfigDict(from_attributes=True, protected_namespaces=())

class BatchFraudOutput(BaseModel):
    results: List[FraudOutput]
    summary: Dict[str, Any]

    model_config = ConfigDict(from_attributes=True, protected_namespaces=())
