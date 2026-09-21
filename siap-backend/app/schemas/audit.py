from pydantic import BaseModel, ConfigDict
from typing import Optional


class RegulatoryContext(BaseModel):
    gender_directive_compliant: bool
    gender_variable_present: bool
    note: str


class RegionHandling(BaseModel):
    active_regions_count: int
    active_regions: list[str]
    active_regions_testable_count: int
    rare_regions_grouped_count: int
    rare_regions_grouped: list[str]


class RobustnessCheckItem(BaseModel):
    profile: str
    freq_reference: float
    regions_coincidant_avec_reference: list[str]


class DataLimitations(BaseModel):
    note: str
    zero_variance_regions: list[str]
    profile_specific_coincidence_note: str
    robustness_check_results: list[RobustnessCheckItem]


class RegionDisparityItem(BaseModel):
    region: str
    frequency: float
    has_dedicated_coefficient: bool
    ecart_vs_min_pct: float


class RegionalDisparityTest(BaseModel):
    max_disparity_pct: float
    detail_by_region: list[RegionDisparityItem]


class DensityCorrelationItem(BaseModel):
    region: str
    correlation_density: float


class DensityProxyTest(BaseModel):
    strong_proxy_count: int
    correlations: list[DensityCorrelationItem]


class ShapDecompositionTest(BaseModel):
    category_contribution_pct: dict[str, float]
    proxy_total_pct: float


class CounterfactualTest(BaseModel):
    variance_explained_by_region_pct: float
    mean_prediction_change_pct: float


class AuditTests(BaseModel):
    regional_disparity: RegionalDisparityTest
    density_proxy_correlation: DensityProxyTest
    shap_decomposition: ShapDecompositionTest
    counterfactual_region_neutralization: CounterfactualTest


class BiasAuditReportOutput(BaseModel):
    """Rapport d'audit d'équité complet du Module 1."""
    model_config = ConfigDict(from_attributes=True)

    audit_date: str
    model_audited: str
    dataset: str
    regulatory_context: RegulatoryContext
    region_handling: RegionHandling
    data_limitations: DataLimitations
    equity_score: float
    verdict: str
    flags: list[str]
    tests: AuditTests
    variable_classification: dict[str, list[str]]


class AuditSummaryOutput(BaseModel):
    """Version condensée pour affichage rapide (carte dashboard)."""
    equity_score: float
    verdict: str
    flags_count: int
    audit_date: str
    max_regional_disparity_pct: float
    proxy_total_pct: float
