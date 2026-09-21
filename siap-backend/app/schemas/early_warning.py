from pydantic import BaseModel, ConfigDict
from typing import Optional, Any


class EWMethodology(BaseModel):
    model_config = ConfigDict(extra="allow")
    n_recent_years: Optional[int] = None
    split: Optional[str] = None
    alpha_fort: Optional[float] = None
    alpha_modere: Optional[float] = None
    forecast_danger_multiplier: Optional[float] = None
    global_ay_hist: Optional[list[int]] = None
    global_ay_recent: Optional[list[int]] = None
    n_historical_years: Optional[int] = None
    historical_years: Optional[list[int]] = None
    recent_years: Optional[list[int]] = None


class EWAlert(BaseModel):
    model_config = ConfigDict(extra="allow")
    type: Optional[str] = None
    lag: Optional[str] = None
    message: Optional[str] = None


class EWSummary(BaseModel):
    model_config = ConfigDict(extra="allow")
    n_lags_total: Optional[int] = None
    n_lags_valid: Optional[int] = None
    n_alerts_forte: Optional[int] = None
    n_alerts_modere: Optional[int] = None
    n_trends_hausse: Optional[int] = None
    n_forecast_danger: Optional[int] = None
    max_ecart_pct: Optional[float] = None
    n_lags_tested: Optional[int] = None


class EWReserves(BaseModel):
    model_config = ConfigDict(extra="allow")
    standard: Optional[float] = None
    historical_ldfs: Optional[float] = None
    recent_ldfs: Optional[float] = None
    delta_hist_pct: Optional[float] = None
    delta_recent_pct: Optional[float] = None
    uncertainty_range: Optional[float] = None
    uncertainty_pct: Optional[float] = None
    delta_hist_vs_std_pct: Optional[float] = None
    delta_recent_vs_std_pct: Optional[float] = None


class EWLagDetail(BaseModel):
    model_config = ConfigDict(extra="allow")
    lag: Optional[str] = None
    lag_num: Optional[int] = None
    n_hist: Optional[int] = None
    n_recent: Optional[int] = None
    mean_hist: Optional[float] = None
    mean_recent: Optional[float] = None
    std_hist: Optional[float] = None
    std_recent: Optional[float] = None
    ecart_pct: Optional[float] = None
    t_stat: Optional[float] = None
    p_value: Optional[float] = None
    alert_level: Optional[str] = None
    slope: Optional[float] = None
    r_squared: Optional[float] = None
    trend_pvalue: Optional[float] = None
    trend_dir: Optional[str] = None
    trend_signif: Optional[bool] = None
    forecast_1998: Optional[float] = None
    forecast_1999: Optional[float] = None
    danger_threshold: Optional[float] = None
    forecast_danger: Optional[bool] = None


class EWLDFPoint(BaseModel):
    model_config = ConfigDict(extra="allow")
    year: Optional[int] = None
    ldf: Optional[float] = None


class EWLDFSeries(BaseModel):
    model_config = ConfigDict(extra="allow")
    historical: Optional[list[EWLDFPoint]] = None
    recent: Optional[list[EWLDFPoint]] = None
    forecast: Optional[list[EWLDFPoint]] = None
    mean_hist: Optional[float] = None
    mean_recent: Optional[float] = None
    danger_threshold: Optional[float] = None


class EarlyWarningReportOutput(BaseModel):
    model_config = ConfigDict(from_attributes=True, extra="allow")
    generated_at: Optional[str] = None
    source: Optional[str] = None
    methodology: Optional[EWMethodology] = None
    global_score: Optional[float] = None
    classification: Optional[str] = None
    verdict: Optional[str] = None
    alerts: Optional[list[EWAlert]] = None
    summary: Optional[EWSummary] = None
    reserves: Optional[EWReserves] = None
    lag_details: Optional[list[EWLagDetail]] = None
    ldf_series: Optional[dict[str, EWLDFSeries]] = None


class EarlyWarningSummaryOutput(BaseModel):
    model_config = ConfigDict(extra="allow")
    global_score: Optional[float] = None
    classification: Optional[str] = None
    verdict: Optional[str] = None
    n_alerts_forte: Optional[int] = None
    n_alerts_modere: Optional[int] = None
    n_forecast_danger: Optional[int] = None
    reserve_standard: Optional[float] = None
    reserve_recent: Optional[float] = None
    delta_recent_pct: Optional[float] = None
    uncertainty_pct: Optional[float] = None
    generated_at: Optional[str] = None
