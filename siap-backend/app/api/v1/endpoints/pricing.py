from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app import crud, schemas
from app.api.v1.endpoints.auth import get_current_user
from app.models.user import User
from app.services.pricing_service import PricingService

router = APIRouter()
pricing_service = PricingService()

@router.post("/predict", response_model=schemas.pricing.PricingOutput)
def predict_premium(
    *,
    input_data: schemas.pricing.PricingInput,
    current_user: User = Depends(get_current_user),
):
    """Calculate premium for a single policy."""
    try:
        result = pricing_service.predict(input_data)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/batch", response_model=schemas.pricing.BatchPricingOutput)
def predict_batch_premium(
    *,
    input_data: schemas.pricing.BatchPricingInput,
    current_user: User = Depends(get_current_user),
):
    """Calculate premium for a batch of policies."""
    try:
        result = pricing_service.predict_batch(input_data.policies)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/model-info", response_model=schemas.pricing.ModelInfo)
def get_model_info(
    current_user: User = Depends(get_current_user),
):
    """Get information about the active models."""
    return {
        "champion": pricing_service.champion,
        "rare_regions": list(pricing_service.rare_regions),
        "rare_brands": list(pricing_service.rare_brands),
        "lib_versions": pricing_service.meta.get("lib_versions", {})
    }
