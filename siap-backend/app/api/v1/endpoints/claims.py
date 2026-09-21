from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.v1.endpoints.auth import get_current_user
from app.db.session import get_db
from app.services.claims_service import ClaimsService
from app.schemas.claim import (
    ClaimCreate, ClaimOutput, ClaimDetail,
    ClaimsListOutput, ClaimsStatsOutput
)

router = APIRouter(prefix="/api/v1/claims", tags=["Claims Management"])


def get_svc() -> ClaimsService:
    return ClaimsService()


@router.post("/create", response_model=ClaimOutput, status_code=201)
def create_claim(
    claim: ClaimCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    svc: ClaimsService = Depends(get_svc),
):
    try:
        new_claim = svc.create_claim(
            claim, db, user_id=getattr(current_user, "id", None)
        )
        return new_claim
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la création du sinistre : {str(e)}"
        )


@router.get("/recent", response_model=ClaimsListOutput)
def get_recent_claims(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
    svc: ClaimsService = Depends(get_svc),
):
    return svc.get_recent_claims(db, page, page_size)


@router.get("/stats", response_model=ClaimsStatsOutput)
def get_claims_stats(
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
    svc: ClaimsService = Depends(get_svc),
):
    return svc.get_stats(db)


@router.get("/{claim_id}", response_model=ClaimDetail)
def get_claim_detail(
    claim_id: int,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
    svc: ClaimsService = Depends(get_svc),
):
    claim = svc.get_claim_detail(claim_id, db)
    if not claim:
        raise HTTPException(status_code=404, detail="Sinistre non trouvé")
    return claim


@router.put("/{claim_id}", response_model=ClaimOutput)
def update_claim(
    claim_id: int,
    claim_data: ClaimCreate,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
    svc: ClaimsService = Depends(get_svc),
):
    try:
        updated = svc.update_claim(claim_id, claim_data, db)
        if not updated:
            raise HTTPException(status_code=404, detail="Sinistre non trouvé")
        return updated
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{claim_id}", status_code=204)
def delete_claim(
    claim_id: int,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
    svc: ClaimsService = Depends(get_svc),
):
    deleted = svc.delete_claim(claim_id, db)
    if not deleted:
        raise HTTPException(status_code=404, detail="Sinistre non trouvé")
    return None


@router.patch("/{claim_id}/status", response_model=ClaimOutput)
def update_claim_status(
    claim_id: int,
    status: str = Query(..., pattern="^(pending|reviewed|closed)$"),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
    svc: ClaimsService = Depends(get_svc),
):
    claim = svc.update_status(claim_id, status, db)
    if not claim:
        raise HTTPException(status_code=404, detail="Sinistre non trouvé")
    return claim
