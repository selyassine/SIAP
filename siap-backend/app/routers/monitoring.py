from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.v1.endpoints.auth import get_current_user
from app.db.session import get_db
from app.services.monitoring_service import MonitoringService
from app.schemas.monitoring import (
    GlobalKpisOutput, RegionKpisOutput, TrendsOutput,
    FraudStatsOutput, ReservesOutput, DashboardSummaryOutput
)

router = APIRouter(prefix="/api/v1/monitoring", tags=["Risk Monitoring"])

def get_svc():
    return MonitoringService.get_instance()

@router.get("/dashboard", response_model=DashboardSummaryOutput)
def get_dashboard(
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
    svc: MonitoringService = Depends(get_svc)
):
    """Endpoint principal — charge tout le dashboard en 1 appel."""
    return svc.get_dashboard_summary(db)

@router.get("/global-kpis", response_model=GlobalKpisOutput)
def get_global_kpis(
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
    svc: MonitoringService = Depends(get_svc)
):
    return svc.get_global_kpis(db)

@router.get("/regions", response_model=RegionKpisOutput)
def get_regions(
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
    svc: MonitoringService = Depends(get_svc)
):
    return svc.get_regions(db)

@router.get("/trends", response_model=TrendsOutput)
def get_trends(
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
    svc: MonitoringService = Depends(get_svc)
):
    return svc.get_trends(db)

@router.get("/fraud-stats", response_model=FraudStatsOutput)
def get_fraud_stats(
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
    svc: MonitoringService = Depends(get_svc)
):
    return svc.get_fraud_stats(db)

@router.get("/reserves", response_model=ReservesOutput)
def get_reserves(
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
    svc: MonitoringService = Depends(get_svc)
):
    return svc.get_reserves(db)
