import json
from pathlib import Path
from fastapi import HTTPException


class EarlyWarningService:
    """
    Service singleton servant le rapport Early Warning pré-calculé.
    Ne recalcule pas à la volée — regénérer avec 11_early_warning.ipynb
    après chaque mise à jour du triangle CAS.
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
            Path(__file__).parent.parent
            / "data" / "early_warning" / "early_warning_report.json"
        )

        if not report_path.exists():
            self.report = None
            print(
                f"[EarlyWarningService] WARNING: {report_path} introuvable. "
                "Exécuter 11_early_warning.ipynb pour générer le rapport."
            )
        else:
            with open(report_path, encoding="utf-8") as f:
                self.report = json.load(f)
            print(
                f"[EarlyWarningService] Rapport chargé — "
                f"score={self.report.get('global_score')}/100 "
                f"classification={self.report.get('classification')}"
            )

        self._initialized = True

    def _check(self):
        if self.report is None:
            raise HTTPException(
                status_code=404,
                detail="Aucun rapport Early Warning disponible. "
                       "Exécuter 11_early_warning.ipynb pour en générer un.",
            )

    def get_full_report(self) -> dict:
        self._check()
        return self.report

    def get_summary(self) -> dict:
        self._check()
        r = self.report
        # Utiliser les clés qui existent vraiment dans le JSON (delta_recent_pct)
        return {
            "global_score":      r.get("global_score", 0),
            "classification":    r.get("classification", "INCONNU"),
            "verdict":           r.get("verdict", ""),
            "n_alerts_forte":    r.get("summary", {}).get("n_alerts_forte", 0),
            "n_alerts_modere":   r.get("summary", {}).get("n_alerts_modere", 0),
            "n_forecast_danger": r.get("summary", {}).get("n_forecast_danger", 0),
            "reserve_standard":  r.get("reserves", {}).get("standard", 0),
            "reserve_recent":    r.get("reserves", {}).get("recent_ldfs", 0),
            "delta_recent_pct":  r.get("reserves", {}).get("delta_recent_pct", 0),
            "uncertainty_pct":   r.get("reserves", {}).get("uncertainty_pct", 0),
            "generated_at":      r.get("generated_at", ""),
        }

    def get_lag_details(self) -> list:
        self._check()
        return self.report.get("lag_details", [])

    def get_ldf_series(self, lag: str | None = None) -> dict:
        self._check()
        series = self.report.get("ldf_series", {})
        if lag:
            if lag not in series:
                raise HTTPException(
                    status_code=404,
                    detail=f"Lag '{lag}' introuvable. "
                           f"Lags disponibles : {list(series.keys())}",
                )
            return {lag: series[lag]}
        return series
