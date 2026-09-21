from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Query
from app.api.v1.endpoints.auth import get_current_user
from app.services.vision_service import VisionService
from app.schemas.vision import (
    VisionAnalysisOutput,
    VisionWithFraudOutput,
    VisionModelInfoOutput,
)

router = APIRouter(prefix="/api/v1/vision", tags=["Computer Vision"])

ALLOWED_TYPES = {'image/jpeg', 'image/png', 'image/webp', 'image/jpg'}
MAX_SIZE_MB = 10


def get_svc() -> VisionService:
    return VisionService.get_instance()


@router.post("/analyze", response_model=VisionAnalysisOutput)
async def analyze_damage(
    file: UploadFile = File(...),
    _=Depends(get_current_user),
    svc: VisionService = Depends(get_svc),
):
    """
    Analyser une photo de véhicule.

    Retourne les dégâts détectés, sévérité globale, coût estimé
    et l'image annotée avec les bounding boxes (base64 JPEG).
    """
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=415,
            detail=(
                f"Type de fichier non supporté : {file.content_type}. "
                f"Acceptés : JPEG, PNG, WebP"
            ),
        )

    contents = await file.read()

    if len(contents) > MAX_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=413,
            detail=f"Image trop grande (max {MAX_SIZE_MB} MB)",
        )

    try:
        result = svc.analyze(contents)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de l'analyse : {str(e)}",
        )


@router.post("/analyze-with-fraud", response_model=VisionWithFraudOutput)
async def analyze_damage_with_fraud(
    declared_severity: str = Query(..., description="Minor | Moderate | Severe | Total Loss"),
    declared_amount: float = Query(..., description="Montant réclamé en euros"),
    file: UploadFile = File(...),
    _=Depends(get_current_user),
    svc: VisionService = Depends(get_svc),
):
    """
    Analyse complète en 1 appel :

    1. Détection des dégâts (YOLOv8)
    2. Croisement avec la déclaration du sinistre (cohérence fraude)

    C'est l'endpoint principal pour l'interface sinistre.
    """
    valid_severities = {'Minor', 'Moderate', 'Severe', 'Total Loss'}
    if declared_severity not in valid_severities:
        raise HTTPException(
            status_code=422,
            detail=f"declared_severity invalide. Valeurs acceptées : {sorted(valid_severities)}",
        )

    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=415, detail="Type fichier non supporté")

    contents = await file.read()

    if len(contents) > MAX_SIZE_MB * 1024 * 1024:
        raise HTTPException(status_code=413, detail="Image trop grande")

    try:
        visual = svc.analyze(contents)
        coherence = svc.check_fraud_coherence(visual, declared_severity, declared_amount)
        return {
            'visual_analysis': visual,
            'fraud_coherence': coherence,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/model-info", response_model=VisionModelInfoOutput)
def get_model_info(
    _=Depends(get_current_user),
    svc: VisionService = Depends(get_svc),
):
    """Métadonnées du modèle YOLO (performance, classes, mapping sévérité)."""
    return svc.get_model_info()
