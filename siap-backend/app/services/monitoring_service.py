from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.monitoring import (
    MonitoringGlobalKpis, MonitoringRegionKpis,
    MonitoringYearlyKpis, MonitoringQuarterlyKpis,
    MonitoringFraudStats, MonitoringReserves
)
from app.schemas.monitoring import ReservesSummary

class MonitoringService:
    _instance = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def _latest(self, db, model):
        row = db.query(model).order_by(model.snapshot_date.desc()).first()
        if not row:
            raise HTTPException(status_code=404, detail=f"No data for {model.__tablename__}")
        return row

    def get_global_kpis(self, db: Session) -> dict:
        row = self._latest(db, MonitoringGlobalKpis)
        return {
            "snapshot_date": row.snapshot_date,
            "portfolio": {
                "total_policies": row.total_policies,
                "total_exposure": row.total_exposure,
                "total_claims": row.total_claims,
                "total_claim_amount": row.total_claim_amount,
                "total_premium": row.total_premium,
            },
            "kpis": {
                "frequency": row.frequency,
                "severity": row.severity,
                "pure_premium": row.pure_premium,
                "loss_ratio": row.loss_ratio,
                "combined_ratio": row.combined_ratio,
                "expense_ratio": row.expense_ratio,
                "loading_factor": row.loading_factor,
            },
            "benchmarks": {
                "frequency_market": row.freq_market,
                "loss_ratio_market": row.lr_market,
                "combined_ratio_market": row.cr_market,
                "severity_market": row.sev_market,
            }
        }

    def get_regions(self, db: Session) -> dict:
        rows = (db.query(MonitoringRegionKpis)
                  .order_by(MonitoringRegionKpis.loss_ratio.desc()).all())
        if not rows:
            raise HTTPException(status_code=404, detail="No region data")
        return {
            "snapshot_date": rows[0].snapshot_date,
            "regions": [
                {
                    "region_code": r.region_code, "policies": r.policies,
                    "exposure": r.exposure, "claims": r.claims,
                    "claim_amount": r.claim_amount, "premium": r.premium,
                    "frequency": r.frequency, "severity": r.severity,
                    "loss_ratio": r.loss_ratio, "combined_ratio": r.combined_ratio,
                    "risk_level": r.risk_level
                }
                for r in rows
            ],
            "total_regions": len(rows)
        }

    def get_trends(self, db: Session) -> dict:
        annual = db.query(MonitoringYearlyKpis).order_by(
            MonitoringYearlyKpis.year).all()
        quarterly = db.query(MonitoringQuarterlyKpis).order_by(
            MonitoringQuarterlyKpis.quarter).all()
        if not annual:
            raise HTTPException(status_code=404, detail="No trend data")
        return {
            "snapshot_date": annual[0].snapshot_date,
            "annual": [
                {
                    "year": r.year, "total_claims": r.total_claims,
                    "fraud_claims": r.fraud_claims, "fraud_rate_pct": r.fraud_rate_pct,
                    "avg_total_claim": r.avg_total_claim, "loss_ratio": r.loss_ratio,
                    "combined_ratio": r.combined_ratio
                }
                for r in annual
            ],
            "quarterly": [
                {
                    "quarter": r.quarter, "total_claims": r.total_claims,
                    "fraud_claims": r.fraud_claims, "avg_claim": r.avg_claim,
                    "fraud_rate_pct": r.fraud_rate_pct
                }
                for r in quarterly
            ]
        }

    def get_fraud_stats(self, db: Session) -> dict:
        row = self._latest(db, MonitoringFraudStats)
        return {
            "snapshot_date": row.snapshot_date,
            "global_stats": {
                "total_claims": row.total_claims,
                "fraud_claims": row.fraud_claims,
                "fraud_rate_pct": row.fraud_rate_pct,
                "avg_fraud_amount": row.avg_fraud_amount,
                "avg_legit_amount": row.avg_legit_amount,
            },
            "by_incident_type": row.by_incident_type,
            "by_severity": row.by_severity,
            "by_state": row.by_state,
        }

    def get_reserves(self, db: Session) -> dict:
        row = self._latest(db, MonitoringReserves)
        return {
            "snapshot_date": row.snapshot_date,
            "company_name": row.company_name,
            "lob": row.lob,
            "reserves_by_year": row.reserves_by_year,
            "premium_by_year": row.premium_by_year,
            "reserve_to_premium": row.reserve_to_premium,
            "summary": {
                "total_ibnr": row.total_ibnr,
                "total_premium_cas": row.total_premium_cas,
                "ibnr_to_premium_ratio": row.ibnr_to_premium_ratio,
            }
        }

    def get_dashboard_summary(self, db: Session) -> dict:
        """Charge tout en 1 appel pour le dashboard principal."""
        global_kpis  = self.get_global_kpis(db)
        fraud_stats  = self.get_fraud_stats(db)
        reserves     = self.get_reserves(db)
        regions_data = self.get_regions(db)
        trends       = self.get_trends(db)

        # CORRECTION : convertir le dict summary en objet ReservesSummary
        reserves_summary = ReservesSummary(**reserves["summary"])

        # Exclure 2015 (données partielles — 3 sinistres seulement)
        latest_yearly = [
            row for row in trends["annual"]
            if row["year"] <= 2014 and row["total_claims"] >= 10
        ][-5:]  # 5 dernières années valides

        return {
            "global_kpis":         global_kpis,
            "fraud_stats":         fraud_stats,
            "reserves_summary":    reserves_summary,
            "top_risky_regions":   regions_data["regions"][:5],
            "latest_yearly_trend": latest_yearly,
            "quarterly_trend":     trends["quarterly"],
            "reserves_by_year":    reserves["reserves_by_year"],
        }
