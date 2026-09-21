from pydantic import BaseModel, ConfigDict
from typing import Optional, Literal
from datetime import datetime


class ClaimCreate(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    months_as_customer: int
    age: int
    policy_state: str
    policy_csl: str
    policy_deductable: int
    policy_annual_premium: float
    umbrella_limit: int
    insured_sex: Literal["MALE", "FEMALE"]
    insured_education_level: str
    insured_occupation: str
    insured_hobbies: str
    insured_relationship: str
    capital_gains: float
    capital_loss: float

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

    auto_make: str
    auto_model: str
    auto_year: int


class ClaimOutput(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    claim_number: str
    incident_type: str
    incident_severity: str
    total_claim_amount: float
    auto_make: str
    auto_model: str
    auto_year: int

    fraud_score: Optional[float]
    fraud_risk_level: Optional[str]
    fraud_alert: bool

    status: str
    created_at: datetime


class ClaimDetail(ClaimOutput):
    age: int
    policy_state: str
    incident_state: str
    incident_city: str
    witnesses: int
    police_report_available: str
    injury_claim: float
    property_claim: float
    vehicle_claim: float
    collision_type: str
    authorities_contacted: str
    incident_location: str
    incident_hour_of_the_day: int
    number_of_vehicles_involved: int
    property_damage: str
    bodily_injuries: int
    months_as_customer: int
    policy_csl: str
    policy_deductable: int
    policy_annual_premium: float
    insured_sex: str
    insured_education_level: str
    insured_occupation: str


class ClaimsListOutput(BaseModel):
    claims: list[ClaimOutput]
    total: int
    page: int
    page_size: int


class ClaimsStatsOutput(BaseModel):
    total_claims: int
    total_amount: float
    avg_fraud_score: float
    alerts_count: int
    by_risk_level: dict[str, int]
    by_status: dict[str, int]
