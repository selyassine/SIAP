from fastapi import APIRouter, Depends
from app.api.v1.endpoints.auth import get_current_user
from app.services.monte_carlo_service import MonteCarloService
from app.schemas.monte_carlo import (
    MCStressReportOutput, MCSummaryOutput
)

router = APIRouter(prefix="/api/v1/monte-carlo", tags=["Monte Carlo Stress Testing"])


def get_svc() -> MonteCarloService:
    return MonteCarloService()


@router.get("/report", response_model=MCStressReportOutput)
def get_mc_report(
    _=Depends(get_current_user),
    svc: MonteCarloService = Depends(get_svc),
):
    """
    Rapport Monte Carlo complet : distribution des réserves IBNR,
    métriques Solvabilité II (VaR 95%, VaR 99.5%, CVaR), 3 scénarios de stress,
    histogramme et courbe CDF pour visualisation frontend.
    """
    return svc.get_full_report()


@router.get("/summary", response_model=MCSummaryOutput)
def get_mc_summary(
    _=Depends(get_current_user),
    svc: MonteCarloService = Depends(get_svc),
):
    """Version condensée pour widget dashboard ou carte résumé."""
    return svc.get_summary()


@router.get("/scenarios")
def get_mc_scenarios(
    _=Depends(get_current_user),
    svc: MonteCarloService = Depends(get_svc),
):
    """Les 4 scénarios (Central / Mild / Moderate / Severe) avec percentiles MC."""
    return svc.get_scenarios()


@router.get("/histogram")
def get_mc_histogram(
    _=Depends(get_current_user),
    svc: MonteCarloService = Depends(get_svc),
):
    """Histogramme de la distribution (200 bins) pour graphique frontend."""
    return svc.get_histogram()


@router.get("/cdf")
def get_mc_cdf(
    _=Depends(get_current_user),
    svc: MonteCarloService = Depends(get_svc),
):
    """Courbe CDF complète pour superposition sur histogramme."""
    return svc.get_cdf()
