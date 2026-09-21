from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app.models.claim import Claim
from app.schemas.claim import ClaimCreate
from app.services.fraud_service import FraudService
from app.schemas.fraud import FraudInput


class ClaimsService:
    """Service de gestion des sinistres créés dynamiquement (Module 7)."""

    def _generate_claim_number(self, db: Session) -> str:
        year = datetime.now().year
        count = db.query(Claim).filter(
            Claim.claim_number.like(f"CLM-{year}-%")
        ).count()
        return f"CLM-{year}-{count + 1:04d}"

    def create_claim(self, claim_data: ClaimCreate, db: Session, user_id: int = None) -> Claim:
        fraud_svc = FraudService.get_instance()
        fraud_input = FraudInput(**claim_data.model_dump())
        fraud_result = fraud_svc.predict(fraud_input)

        claim_number = self._generate_claim_number(db)

        claim = Claim(
            claim_number=claim_number,
            **claim_data.model_dump(),
            fraud_score=fraud_result.fraud_score,
            fraud_risk_level=fraud_result.risk_level,
            fraud_alert=fraud_result.alert,
            status="pending",
            created_by=user_id,
        )

        db.add(claim)
        db.commit()
        db.refresh(claim)

        return claim

    def get_recent_claims(
        self, db: Session, page: int = 1, page_size: int = 20
    ) -> dict:
        total = db.query(Claim).count()
        claims = (
            db.query(Claim)
            .order_by(desc(Claim.created_at))
            .offset((page - 1) * page_size)
            .limit(page_size)
            .all()
        )
        return {
            "claims": claims,
            "total": total,
            "page": page,
            "page_size": page_size,
        }

    def get_claim_detail(self, claim_id: int, db: Session) -> Claim | None:
        return db.query(Claim).filter(Claim.id == claim_id).first()

    def update_claim(self, claim_id: int, claim_data: ClaimCreate, db: Session) -> Claim | None:
        claim = db.query(Claim).filter(Claim.id == claim_id).first()
        if not claim:
            return None

        # Re-run fraud detection
        fraud_svc = FraudService.get_instance()
        fraud_input = FraudInput(**claim_data.model_dump())
        fraud_result = fraud_svc.predict(fraud_input)

        # Update all fields
        for key, value in claim_data.model_dump().items():
            setattr(claim, key, value)
        
        # Update fraud fields
        claim.fraud_score = fraud_result.fraud_score
        claim.fraud_risk_level = fraud_result.risk_level
        claim.fraud_alert = fraud_result.alert

        db.commit()
        db.refresh(claim)
        return claim

    def delete_claim(self, claim_id: int, db: Session) -> bool:
        claim = db.query(Claim).filter(Claim.id == claim_id).first()
        if not claim:
            return False
        
        db.delete(claim)
        db.commit()
        return True

    def update_status(self, claim_id: int, status: str, db: Session) -> Claim | None:
        claim = db.query(Claim).filter(Claim.id == claim_id).first()
        if claim:
            claim.status = status
            db.commit()
            db.refresh(claim)
        return claim

    def get_stats(self, db: Session) -> dict:
        total_claims = db.query(Claim).count()

        if total_claims == 0:
            return {
                "total_claims": 0,
                "total_amount": 0.0,
                "avg_fraud_score": 0.0,
                "alerts_count": 0,
                "by_risk_level": {"Low": 0, "Medium": 0, "High": 0, "Very High": 0},
                "by_status": {"pending": 0, "reviewed": 0, "closed": 0},
            }

        total_amount = db.query(func.sum(Claim.total_claim_amount)).scalar() or 0.0
        avg_fraud_score = db.query(func.avg(Claim.fraud_score)).scalar() or 0.0
        alerts_count = db.query(Claim).filter(Claim.fraud_alert == True).count()

        by_risk_level = {}
        for level in ["Low", "Medium", "High", "Very High"]:
            by_risk_level[level] = (
                db.query(Claim).filter(Claim.fraud_risk_level == level).count()
            )

        by_status = {}
        for status in ["pending", "reviewed", "closed"]:
            by_status[status] = db.query(Claim).filter(Claim.status == status).count()

        return {
            "total_claims": total_claims,
            "total_amount": round(total_amount, 2),
            "avg_fraud_score": round(float(avg_fraud_score), 1),
            "alerts_count": alerts_count,
            "by_risk_level": by_risk_level,
            "by_status": by_status,
        }
