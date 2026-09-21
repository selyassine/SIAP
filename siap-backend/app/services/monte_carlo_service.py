import json
from pathlib import Path
from fastapi import HTTPException


class MonteCarloService:
    """
    Service singleton servant le rapport Monte Carlo pré-calculé.
    """

    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def initialize(self):
        if self._initialized:
            return

        report_path = (
            Path(__file__).parent.parent / "data" / "monte_carlo" / "mc_stress_report.json"
        )

        if not report_path.exists():
            self.report = None
            print(
                f"[MonteCarloService] WARNING: {report_path} introuvable. "
            )
        else:
            with open(report_path, encoding="utf-8") as f:
                raw_report = json.load(f)
                self.report = self._adapt_report(raw_report)
            
            n_sim = self.report.get("methodology", {}).get("n_simulations", "?")
            print(f"[MonteCarloService] Rapport MC chargé — {n_sim} simulations")

        self._initialized = True

    def _adapt_report(self, r: dict) -> dict:
        """Adapte le JSON brut au format attendu par le frontend."""
        
        reserve_ref = r.get("module_3_reserve", 494113.0)
        mean_mc = r.get("distribution", {}).get("mean", reserve_ref)
        mean_delta_pct = (mean_mc - reserve_ref) / reserve_ref * 100 if reserve_ref else 0

        # Scenarios format
        raw_scenarios = r.get("stress_scenarios", [])
        scenarios = []
        for s in raw_scenarios:
            scenarios.append({
                "label": s.get("name", ""),
                "reserve": s.get("reserve", 0),
                "delta_pct": s.get("delta_vs_central_pct", 0),
                "percentile_mc": s.get("mc_percentile", 0)
            })

        # Histogram format: the frontend expects { bin_center, frequency }
        # raw json gives { bin_center, count, density }
        raw_hist = r.get("histogram", [])
        histogram = []
        for h in raw_hist:
            histogram.append({
                "bin_center": h.get("bin_center", 0),
                "count": h.get("count", 0),
                "frequency": h.get("density", 0)
            })

        # Percentiles
        risk_pct = r.get("risk_metrics", {}).get("percentiles", {})
        percentiles = {
            "p5": risk_pct.get("5", 0),
            "p25": risk_pct.get("25", 0),
            "p50": risk_pct.get("50", 0),
            "p75": risk_pct.get("75", 0),
            "p95": risk_pct.get("95", 0),
            "p99": risk_pct.get("99", 0),
            "p99_5": risk_pct.get("99.5", 0)
        }

        return {
            "generated_at": r.get("generated_at", ""),
            "source": r.get("source", ""),
            "reserve_reference": reserve_ref,
            "methodology": {
                "n_simulations": r.get("n_simulations", 100000),
                **r.get("methodology", {})
            },
            "simulation_stats": {
                "mean": r.get("distribution", {}).get("mean", 0),
                "median": r.get("distribution", {}).get("median", 0),
                "std_dev": r.get("distribution", {}).get("std", 0),
                "cv_pct": r.get("distribution", {}).get("cv_pct", 0),
                "min_reserve": r.get("distribution", {}).get("min", 0),
                "max_reserve": r.get("distribution", {}).get("max", 0),
                "mean_delta_pct": mean_delta_pct,
            },
            "percentiles": percentiles,
            "solvency_metrics": {
                "var_95": r.get("risk_metrics", {}).get("var_95", 0),
                "var_99": r.get("risk_metrics", {}).get("var_99", 0),
                "var_99_5": r.get("risk_metrics", {}).get("var_99_5", 0),
                "cvar_99_5": r.get("risk_metrics", {}).get("cvar_99_5", 0),
                "tvar_95": r.get("risk_metrics", {}).get("tvar_95", 0),
                "capital_buffer_95": r.get("risk_metrics", {}).get("capital_buffer_95", 0),
                "capital_buffer_99_5": r.get("risk_metrics", {}).get("capital_buffer_99_5", 0),
                "capital_buffer_95_pct": r.get("risk_metrics", {}).get("capital_pct_95", 0),
                "capital_buffer_99_5_pct": r.get("risk_metrics", {}).get("capital_pct_99_5", 0),
            },
            "scenarios": scenarios,
            "ldf_params": [], # Not strictly needed by the frontend widgets
            "histogram": histogram,
            "cdf_curve": r.get("cdf_curve", [])
        }

    def _check_report(self):
        if self.report is None:
            raise HTTPException(
                status_code=404,
                detail="Rapport Monte Carlo non disponible."
            )

    def get_full_report(self) -> dict:
        self._check_report()
        return self.report

    def get_summary(self) -> dict:
        self._check_report()
        r = self.report
        stats  = r["simulation_stats"]
        solv   = r["solvency_metrics"]
        return {
            "reserve_central"        : r["reserve_reference"],
            "mean_mc"                : stats["mean"],
            "var_99_5"               : solv["var_99_5"],
            "cvar_99_5"              : solv["cvar_99_5"],
            "cv_pct"                 : stats["cv_pct"],
            "mean_delta_pct"         : stats["mean_delta_pct"],
            "capital_buffer_99_5"    : solv["capital_buffer_99_5"],
            "capital_buffer_99_5_pct": solv["capital_buffer_99_5_pct"],
            "generated_at"           : r["generated_at"],
        }

    def get_scenarios(self) -> list:
        self._check_report()
        return self.report["scenarios"]

    def get_histogram(self) -> list:
        self._check_report()
        return self.report.get("histogram", [])

    def get_cdf(self) -> list:
        self._check_report()
        return self.report.get("cdf_curve", [])
