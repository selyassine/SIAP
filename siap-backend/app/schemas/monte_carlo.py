from pydantic import BaseModel, ConfigDict
from typing import Optional, Any


class MCStressReportOutput(BaseModel):
    model_config = ConfigDict(from_attributes=True, extra="allow")
    generated_at: Optional[str] = None
    source: Optional[str] = None
    reserve_reference: Optional[float] = None
    methodology: Optional[Any] = None
    simulation_stats: Optional[Any] = None
    percentiles: Optional[Any] = None
    solvency_metrics: Optional[Any] = None
    scenarios: Optional[list[Any]] = None
    ldf_params: Optional[list[Any]] = None
    histogram: Optional[list[Any]] = None
    cdf_curve: Optional[list[Any]] = None


class MCSummaryOutput(BaseModel):
    model_config = ConfigDict(extra="allow")
    reserve_central: Optional[float] = None
    mean_mc: Optional[float] = None
    var_99_5: Optional[float] = None
    cvar_99_5: Optional[float] = None
    cv_pct: Optional[float] = None
    mean_delta_pct: Optional[float] = None
    capital_buffer_99_5: Optional[float] = None
    capital_buffer_99_5_pct: Optional[float] = None
    generated_at: Optional[str] = None
