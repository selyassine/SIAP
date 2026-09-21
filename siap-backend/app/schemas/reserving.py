from pydantic import BaseModel, Field
from typing import Optional
from datetime import date

# --- Sous-schemas réutilisables ---

class ChainLadderResult(BaseModel):
    ldf: list[float]
    cdf: list[float]
    ultimate_by_year: dict[str, float]
    reserve_by_year: dict[str, Optional[float]]
    total_reserve: float

class MackResult(BaseModel):
    total_reserve: float
    total_std_error: float
    ci_95_lower: float
    ci_95_upper: float
    by_year: dict[str, dict]   # {year: {reserve_ibnr, std_error}}

class BFResult(BaseModel):
    apriori_loss_ratio: float
    total_reserve: float
    by_year: dict[str, Optional[float]]

class BootstrapHistogram(BaseModel):
    bins: list[float]    # 41 valeurs
    counts: list[int]    # 40 valeurs

class BootstrapResult(BaseModel):
    n_sims: int
    mean_reserve: float
    std_reserve: float
    percentiles: dict[str, float]   # {"5": x, "25": x, ...}
    histogram: BootstrapHistogram

class BacktestByYear(BaseModel):
    ultimate: float
    actual_ultimate: float
    error_pct: float

class BacktestResult(BaseModel):
    mape_pct: float
    by_year: dict[str, BacktestByYear]

class TriangleData(BaseModel):
    origin_years: list[int]
    development_lags: list[int]
    cumulative_paid: list[list[Optional[float]]]

# --- Outputs des endpoints ---

class CompanyInfo(BaseModel):
    grcode: int
    name: str
    line_of_business: str

class ReservingSummaryOutput(BaseModel):
    company: CompanyInfo
    snapshot_date: date
    chain_ladder: ChainLadderResult
    mack: MackResult
    bornhuetter_ferguson: BFResult
    bootstrap: BootstrapResult
    backtest: BacktestResult

class TriangleOutput(BaseModel):
    company: CompanyInfo
    snapshot_date: date
    triangle: TriangleData

class BootstrapOutput(BaseModel):
    company: CompanyInfo
    n_sims: int
    mean_reserve: float
    std_reserve: float
    percentiles: dict[str, float]
    histogram: BootstrapHistogram

class BacktestOutput(BaseModel):
    company: CompanyInfo
    mape_pct: float
    by_year: dict[str, BacktestByYear]

class ModelInfoOutput(BaseModel):
    available_grcodes: list[int]
    companies: list[CompanyInfo]
    methods: list[str]
    artifacts: list[str]
