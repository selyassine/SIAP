from typing import List, Literal, Optional, Dict
from pydantic import BaseModel, Field, ConfigDict

class PricingInput(BaseModel):
    veh_power: int = Field(..., ge=1, le=20)
    veh_age: int = Field(..., ge=0, le=100)
    driv_age: int = Field(..., ge=18, le=99)
    bonus_malus: int = Field(..., ge=50, le=350)
    density: float = Field(..., ge=1.0)
    area: Literal["A", "B", "C", "D", "E", "F"]
    veh_brand: Literal["B1", "B2", "B3", "B4", "B5", "B6", "B7", "B8", "B9", "B10", "B11", "B12", "B13", "B14"]
    veh_gas: Literal["Diesel", "Regular"]
    region: Literal[
        "R11", "R21", "R22", "R23", "R24", "R25", "R26", "R31", 
        "R41", "R42", "R43", "R52", "R53", "R54", "R72", "R73", 
        "R74", "R82", "R83", "R91", "R93", "R94"
    ]
    exposure: float = Field(1.0, ge=0.0, le=1.0)

class PricingOutput(BaseModel):
    model_config = ConfigDict(protected_namespaces=())

    pure_premium: float
    commercial_premium: float
    frequency: float
    severity: float
    risk_level: Literal["Low", "Medium", "High", "Very High"]
    model_used: str
    loading_factor: float

class BatchPricingInput(BaseModel):
    policies: List[PricingInput] = Field(..., max_length=1000)

class BatchSummary(BaseModel):
    total_pure_premium: float
    avg_pure_premium: float
    count: int

class BatchPricingOutput(BaseModel):
    results: List[PricingOutput]
    summary: BatchSummary

class ModelInfo(BaseModel):
    champion: str
    rare_regions: List[str]
    rare_brands: List[str]
    lib_versions: Dict[str, str]
