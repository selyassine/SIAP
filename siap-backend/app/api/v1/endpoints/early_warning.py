from fastapi import APIRouter, Depends, Query
from app.api.v1.endpoints.auth import get_current_user
from app.services.early_warning_service import EarlyWarningService
from app.schemas.early_warning import (
    EarlyWarningReportOutput,
    EarlyWarningSummaryOutput,
)

router = APIRouter(
    prefix="/api/v1/early-warning",
    tags=["Reserve Risk Early Warning"],
)


def get_svc() -> EarlyWarningService:
    return EarlyWarningService()


@router.get("/report", response_model=EarlyWarningReportOutput)
def get_full_report(
    _=Depends(get_current_user),
    svc: EarlyWarningService = Depends(get_svc),
):
    """
    Rapport complet Early Warning :
    LDFs historiques vs récents, tests de Student, tendances OLS,
    3 scénarios de réserves, forecast +2 ans, score de risque global.
    """
    return svc.get_full_report()


@router.get("/summary", response_model=EarlyWarningSummaryOutput)
def get_summary(
    _=Depends(get_current_user),
    svc: EarlyWarningService = Depends(get_svc),
):
    """
    Résumé condensé — pour widget dans la page /reserving
    et carte sur le dashboard principal.
    """
    return svc.get_summary()


@router.get("/lag-details")
def get_lag_details(
    _=Depends(get_current_user),
    svc: EarlyWarningService = Depends(get_svc),
):
    """Détail statistique par lag (t-test, OLS, forecast)."""
    return svc.get_lag_details()


@router.get("/ldf-series")
def get_ldf_series(
    lag: str | None = Query(None, description="Ex: '2->3'. Omis = tous les lags."),
    _=Depends(get_current_user),
    svc: EarlyWarningService = Depends(get_svc),
):
    """
    Séries temporelles LDF par lag — pour graphiques frontend.
    Inclut : historique, récent, forecast 1998-1999, seuil de danger.
    """
    return svc.get_ldf_series(lag)
