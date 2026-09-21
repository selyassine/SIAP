import json
from pathlib import Path
from typing import List
import joblib
import pandas as pd

from app.schemas.fraud import FraudInput, FraudOutput, BatchFraudOutput

class FraudService:
    _instance = None
    _initialized = False

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
            cls._instance.initialize()
        return cls._instance

    def initialize(self):
        if self._initialized:
            return

        ml_dir = Path(__file__).parent.parent / "ml_models" / "fraud"
        
        # Load XGBoost model
        self.xgb_model = joblib.load(ml_dir / "xgb_fraud.pkl")
        
        # Load Label Encoders
        self.label_encoders = joblib.load(ml_dir / "label_encoders.pkl")
        
        # Load metadata
        with open(ml_dir / "fraud_meta.json") as f:
            self.meta = json.load(f)
            
        self.feature_columns = self.meta["feature_columns"]
        self.cat_columns = self.meta["categorical_columns"]
        self.optimal_threshold = self.meta["optimal_threshold"]
        
        self._initialized = True

    def preprocess(self, input_data: FraudInput) -> pd.DataFrame:
        """
        Transformer FraudInput -> DataFrame aligné sur feature_columns.
        """
        # Convert Pydantic model to dict
        data_dict = input_data.model_dump()
        
        # Rename keys to match model features
        if "capital_gains" in data_dict:
            data_dict["capital-gains"] = data_dict.pop("capital_gains")
        if "capital_loss" in data_dict:
            data_dict["capital-loss"] = data_dict.pop("capital_loss")
            
        # Create a single-row DataFrame
        df = pd.DataFrame([data_dict])
        
        # Apply label encoding for categorical columns
        for col in self.cat_columns:
            if col in df.columns:
                le = self.label_encoders.get(col)
                if le is not None:
                    try:
                        df[col] = le.transform(df[col])
                    except ValueError:
                        # Fallback to the most frequent/first class if unknown value
                        fallback_value = le.classes_[0]
                        df[col] = le.transform([fallback_value])[0]
        
        # Ensure all required features are present and in the exact order
        for col in self.feature_columns:
            if col not in df.columns:
                # Add missing column with 0 or NaN as appropriate
                df[col] = 0
                
        return df[self.feature_columns]

    def _classify_risk(self, score: float) -> str:
        if score < 30: return "Low"
        elif score < 60: return "Medium"
        elif score < 80: return "High"
        else: return "Very High"

    def _get_top_factors(self, data_dict: dict) -> List[str]:
        # Filter top features based on whether they have a "truthy" or non-zero value in the input
        top_factors = []
        top_features_meta = self.meta.get("top_features", [])
        
        for f_meta in top_features_meta:
            fname = f_meta["feature"]
            val = data_dict.get(fname)
            # Consider non-null and non-zero values
            # For strings, non-empty. For numbers, non-zero. Also '?' is considered empty usually but handled already
            if val is not None and val != "" and val != "?" and val != 0 and val != "0":
                top_factors.append(fname)
            if len(top_factors) >= 3:
                break
                
        # Fallback if less than 3
        if not top_factors:
            top_factors = [f["feature"] for f in top_features_meta[:3]]
            
        return top_factors

    def predict(self, input_data: FraudInput) -> FraudOutput:
        # Preprocess to get aligned DataFrame
        X = self.preprocess(input_data)
        
        # Get probability (class 1)
        prob = float(self.xgb_model.predict_proba(X)[0, 1])
        score = round(prob * 100, 1)
        
        # Determine risk and alert
        risk_level = self._classify_risk(score)
        alert = prob >= self.optimal_threshold
        
        # Extract top risk factors from the original input dict
        data_dict = input_data.model_dump()
        top_factors = self._get_top_factors(data_dict)
        
        return FraudOutput(
            fraud_score=score,
            risk_level=risk_level,
            fraud_probability=round(prob, 4),
            alert=alert,
            top_risk_factors=top_factors,
            model_performance=self.meta["performance"]
        )

    def predict_batch(self, inputs: List[FraudInput]) -> BatchFraudOutput:
        results = [self.predict(inp) for inp in inputs]
        n_alerts = sum(r.alert for r in results)
        
        if not results:
            return BatchFraudOutput(
                results=[],
                summary={
                    "total_claims": 0,
                    "alerts_raised": 0,
                    "alert_rate": 0.0,
                    "avg_fraud_score": 0.0
                }
            )
            
        return BatchFraudOutput(
            results=results,
            summary={
                "total_claims": len(results),
                "alerts_raised": n_alerts,
                "alert_rate": round(n_alerts / len(results) * 100, 1),
                "avg_fraud_score": round(sum(r.fraud_score for r in results) / len(results), 1)
            }
        )

fraud_service = FraudService.get_instance()
