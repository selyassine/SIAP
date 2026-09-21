from contextlib import asynccontextmanager
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.v1.router import api_router
from app.services.pricing_service import PricingService
from app.db.session import engine, Base, SessionLocal

from app.db.seed_reserving import seed_reserving_data
from app.services.reserving_service import ReservingService
from app.routers.reserving import router as reserving_router
import app.models

# Create db tables if not exists (since we use sqlite)
load_dotenv()
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load ML models on startup
    pricing_service = PricingService()
    pricing_service.initialize()
    
    # Module 3 — IBNR Reserving
    with SessionLocal() as db:
        seed_reserving_data(db, artifacts_dir="data/reserving/")
    ReservingService.get_instance()
    print("[lifespan] ReservingService ready")
    
    # Module 2 — Fraud Detection
    from app.services.fraud_service import FraudService
    FraudService.get_instance()
    print("[lifespan] FraudService ready")
    
    # Module 5 — Monitoring
    from app.db.seed_monitoring import seed_monitoring_data
    from app.services.monitoring_service import MonitoringService
    with SessionLocal() as db:
        seed_monitoring_data(db, artifacts_dir="data/monitoring/")
    MonitoringService.get_instance()
    print("[lifespan] MonitoringService ready")

    # Module 4 — Computer Vision
    from app.services.vision_service import VisionService
    VisionService.get_instance()
    print("[lifespan] VisionService ready")

    # Module 6 — Assistant IA
    from app.services.assistant_service import AssistantService
    AssistantService.get_instance()
    print("[lifespan] AssistantService ready — Groq llama-3.3-70b")

    # Module 6 — Générateur de Rapports PDF
    from app.services.report_service import ReportService
    ReportService.get_instance()
    print("[lifespan] ReportService ready")

    # Module Bonus A — Bias Detector
    from app.services.audit_service import AuditService
    audit_svc = AuditService.get_instance()
    print("[lifespan] AuditService ready")

    # Module Option C — Early Warning
    from app.services.early_warning_service import EarlyWarningService
    from app.services.monte_carlo_service import MonteCarloService
    from app.services.drift_service import DriftService
    EarlyWarningService().initialize()
    MonteCarloService().initialize()
    DriftService().initialize()
    print("[lifespan] MonteCarloService ready")
    print("[lifespan] DriftService ready")

    yield
    # Clean up on shutdown
    pass

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://localhost:3001",
        "https://appsforoffice.microsoft.com",
        "https://*.officeapps.live.com",
        "https://*.microsoft.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)
app.include_router(reserving_router)

from app.routers.monitoring import router as monitoring_router
app.include_router(monitoring_router)

from app.routers.vision import router as vision_router
app.include_router(vision_router)

from app.api.v1.endpoints.assistant import router as assistant_router
app.include_router(assistant_router)

from app.api.v1.endpoints.reports import router as reports_router
app.include_router(reports_router)

from app.api.v1.endpoints.claims import router as claims_router
app.include_router(claims_router)

from app.api.v1.endpoints.audit import router as audit_router
app.include_router(audit_router)

from app.api.v1.endpoints.early_warning import router as ew_router
app.include_router(ew_router)

from app.api.v1.endpoints.monte_carlo import router as monte_carlo_router
app.include_router(monte_carlo_router)

from app.api.v1.endpoints.drift import router as drift_router
app.include_router(drift_router)

@app.get("/")
def root():
    return {"message": "Welcome to SIAP Backend API"}
