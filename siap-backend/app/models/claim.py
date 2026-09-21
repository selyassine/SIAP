from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, ForeignKey
from sqlalchemy.sql import func
from app.db.session import Base


class Claim(Base):
    """
    Sinistre créé manuellement via le workflow Claims Management.
    Réutilise exactement les champs de FraudInput (Module 2) pour que
    chaque sinistre créé soit automatiquement scorable par FraudService.
    """
    __tablename__ = "claims"

    id = Column(Integer, primary_key=True, autoincrement=True)
    claim_number = Column(String(20), unique=True, index=True)

    months_as_customer = Column(Integer)
    age = Column(Integer)
    policy_state = Column(String(10))
    policy_csl = Column(String(20))
    policy_deductable = Column(Integer)
    policy_annual_premium = Column(Float)
    umbrella_limit = Column(Integer)
    insured_sex = Column(String(10))
    insured_education_level = Column(String(50))
    insured_occupation = Column(String(50))
    insured_hobbies = Column(String(50))
    insured_relationship = Column(String(30))
    capital_gains = Column(Float)
    capital_loss = Column(Float)

    incident_type = Column(String(50))
    collision_type = Column(String(50))
    incident_severity = Column(String(30))
    authorities_contacted = Column(String(30))
    incident_state = Column(String(10))
    incident_city = Column(String(50))
    incident_location = Column(String(100))
    incident_hour_of_the_day = Column(Integer)
    number_of_vehicles_involved = Column(Integer)
    property_damage = Column(String(10))
    bodily_injuries = Column(Integer)
    witnesses = Column(Integer)
    police_report_available = Column(String(10))
    total_claim_amount = Column(Float)
    injury_claim = Column(Float)
    property_claim = Column(Float)
    vehicle_claim = Column(Float)

    auto_make = Column(String(50))
    auto_model = Column(String(50))
    auto_year = Column(Integer)

    fraud_score = Column(Float, nullable=True)
    fraud_risk_level = Column(String(20), nullable=True)
    fraud_alert = Column(Boolean, default=False)

    status = Column(String(20), default="pending")
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
