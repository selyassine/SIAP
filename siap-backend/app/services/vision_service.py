import json
import base64
import os
import uuid
import tempfile
from io import BytesIO
from pathlib import Path
from PIL import Image


class VisionService:
    """Singleton service for vehicle damage assessment using YOLOv8."""

    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def initialize(self):
        """Load YOLOv8 model and metadata. Called once at startup."""
        if self._initialized:
            return

        from ultralytics import YOLO

        ml_dir = Path(__file__).parent.parent / "ml_models" / "vision"

        # Charger le modèle YOLOv8
        self.model = YOLO(str(ml_dir / "yolo_car_damage.pt"))

        # Charger les métadonnées
        with open(ml_dir / "cv_meta.json", encoding="utf-8") as f:
            self.meta = json.load(f)

        self.class_names = self.meta["class_names"]
        self.severity_mapping = self.meta["severity_mapping"]
        self.cost_estimate = self.meta["cost_estimate"]
        self.conf_threshold = self.meta["conf_threshold"]
        self.iou_threshold = self.meta["iou_threshold"]
        self.imgsz = self.meta["imgsz"]

        self.severity_order = {
            'Minor': 1, 'Moderate': 2, 'Severe': 3, 'Total Loss': 4
        }

        self._initialized = True
        print("[VisionService] YOLOv8 model loaded successfully")

    @classmethod
    def get_instance(cls) -> "VisionService":
        instance = cls()
        if not instance._initialized:
            instance.initialize()
        return instance

    def analyze(self, image_bytes: bytes) -> dict:
        """
        Analyser une image de véhicule et retourner le rapport de dégâts.

        Args:
            image_bytes: contenu de l'image (JPEG, PNG, WebP)

        Returns:
            dict complet avec détections, sévérité, coût, image annotée
        """
        # Sauvegarder temporairement l'image avec nom unique
        img = Image.open(BytesIO(image_bytes)).convert("RGB")
        tmp_dir = tempfile.gettempdir()
        tmp_path = os.path.join(tmp_dir, f"siap_{uuid.uuid4().hex}.jpg")
        img.save(tmp_path, format="JPEG", quality=95)

        try:
            # Inférence YOLO
            results = self.model.predict(
                source=tmp_path,
                conf=0.15,      # était 0.25
                iou=0.40,       # était 0.45
                imgsz=self.imgsz,
                verbose=False
            )
            result = results[0]

            # Extraire les détections
            detections = []
            for box in result.boxes:
                cls_id = int(box.cls[0])
                if cls_id >= len(self.class_names):
                    continue
                class_name = self.class_names[cls_id]
                severity = self.severity_mapping.get(class_name, 'Moderate')
                detections.append({
                    'class_name': class_name,
                    'confidence': round(float(box.conf[0]), 3),
                    'severity': severity,
                    'bbox': [round(float(v), 1) for v in box.xyxy[0].tolist()]
                })

            # Sévérité globale (worst case actuariel)
            if not detections:
                overall_severity = 'No Damage Detected'
                cost = {'min': 0, 'central': 0, 'max': 0, 'currency': 'EUR'}
            else:
                worst = max(
                    detections,
                    key=lambda d: self.severity_order.get(d['severity'], 0)
                )
                overall_severity = worst['severity']
                cost_raw = self.cost_estimate[overall_severity]
                cost = {**cost_raw, 'currency': 'EUR'}

            # Image annotée → base64
            annotated = result.plot()
            pil_ann = Image.fromarray(annotated[..., ::-1])  # BGR → RGB
            buf = BytesIO()
            pil_ann.save(buf, format='JPEG', quality=85)
            annotated_b64 = base64.b64encode(buf.getvalue()).decode('utf-8')

        finally:
            # Nettoyage du fichier temporaire
            if os.path.exists(tmp_path):
                os.remove(tmp_path)

        return {
            'damage_detected': len(detections) > 0,
            'n_damage_zones': len(detections),
            'detections': detections,
            'overall_severity': overall_severity,
            'cost_estimate': cost,
            'confidence_avg': round(
                sum(d['confidence'] for d in detections) / len(detections), 3
            ) if detections else 0.0,
            'annotated_image_b64': annotated_b64,
        }

    def check_fraud_coherence(
        self,
        visual_report: dict,
        declared_severity: str,
        declared_amount: float
    ) -> dict:
        """
        Croiser l'analyse visuelle avec la déclaration du sinistre.
        Reproduit EXACTEMENT la logique du notebook Bloc 8.
        """
        alerts = []
        incoherence_score = 0
        visual_severity = visual_report['overall_severity']
        cost_estimate = visual_report['cost_estimate']

        # Règle 1 : sévérité visuelle > déclarée de plus de 1 niveau
        if visual_severity != 'No Damage Detected':
            visual_order = self.severity_order.get(visual_severity, 0)
            declared_order = self.severity_order.get(declared_severity, 0)
            if visual_order > declared_order + 1:
                gap = visual_order - declared_order
                incoherence_score += min(40, gap * 15)
                alerts.append(
                    f"Sévérité visuelle ({visual_severity}) supérieure à la "
                    f"déclaration ({declared_severity}) de {gap} niveaux"
                )

        # Règle 2 : montant déclaré vs fourchette estimée
        if visual_severity not in ('No Damage Detected', 'Total Loss'):
            est_min = cost_estimate.get('min', 0)
            est_max = cost_estimate.get('max', 0)
            est_central = cost_estimate.get('central', 1)
            if declared_amount > est_max * 1.5:
                ratio = declared_amount / est_central
                incoherence_score += min(35, int((ratio - 1) * 20))
                alerts.append(
                    f"Montant déclaré ({declared_amount:,.0f}€) supérieur à "
                    f"l'estimation ({est_min:,}-{est_max:,}€)"
                )
            elif declared_amount < est_min * 0.3 and declared_amount > 0:
                incoherence_score += 15
                alerts.append(
                    f"Montant déclaré ({declared_amount:,.0f}€) inférieur à "
                    f"l'estimation minimale ({est_min:,}€)"
                )

        # Règle 3 : aucun dégât visuel mais montant > 500€
        if not visual_report['damage_detected'] and declared_amount > 500:
            incoherence_score += 30
            alerts.append(
                f"Aucun dégât détecté visuellement mais montant déclaré "
                f"de {declared_amount:,.0f}€"
            )

        incoherence_score = min(100, incoherence_score)

        if incoherence_score >= 60:
            recommendation = 'INVESTIGATION_REQUIRED'
        elif incoherence_score >= 30:
            recommendation = 'MANUAL_REVIEW'
        else:
            recommendation = 'AUTO_APPROVE'

        return {
            'incoherence_score': incoherence_score,
            'visual_severity': visual_severity,
            'declared_severity': declared_severity,
            'visual_cost_estimate': cost_estimate,
            'declared_amount': declared_amount,
            'alerts': alerts,
            'recommendation': recommendation,
            'fraud_flag': incoherence_score >= 60
        }

    def get_model_info(self) -> dict:
        return {
            'model_type': self.meta['model_type'],
            'dataset': self.meta['dataset'],
            'n_classes': self.meta['n_classes'],
            'performance': self.meta['performance'],
            'severity_mapping': self.severity_mapping,
            'cost_estimate': self.cost_estimate,
        }
