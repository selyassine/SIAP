from fastapi import APIRouter, Depends
from app.api.v1.endpoints.auth import get_current_user
from app.services.audit_service import AuditService
from app.schemas.audit import BiasAuditReportOutput, AuditSummaryOutput


router = APIRouter(prefix="/api/v1/audit", tags=["Conformité & Équité"])


def get_svc() -> AuditService:
    return AuditService.get_instance()


@router.get("/bias-report", response_model=BiasAuditReportOutput)
def get_bias_report(
    _=Depends(get_current_user),
    svc: AuditService = Depends(get_svc),
):
    """
    Rapport d'audit d'équité complet du Module 1 (Smart Pricing).
    Inclut : score d'équité, disparité régionale, décomposition SHAP,
    test contrefactuel, conformité réglementaire (Directive Gender, IA Act).
    """
    return svc.get_full_report()


@router.get("/bias-report/summary", response_model=AuditSummaryOutput)
def get_bias_summary(
    _=Depends(get_current_user),
    svc: AuditService = Depends(get_svc),
):
    """Version condensée pour affichage rapide (carte dashboard)."""
    return svc.get_summary()
