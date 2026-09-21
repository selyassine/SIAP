import json
from pathlib import Path
from fastapi import HTTPException


class DriftService:
    """
    Service singleton servant le rapport Model Drift pré-calculé.
    Ne recalcule pas à la volée — régénérer avec 13_model_drift_monitoring.ipynb
    après chaque ré-entraînement du Module 1.
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
            / "data" / "drift" / "drift_report.json"
        )

        if not report_path.exists():
            self.report = None
            print(
                f"[DriftService] WARNING: {report_path} introuvable. "
                "Exécuter 13_model_drift_monitoring.ipynb pour générer le rapport."
            )
        else:
            with open(report_path, encoding="utf-8") as f:
                self.report = json.load(f)
            print(
                f"[DriftService] Rapport chargé — "
                f"score={self.report.get('stability_score')}/100 "
                f"class={self.report.get('stability_class')}"
            )

        self._initialized = True

    def _check(self):
        if self.report is None:
            raise HTTPException(
                status_code=404,
                detail="Aucun rapport Drift disponible. "
                       "Exécuter 13_model_drift_monitoring.ipynb pour en générer un.",
            )

    def get_full_report(self) -> dict:
        self._check()
        return self.report

    def get_summary(self) -> dict:
        self._check()
        r = self.report
        psi = r.get("psi_results", [])
        return {
            "stability_score":      r["stability_score"],
            "stability_class":      r["stability_class"],
            "stability_color":      r["stability_color"],
            "verdict":              r["verdict"],
            "n_alerts":             len(r.get("alerts", [])),
            "n_variables_stable":   sum(1 for p in psi if p.get("status") == "STABLE"),
            "n_variables_watch":    sum(1 for p in psi if p.get("status") == "SURVEILLANCE"),
            "n_variables_drift":    sum(1 for p in psi if p.get("status") == "DRIFT CRITIQUE"),
            "psi_predictions":      r["prediction_drift"]["psi"],
            "ks_pvalue":            r["prediction_drift"]["ks_pvalue"],
            "drift_detected":       r["prediction_drift"]["drift_detected"],
            "gini_ref":             r["performance"].get("gini_ref"),
            "gini_recent":          r["performance"].get("gini_recent"),
            "gini_delta":           r["performance"].get("gini_delta"),
            "generated_at":         r["generated_at"],
        }
