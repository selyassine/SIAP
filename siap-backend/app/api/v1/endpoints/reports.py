from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import io
from datetime import datetime

from app.api.v1.endpoints.auth import get_current_user
from app.db.session import get_db
from app.services.report_service import ReportService


router = APIRouter(prefix="/api/v1/reports", tags=["Rapports"])


def get_svc() -> ReportService:
    return ReportService.get_instance()


@router.post("/generate")
async def generate_report(
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
    svc: ReportService = Depends(get_svc),
):
    """
    Générer le rapport actuariel PDF complet :
    KPIs portefeuille + Analyse régionale + Fraude + Réserves IBNR
    + commentaires interprétatifs générés par IA (Groq).

    Retourne le PDF en téléchargement direct.
    """
    try:
        pdf_bytes = await svc.generate_full_report(db)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la génération du rapport : {str(e)}"
        )

    filename = f"SIAP_Rapport_{datetime.now().strftime('%Y%m%d_%H%M')}.pdf"

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )
