from fastapi import APIRouter
from app.api.v1.endpoints import auth, pricing, fraud

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(pricing.router, prefix="/pricing", tags=["pricing"])
api_router.include_router(fraud.router, prefix="/fraud", tags=["fraud"])
