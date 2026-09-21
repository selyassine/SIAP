from pydantic import BaseModel, ConfigDict
from typing import Optional


class DriftMethodology(BaseModel):
    split_ref_pct: float
    n_ref: int
    n_recent: int
    psi_stable_threshold: float
    psi_watch_threshold: float
    ks_alpha: float
    variables_monitored: list[str]


class DriftScoreDetail(BaseModel):
    psi_variables: float
    psi_predictions: float
    ks_test: float
    gini: float


class DriftAlert(BaseModel):
    type: str
    variable: str
    message: str
    psi: Optional[float] = None
    status: Optional[str] = None


class PSIResult(BaseModel):
    variable: str
    psi: Optional[float]
    status: str
    mean_ref: Optional[float]
    mean_rec: Optional[float]
    delta_mean_pct: Optional[float]


class PredictionDrift(BaseModel):
    psi: float
    psi_status: str
    ks_statistic: float
    ks_pvalue: float
    drift_detected: bool
    mean_ref: float
    mean_rec: float
    delta_mean_pct: float


class DriftPerformance(BaseModel):
    gini_ref: Optional[float]
    gini_recent: Optional[float]
    gini_delta: Optional[float]
    degradation: bool


class DriftReportOutput(BaseModel):
    model_config = ConfigDict(from_attributes=True, protected_namespaces=())

    generated_at: str
    model_monitored: str
    dataset: str
    methodology: DriftMethodology
    stability_score: float
    stability_class: str       # "STABLE" | "SURVEILLANCE" | "DRIFT"
    stability_color: str       # "VERT" | "AMBRE" | "ROUGE"
    verdict: str
    alerts: list[DriftAlert]
    score_detail: DriftScoreDetail
    psi_results: list[PSIResult]
    prediction_drift: PredictionDrift
    performance: DriftPerformance


class DriftSummaryOutput(BaseModel):
    """Version condensée pour widget /pricing et onglet /audit."""
    stability_score: float
    stability_class: str
    stability_color: str
    verdict: str
    n_alerts: int
    n_variables_stable: int
    n_variables_watch: int
    n_variables_drift: int
    psi_predictions: float
    ks_pvalue: float
    drift_detected: bool
    gini_ref: Optional[float]
    gini_recent: Optional[float]
    gini_delta: Optional[float]
    generated_at: str
