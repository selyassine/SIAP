from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.api.v1.endpoints.auth import get_current_user
from app.db.session import get_db
from app.services.reserving_service import ReservingService
from app.schemas.reserving import (
    ReservingSummaryOutput, TriangleOutput,
    BootstrapOutput, BacktestOutput, ModelInfoOutput
)

router = APIRouter(prefix="/api/v1/reserving", tags=["IBNR Reserving"])

def get_service() -> ReservingService:
    return ReservingService.get_instance()

@router.get("/model-info", response_model=ModelInfoOutput)
def model_info(
    db: Session = Depends(get_db),
    _: dict = Depends(get_current_user),
    svc: ReservingService = Depends(get_service)
):
    return svc.get_model_info(db)

@router.get("/summary", response_model=ReservingSummaryOutput)
def get_summary(
    grcode: int = Query(..., description="Company GRCODE"),
    db: Session = Depends(get_db),
    _: dict = Depends(get_current_user),
    svc: ReservingService = Depends(get_service)
):
    return svc.get_summary(db, grcode)

@router.get("/triangle", response_model=TriangleOutput)
def get_triangle(
    grcode: int = Query(...),
    db: Session = Depends(get_db),
    _: dict = Depends(get_current_user),
    svc: ReservingService = Depends(get_service)
):
    return svc.get_triangle(db, grcode)

@router.get("/bootstrap", response_model=BootstrapOutput)
def get_bootstrap(
    grcode: int = Query(...),
    db: Session = Depends(get_db),
    _: dict = Depends(get_current_user),
    svc: ReservingService = Depends(get_service)
):
    return svc.get_bootstrap(db, grcode)

@router.get("/backtest", response_model=BacktestOutput)
def get_backtest(
    grcode: int = Query(...),
    db: Session = Depends(get_db),
    _: dict = Depends(get_current_user),
    svc: ReservingService = Depends(get_service)
):
    return svc.get_backtest(db, grcode)
