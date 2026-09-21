import json
from datetime import date
from pathlib import Path
from sqlalchemy.orm import Session
from app.models.monitoring import (
    MonitoringGlobalKpis, MonitoringRegionKpis,
    MonitoringYearlyKpis, MonitoringQuarterlyKpis,
    MonitoringFraudStats, MonitoringReserves
)

def seed_monitoring_data(db: Session, artifacts_dir: str = "data/monitoring/"):
    # Skip si déjà seedé (idempotent)
    if db.query(MonitoringGlobalKpis).count() > 0:
        print("[seed] Monitoring data already seeded — skipping")
        return

    today = date.today()
    base = Path(artifacts_dir)

    with open(base / "kpis_global.json")    as f: g  = json.load(f)
    with open(base / "kpis_by_region.json") as f: r  = json.load(f)
    with open(base / "kpis_by_year.json")   as f: y  = json.load(f)
    with open(base / "fraud_stats.json")    as f: fr = json.load(f)
    with open(base / "reserves_trend.json") as f: rv = json.load(f)

    # 1. Global KPIs
    db.add(MonitoringGlobalKpis(
        snapshot_date=today,
        total_policies=g["portfolio"]["total_policies"],
        total_exposure=g["portfolio"]["total_exposure"],
        total_claims=g["portfolio"]["total_claims"],
        total_claim_amount=g["portfolio"]["total_claim_amount"],
        total_premium=g["portfolio"]["total_premium"],
        frequency=g["kpis"]["frequency"],
        severity=g["kpis"]["severity"],
        pure_premium=g["kpis"]["pure_premium"],
        loss_ratio=g["kpis"]["loss_ratio"],
        combined_ratio=g["kpis"]["combined_ratio"],
        expense_ratio=g["kpis"]["expense_ratio"],
        loading_factor=g["kpis"]["loading_factor"],
        freq_market=g["benchmarks"]["frequency_market"],
        lr_market=g["benchmarks"]["loss_ratio_market"],
        cr_market=g["benchmarks"]["combined_ratio_market"],
        sev_market=g["benchmarks"]["severity_market"],
        source=g["source"]
    ))

    # 2. Régions
    for reg in r["regions"]:
        db.add(MonitoringRegionKpis(
            snapshot_date=today,
            region_code=reg["Region"],
            policies=reg["policies"],
            exposure=reg["exposure"],
            claims=reg["claims"],
            claim_amount=reg["claim_amount"],
            premium=reg["premium"],
            frequency=reg["frequency"],
            severity=reg["severity"],
            loss_ratio=reg["loss_ratio"],
            combined_ratio=reg["combined_ratio"],
            risk_level=reg["risk_level"]
        ))

    # 3. Annuel
    for row in y["annual"]:
        db.add(MonitoringYearlyKpis(
            snapshot_date=today,
            year=row["year"],
            total_claims=row["total_claims"],
            fraud_claims=row["fraud_claims"],
            fraud_rate_pct=row["fraud_rate_pct"],
            avg_total_claim=row["avg_total_claim"],
            loss_ratio=row["loss_ratio"],
            combined_ratio=row["combined_ratio"]
        ))

    # 4. Trimestriel
    for row in y["quarterly"]:
        db.add(MonitoringQuarterlyKpis(
            snapshot_date=today,
            quarter=row["quarter"],
            total_claims=row["total_claims"],
            fraud_claims=row["fraud_claims"],
            avg_claim=row["avg_claim"],
            fraud_rate_pct=row["fraud_rate_pct"]
        ))

    # 5. Fraude stats
    db.add(MonitoringFraudStats(
        snapshot_date=today,
        total_claims=fr["global"]["total_claims"],
        fraud_claims=fr["global"]["fraud_claims"],
        fraud_rate_pct=fr["global"]["fraud_rate_pct"],
        avg_fraud_amount=fr["global"]["avg_fraud_amount"],
        avg_legit_amount=fr["global"]["avg_legit_amount"],
        by_incident_type=fr["by_incident_type"],
        by_severity=fr["by_severity"],
        by_state=fr["by_state"]
    ))

    # 6. Réserves
    db.add(MonitoringReserves(
        snapshot_date=today,
        company_name=rv["company"]["grname"],
        lob=rv["company"]["lob"],
        reserves_by_year=rv["reserves_by_year"],
        premium_by_year=rv["premium_by_year"],
        reserve_to_premium=rv["reserve_to_premium"],
        total_ibnr=rv["summary"]["total_ibnr"],
        total_premium_cas=rv["summary"]["total_premium_cas"],
        ibnr_to_premium_ratio=rv["summary"]["ibnr_to_premium_ratio"]
    ))

    db.commit()
    print("[seed] Monitoring data seeded successfully")
