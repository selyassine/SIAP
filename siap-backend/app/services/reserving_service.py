from sqlalchemy.orm import Session
from app.models.reserving import ReservingCompany, ReservingSnapshot, ReservingTriangle
from fastapi import HTTPException

class ReservingService:
    _instance = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    # --- Helpers DB ---

    def _get_company(self, db: Session, grcode: int) -> ReservingCompany:
        company = db.query(ReservingCompany).filter_by(grcode=grcode).first()
        if not company:
            raise HTTPException(404, f"GRCODE {grcode} not found")
        return company

    def _get_snapshot(self, db: Session, grcode: int) -> ReservingSnapshot:
        snapshot = (
            db.query(ReservingSnapshot)
            .filter_by(grcode=grcode)
            .order_by(ReservingSnapshot.snapshot_date.desc())
            .first()
        )
        if not snapshot:
            raise HTTPException(404, f"No snapshot found for GRCODE {grcode}")
        return snapshot

    def _get_triangle(self, db: Session, grcode: int) -> ReservingTriangle:
        triangle = (
            db.query(ReservingTriangle)
            .filter_by(grcode=grcode)
            .order_by(ReservingTriangle.snapshot_date.desc())
            .first()
        )
        if not triangle:
            raise HTTPException(404, f"No triangle found for GRCODE {grcode}")
        return triangle

    # --- Méthodes métier ---

    def get_summary(self, db: Session, grcode: int) -> dict:
        company = self._get_company(db, grcode)
        snap = self._get_snapshot(db, grcode)
        return {
            "company": {"grcode": company.grcode, "name": company.name,
                        "line_of_business": company.line_of_business},
            "snapshot_date": snap.snapshot_date,
            "chain_ladder": {
                "ldf": snap.cl_ldf, "cdf": snap.cl_cdf,
                "ultimate_by_year": snap.cl_ultimate_by_year,
                "reserve_by_year": snap.cl_reserve_by_year,
                "total_reserve": snap.cl_total_reserve,
            },
            "mack": {
                "total_reserve": snap.mack_total_reserve,
                "total_std_error": snap.mack_total_std_error,
                "ci_95_lower": snap.mack_ci_95_lower,
                "ci_95_upper": snap.mack_ci_95_upper,
                "by_year": snap.mack_by_year,
            },
            "bornhuetter_ferguson": {
                "apriori_loss_ratio": snap.bf_apriori_loss_ratio,
                "total_reserve": snap.bf_total_reserve,
                "by_year": snap.bf_by_year,
            },
            "bootstrap": {
                "n_sims": snap.bootstrap_n_sims,
                "mean_reserve": snap.bootstrap_mean,
                "std_reserve": snap.bootstrap_std,
                "percentiles": snap.bootstrap_percentiles,
                "histogram": snap.bootstrap_histogram,
            },
            "backtest": {
                "mape_pct": snap.backtest_mape_pct,
                "by_year": snap.backtest_by_year,
            },
        }

    def get_triangle(self, db: Session, grcode: int) -> dict:
        company = self._get_company(db, grcode)
        tri = self._get_triangle(db, grcode)
        return {
            "company": {"grcode": company.grcode, "name": company.name,
                        "line_of_business": company.line_of_business},
            "snapshot_date": tri.snapshot_date,
            "triangle": {
                "origin_years": tri.origin_years,
                "development_lags": tri.development_lags,
                "cumulative_paid": tri.cumulative_paid,
            }
        }

    def get_bootstrap(self, db: Session, grcode: int) -> dict:
        company = self._get_company(db, grcode)
        snap = self._get_snapshot(db, grcode)
        return {
            "company": {"grcode": company.grcode, "name": company.name,
                        "line_of_business": company.line_of_business},
            "n_sims": snap.bootstrap_n_sims,
            "mean_reserve": snap.bootstrap_mean,
            "std_reserve": snap.bootstrap_std,
            "percentiles": snap.bootstrap_percentiles,
            "histogram": snap.bootstrap_histogram,
        }

    def get_backtest(self, db: Session, grcode: int) -> dict:
        company = self._get_company(db, grcode)
        snap = self._get_snapshot(db, grcode)
        return {
            "company": {"grcode": company.grcode, "name": company.name,
                        "line_of_business": company.line_of_business},
            "mape_pct": snap.backtest_mape_pct,
            "by_year": snap.backtest_by_year,
        }

    def get_model_info(self, db: Session) -> dict:
        companies = db.query(ReservingCompany).all()
        return {
            "available_grcodes": [c.grcode for c in companies],
            "companies": [{"grcode": c.grcode, "name": c.name,
                           "line_of_business": c.line_of_business}
                          for c in companies],
            "methods": ["Chain Ladder", "Mack", "Bornhuetter-Ferguson", "Bootstrap ODP"],
            "artifacts": ["reserving_meta.json", "models_reserving.pkl",
                          "bootstrap_samples.npy", "triangle_paid.csv", "cl_summary.csv"],
        }
