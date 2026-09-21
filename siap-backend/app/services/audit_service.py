import json
from pathlib import Path
from fastapi import HTTPException


class AuditService:
    """
    Service singleton servant le rapport d'audit d'équité du Module 1.

    Contrairement aux autres services SIAP, celui-ci ne fait pas de calcul
    en temps réel -- il sert un rapport pré-calculé par le notebook
    10_bias_detector.ipynb, qui doit être régénéré manuellement après
    chaque ré-entraînement du modèle de pricing (Module 1).
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

        report_path = Path(__file__).parent.parent / "data" / "audit" / "bias_audit_report.json"

        if not report_path.exists():
            # Le module reste fonctionnel mais signale l'absence de rapport
            # -- ne pas faire planter le démarrage de l'app pour autant
            self.report = None
            print(f"[AuditService] WARNING: {report_path} introuvable. "
                  f"Le rapport d'audit ne sera pas disponible tant que le "
                  f"notebook 10_bias_detector.ipynb n'aura pas été exécuté.")
        else:
            with open(report_path, encoding="utf-8") as f:
                self.report = json.load(f)
            print(f"[AuditService] Rapport d'audit chargé "
                  f"(score={self.report.get('equity_score')}/100)")

        self._initialized = True

    @classmethod
    def get_instance(cls):
        instance = cls()
        if not instance._initialized:
            instance.initialize()
        return instance

    def get_full_report(self) -> dict:
        if self.report is None:
            raise HTTPException(
                status_code=404,
                detail="Aucun rapport d'audit disponible. Exécuter "
                       "10_bias_detector.ipynb pour en générer un."
            )
        return self.report

    def get_summary(self) -> dict:
        if self.report is None:
            raise HTTPException(status_code=404, detail="Aucun rapport d'audit disponible.")

        return {
            "equity_score": self.report["equity_score"],
            "verdict": self.report["verdict"],
            "flags_count": len(self.report["flags"]),
            "audit_date": self.report["audit_date"],
            "max_regional_disparity_pct": self.report["tests"]["regional_disparity"]["max_disparity_pct"],
            "proxy_total_pct": self.report["tests"]["shap_decomposition"]["proxy_total_pct"],
        }
