from fastapi import APIRouter, Depends
from app.api.v1.endpoints.auth import get_current_user
from app.services.drift_service import DriftService
from app.schemas.drift import DriftReportOutput, DriftSummaryOutput

router = APIRouter(
    prefix="/api/v1/drift",
    tags=["Model Drift Monitoring"],
)


def get_svc() -> DriftService:
    return DriftService()


@router.get("/report", response_model=DriftReportOutput)
def get_drift_report(
    _=Depends(get_current_user),
    svc: DriftService = Depends(get_svc),
):
    """
    Rapport complet Model Drift :
    PSI par variable, KS test prédictions, Gini, score de stabilité global.
    """
    return svc.get_full_report()


@router.get("/summary", response_model=DriftSummaryOutput)
def get_drift_summary(
    _=Depends(get_current_user),
    svc: DriftService = Depends(get_svc),
):
    """
    Résumé condensé — pour widget dans /pricing et onglet dans /audit.
    """
    return svc.get_summary()
