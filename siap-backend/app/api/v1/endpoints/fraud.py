from fastapi import APIRouter, Depends, HTTPException
from app.schemas.fraud import FraudInput, FraudOutput, BatchFraudInput, BatchFraudOutput
from app.services.fraud_service import fraud_service
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()

@router.post("/detect", response_model=FraudOutput)
def detect_fraud(
    input_data: FraudInput,
    current_user: dict = Depends(get_current_user)
):
    """
    Détection de fraude pour un sinistre unitaire.
    """
    try:
        return fraud_service.predict(input_data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/batch", response_model=BatchFraudOutput)
def detect_fraud_batch(
    batch_input: BatchFraudInput,
    current_user: dict = Depends(get_current_user)
):
    """
    Détection de fraude pour un lot de sinistres (max 50).
    """
    try:
        return fraud_service.predict_batch(batch_input.claims)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/model-info")
def get_model_info(
    current_user: dict = Depends(get_current_user)
):
    """
    Récupérer les informations du modèle XGBoost.
    """
    try:
        return {
            "model_type": "XGBoost Classifier",
            "performance": fraud_service.meta.get("performance", {}),
            "optimal_threshold": fraud_service.meta.get("optimal_threshold", 0.147),
            "top_features": fraud_service.meta.get("top_features", [])[:5],
            "risk_thresholds": fraud_service.meta.get("risk_thresholds", {})
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
