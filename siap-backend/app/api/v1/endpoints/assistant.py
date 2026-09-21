from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from app.api.v1.endpoints.auth import get_current_user
from app.db.session import get_db
from app.services.assistant_service import AssistantService


router = APIRouter(prefix="/api/v1/assistant", tags=["Assistant IA"])


# ─── Schemas ───────────────────────────────────────────────────────────────────

class ChatMessage(BaseModel):
    role: str   # "user" ou "assistant"
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[list[ChatMessage]] = []

class ChatResponse(BaseModel):
    response: str
    intents_detected: list[str]
    model: str
    tokens_used: int


# ─── Endpoints ─────────────────────────────────────────────────────────────────

def get_svc() -> AssistantService:
    return AssistantService.get_instance()


@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
    svc: AssistantService = Depends(get_svc),
):
    """
    Envoyer un message à l'assistant actuariel.
    L'assistant interroge automatiquement les données SIAP
    et répond en langage naturel via Groq (llama-3.3-70b).
    """
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message vide")

    if len(request.message) > 1000:
        raise HTTPException(
            status_code=400,
            detail="Message trop long (max 1000 caractères)"
        )

    history = [
        {"role": m.role, "content": m.content}
        for m in (request.history or [])
    ]

    result = await svc.chat(
        message=request.message,
        history=history,
        db=db
    )

    return {
        "response": result["response"],
        "intents_detected": result["intents_detected"],
        "model": result["model"],
        "tokens_used": result["tokens_used"],
    }


@router.get("/capabilities")
def get_capabilities(
    _=Depends(get_current_user),
    svc: AssistantService = Depends(get_svc),
):
    """Retourner les capacités et questions suggérées de l'assistant."""
    return svc.get_capabilities()
