import json, numpy as np, pickle, math
from datetime import date
from sqlalchemy.orm import Session
from app.models.reserving import ReservingCompany, ReservingSnapshot, ReservingTriangle

def compute_histogram(samples: np.ndarray, n_bins: int = 40) -> dict:
    counts, bin_edges = np.histogram(samples, bins=n_bins)
    return {
        "bins": bin_edges.tolist(),   # 41 valeurs (bords)
        "counts": counts.tolist()     # 40 valeurs
    }

def clean_nans(obj):
    if isinstance(obj, float):
        return None if math.isnan(obj) else obj
    elif isinstance(obj, dict):
        return {k: clean_nans(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [clean_nans(x) for x in obj]
    return obj

def seed_reserving_data(db: Session, artifacts_dir: str = "data/reserving/"):
    # Vérification : skip si données déjà présentes
    if db.query(ReservingCompany).count() > 0:
        return

    # Chargement des artifacts
    with open(f"{artifacts_dir}reserving_meta.json") as f:
        meta = json.load(f)
    meta = clean_nans(meta)
    bootstrap_samples = np.load(f"{artifacts_dir}bootstrap_samples.npy")

    # Calcul histogramme
    histogram = compute_histogram(bootstrap_samples, n_bins=40)

    snapshot_date = date.today()
    grcode = meta["company"]["grcode"]

    # Insert company
    company = ReservingCompany(
        grcode=grcode,
        name=meta["company"]["name"],
        line_of_business=meta["company"]["line_of_business"]
    )
    db.add(company)

    # Insert snapshot
    snapshot = ReservingSnapshot(
        grcode=grcode,
        snapshot_date=snapshot_date,
        cl_total_reserve=meta["chain_ladder"]["total_reserve"],
        cl_ldf=meta["chain_ladder"]["ldf"],
        cl_cdf=meta["chain_ladder"]["cdf"],
        cl_ultimate_by_year=meta["chain_ladder"]["ultimate_by_year"],
        cl_reserve_by_year=meta["chain_ladder"]["reserve_by_year"],
        mack_total_reserve=meta["mack"]["total_reserve"],
        mack_total_std_error=meta["mack"]["total_std_error"],
        mack_ci_95_lower=meta["mack"]["ci_95_lower"],
        mack_ci_95_upper=meta["mack"]["ci_95_upper"],
        mack_by_year=meta["mack"]["by_year"],
        bf_apriori_loss_ratio=meta["bornhuetter_ferguson"]["apriori_loss_ratio"],
        bf_total_reserve=meta["bornhuetter_ferguson"]["total_reserve"],
        bf_by_year=meta["bornhuetter_ferguson"]["by_year"],
        bootstrap_n_sims=meta["bootstrap"]["n_sims"],
        bootstrap_mean=meta["bootstrap"]["mean_reserve"],
        bootstrap_std=meta["bootstrap"]["std_reserve"],
        bootstrap_percentiles=meta["bootstrap"]["percentiles"],
        bootstrap_histogram=histogram,
        backtest_mape_pct=meta["backtest"]["mape_pct"],
        backtest_by_year=meta["backtest"]["by_year"]
    )
    db.add(snapshot)

    # Insert triangle
    triangle = ReservingTriangle(
        grcode=grcode,
        snapshot_date=snapshot_date,
        origin_years=meta["triangle"]["origin_years"],
        development_lags=meta["triangle"]["development_lags"],
        cumulative_paid=meta["triangle"]["cumulative_paid"]
    )
    db.add(triangle)

    db.commit()
    print(f"[seed] Reserving data seeded for GRCODE={grcode}")
