from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import date

class PortfolioStats(BaseModel):
    total_policies: int
    total_exposure: float
    total_claims: int
    total_claim_amount: float
    total_premium: float

class GlobalKpis(BaseModel):
    frequency: float
    severity: float
    pure_premium: float
    loss_ratio: float
    combined_ratio: float
    expense_ratio: float
    loading_factor: float

class Benchmarks(BaseModel):
    frequency_market: float
    loss_ratio_market: float
    combined_ratio_market: float
    severity_market: float

class GlobalKpisOutput(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    snapshot_date: date
    portfolio: PortfolioStats
    kpis: GlobalKpis
    benchmarks: Benchmarks

class RegionKpiItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    region_code: str
    policies: int
    exposure: float
    claims: int
    claim_amount: float
    premium: float
    frequency: float
    severity: float
    loss_ratio: float
    combined_ratio: float
    risk_level: str

class RegionKpisOutput(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    snapshot_date: date
    regions: list[RegionKpiItem]
    total_regions: int

class YearlyKpiItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    year: int
    total_claims: int
    fraud_claims: int
    fraud_rate_pct: float
    avg_total_claim: float
    loss_ratio: float
    combined_ratio: float

class QuarterlyKpiItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    quarter: str
    total_claims: int
    fraud_claims: int
    avg_claim: float
    fraud_rate_pct: float

class TrendsOutput(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    snapshot_date: date
    annual: list[YearlyKpiItem]
    quarterly: list[QuarterlyKpiItem]

class FraudGlobal(BaseModel):
    total_claims: int
    fraud_claims: int
    fraud_rate_pct: float
    avg_fraud_amount: float
    avg_legit_amount: float

class FraudStatsOutput(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    snapshot_date: date
    global_stats: FraudGlobal
    by_incident_type: list[dict]
    by_severity: list[dict]
    by_state: list[dict]

class ReserveYear(BaseModel):
    ultimate: float
    paid_to_date: float
    ibnr_reserve: float
    development_pct: float

class ReservesSummary(BaseModel):
    total_ibnr: float
    total_premium_cas: float
    ibnr_to_premium_ratio: float

class ReservesOutput(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    snapshot_date: date
    company_name: str
    lob: str
    reserves_by_year: dict[str, ReserveYear]
    premium_by_year: dict[str, float]
    reserve_to_premium: dict[str, Optional[float]]
    summary: ReservesSummary

class DashboardSummaryOutput(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    global_kpis: GlobalKpisOutput
    fraud_stats: FraudStatsOutput
    reserves_summary: ReservesSummary
    top_risky_regions: list[RegionKpiItem]
    latest_yearly_trend: list[YearlyKpiItem]
    quarterly_trend: list[QuarterlyKpiItem]
    reserves_by_year: dict[str, ReserveYear]
