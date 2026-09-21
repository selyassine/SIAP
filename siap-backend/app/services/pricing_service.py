import json
import pickle
import numpy as np
import pandas as pd
from pathlib import Path
from typing import List, Literal

class PricingService:
    """Singleton service for insurance pricing using LightGBM + GLM models."""
    
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def initialize(self):
        """Load all ML models and metadata. Called once at app startup."""
        if self._initialized:
            return
        
        ml_dir = Path(__file__).parent.parent / "ml_models"
        
        # Load LightGBM frequency model
        with open(ml_dir / "lgb_freq.pkl", "rb") as f:
            self.lgb_freq = pickle.load(f)
        
        # Load GLM coefficients
        with open(ml_dir / "glm_coefficients.json", "r") as f:
            glm_data = json.load(f)
        self.glm_freq_coefficients = glm_data["glm_freq"]["coefficients"]
        self.glm_sev_coefficients = glm_data["glm_sev"]["coefficients"]
        
        # Load deployment metadata
        with open(ml_dir / "deployment_meta.json", "r") as f:
            self.meta = json.load(f)
        
        self.feature_columns = self.meta["feature_columns"]
        self.glm_columns = self.meta["glm_columns"]
        self.correction_lgb_sev = self.meta["correction_lgb_sev"]
        self.loading_factors = self.meta["loading_factor"]
        self.rare_regions = set(self.meta["rare_regions"])
        self.rare_brands = set(self.meta["rare_brands"])
        self.champion = self.meta["champion"]
        
        # Known brands that have their own dummy column
        self.known_brand_dummies = {"B2", "B3", "B4", "B5", "B6", "B10", "B12"}
        # B1 is the reference category (dropped by drop_first)
        self.brand_reference = "B1"
        
        # Known regions that have their own dummy column  
        self.known_region_dummies = {"R11", "R24", "R31", "R52", "R53", "R54", "R72", "R73", "R82", "R91", "R93"}
        
        self._initialized = True
    
    def _get_driv_age_band(self, age: int) -> int:
        if age <= 30: return 0
        elif age <= 45: return 1
        elif age <= 60: return 2
        elif age <= 80: return 3
        else: return 4
    
    def _get_bm_band(self, bm: int) -> int:
        if bm <= 80: return 0
        elif bm <= 100: return 1
        elif bm <= 120: return 2
        elif bm <= 150: return 3
        else: return 4
    
    def _get_veh_age_band(self, veh_age: int) -> int:
        if veh_age <= 1: return 0
        elif veh_age <= 3: return 1
        elif veh_age <= 5: return 2
        elif veh_age <= 10: return 3
        elif veh_age <= 20: return 4
        else: return 5
    
    def engineer_features(self, input_data) -> pd.DataFrame:
        """Transform raw input into feature vector matching model expectations."""
        # Initialize all features to 0
        features = {col: 0.0 for col in self.feature_columns}
        
        # Numeric features
        features["VehPower"] = float(input_data.veh_power)
        features["VehAge"] = float(input_data.veh_age)
        features["DrivAge"] = float(input_data.driv_age)
        features["BonusMalus"] = float(input_data.bonus_malus)
        features["Density"] = float(input_data.density)
        
        # Area one-hot (reference = A)
        if input_data.area != "A":
            col_name = f"Area_{input_data.area}"
            if col_name in features:
                features[col_name] = 1.0
        
        # VehBrand one-hot
        brand = input_data.veh_brand
        if brand in self.rare_brands or brand not in self.known_brand_dummies and brand != self.brand_reference:
            features["VehBrand_Other"] = 1.0
        elif brand in self.known_brand_dummies:
            features[f"VehBrand_{brand}"] = 1.0
        # else: brand == B1 (reference), all zeros
        
        # VehGas one-hot (reference = Diesel)
        if input_data.veh_gas == "Regular":
            features["VehGas_Regular"] = 1.0
        
        # Region one-hot (rare regions = reference/Other, all zeros)
        region = input_data.region
        if region not in self.rare_regions and region in self.known_region_dummies:
            features[f"Region_{region}"] = 1.0
        # else: rare region or unknown → reference (all region dummies = 0)
        
        # Band features
        driv_band = self._get_driv_age_band(input_data.driv_age)
        bm_band = self._get_bm_band(input_data.bonus_malus)
        veh_band = self._get_veh_age_band(input_data.veh_age)
        
        # DrivAge_band one-hot (reference = band 0)
        if driv_band != 0:
            features[f"DrivAge_band_{float(driv_band)}"] = 1.0
        
        # BonusMalus_band one-hot (reference = band 0)
        if bm_band != 0:
            features[f"BonusMalus_band_{float(bm_band)}"] = 1.0
        
        # VehAge_band one-hot (reference = band 0)
        if veh_band != 0:
            features[f"VehAge_band_{float(veh_band)}"] = 1.0
        
        return pd.DataFrame([features])
    
    def predict(self, input_data) -> dict:
        """Predict pure and commercial premium for a single policy."""
        X = self.engineer_features(input_data)
        exposure = input_data.exposure
        
        # LightGBM frequency prediction (with offset)
        raw_lgb = self.lgb_freq.predict(X[self.feature_columns], raw_score=True)
        freq_pred = float(np.exp(raw_lgb[0] + np.log(exposure)))
        
        # GLM severity prediction (manual dot product)
        # Build GLM feature vector (includes const=1)
        glm_features = {col: 0.0 for col in self.glm_columns}
        glm_features["const"] = 1.0
        for col in self.feature_columns:
            if col in glm_features:
                glm_features[col] = float(X[col].iloc[0])
        
        # Calculate severity: exp(sum of coeff * feature)
        log_sev = sum(
            self.glm_sev_coefficients.get(col, 0.0) * glm_features[col]
            for col in self.glm_columns
        )
        sev_pred = float(np.exp(log_sev))
        
        # Pure premium (champion = PP_LGBM_GLM: no correction needed for GLM sev)
        pure_premium = freq_pred * sev_pred
        
        # Commercial premium
        loading = self.loading_factors[self.champion]
        commercial_premium = pure_premium / loading
        
        # Risk level
        risk_level = self._assess_risk_level(input_data.bonus_malus, freq_pred, pure_premium)
        
        return {
            "pure_premium": round(pure_premium, 2),
            "commercial_premium": round(commercial_premium, 2),
            "frequency": round(freq_pred, 6),
            "severity": round(sev_pred, 2),
            "risk_level": risk_level,
            "model_used": self.champion,
            "loading_factor": round(loading, 6),
        }
    
    def predict_batch(self, inputs: list) -> dict:
        results = [self.predict(inp) for inp in inputs]
        total_pp = sum(r["pure_premium"] for r in results)
        return {
            "results": results,
            "summary": {
                "total_pure_premium": round(total_pp, 2),
                "avg_pure_premium": round(total_pp / len(results), 2) if results else 0,
                "count": len(results),
            }
        }
    
    def _assess_risk_level(self, bonus_malus, frequency, pure_premium):
        if bonus_malus <= 70 and frequency < 0.08:
            return "Low"
        elif bonus_malus <= 100 and frequency < 0.12:
            return "Medium"
        elif bonus_malus <= 130 or pure_premium > 200:
            return "High"
        else:
            return "Very High"
