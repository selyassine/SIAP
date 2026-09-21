import sys
import os
import json

# Add siap-backend to path so we can import from app
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), "siap-backend"))

from app.schemas.pricing import PricingInput
from app.services.pricing_service import PricingService

def main():
    print("=== INITIALIZATION ===")
    service = PricingService()
    service.initialize()
    print("Service initialized successfully.\n")

    print("=== CREATING TEST PROFILE ===")
    input_data = PricingInput(
        veh_power=6,
        veh_age=4,
        driv_age=45,
        bonus_malus=50,
        density=1216.0,
        area="C",
        veh_brand="B1",
        veh_gas="Regular",
        region="R11",
        exposure=1.0
    )
    
    print(f"Input Profile: {input_data.dict()}\n")

    print("=== ENGINEERED FEATURES ===")
    df = service.engineer_features(input_data)
    print("Non-zero features:")
    for col in df.columns:
        val = df[col].iloc[0]
        if val != 0.0:
            print(f"  {col}: {val}")
    print()

    print("=== PREDICTIONS ===")
    res = service.predict(input_data)
    print(json.dumps(res, indent=2))

if __name__ == "__main__":
    main()
