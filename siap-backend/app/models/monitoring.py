from sqlalchemy import Column, Integer, String, Float, Date, JSON, DateTime
from sqlalchemy.sql import func
from app.db.session import Base
from datetime import datetime

class MonitoringGlobalKpis(Base):
    __tablename__ = "monitoring_global_kpis"

    id = Column(Integer, primary_key=True, autoincrement=True)
    snapshot_date = Column(Date, nullable=False)
    total_policies = Column(Integer)
    total_exposure = Column(Float)
    total_claims = Column(Integer)
    total_claim_amount = Column(Float)
    total_premium = Column(Float)
    frequency = Column(Float)
    severity = Column(Float)
    pure_premium = Column(Float)
    loss_ratio = Column(Float)
    combined_ratio = Column(Float)
    expense_ratio = Column(Float)
    loading_factor = Column(Float)
    freq_market = Column(Float)
    lr_market = Column(Float)
    cr_market = Column(Float)
    sev_market = Column(Float)
    source = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow, server_default=func.now())

class MonitoringRegionKpis(Base):
    __tablename__ = "monitoring_region_kpis"

    id = Column(Integer, primary_key=True, autoincrement=True)
    snapshot_date = Column(Date, nullable=False)
    region_code = Column(String(10), index=True)
    policies = Column(Integer)
    exposure = Column(Float)
    claims = Column(Integer)
    claim_amount = Column(Float)
    premium = Column(Float)
    frequency = Column(Float)
    severity = Column(Float)
    loss_ratio = Column(Float)
    combined_ratio = Column(Float)
    risk_level = Column(String(20))
    created_at = Column(DateTime, default=datetime.utcnow, server_default=func.now())

class MonitoringYearlyKpis(Base):
    __tablename__ = "monitoring_yearly_kpis"

    id = Column(Integer, primary_key=True, autoincrement=True)
    snapshot_date = Column(Date, nullable=False)
    year = Column(Integer, index=True)
    total_claims = Column(Integer)
    fraud_claims = Column(Integer)
    fraud_rate_pct = Column(Float)
    avg_total_claim = Column(Float)
    loss_ratio = Column(Float)
    combined_ratio = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow, server_default=func.now())

class MonitoringQuarterlyKpis(Base):
    __tablename__ = "monitoring_quarterly_kpis"

    id = Column(Integer, primary_key=True, autoincrement=True)
    snapshot_date = Column(Date, nullable=False)
    quarter = Column(String(10), index=True)
    total_claims = Column(Integer)
    fraud_claims = Column(Integer)
    avg_claim = Column(Float)
    fraud_rate_pct = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow, server_default=func.now())

class MonitoringFraudStats(Base):
    __tablename__ = "monitoring_fraud_stats"

    id = Column(Integer, primary_key=True, autoincrement=True)
    snapshot_date = Column(Date, nullable=False)
    total_claims = Column(Integer)
    fraud_claims = Column(Integer)
    fraud_rate_pct = Column(Float)
    avg_fraud_amount = Column(Float)
    avg_legit_amount = Column(Float)
    by_incident_type = Column(JSON)
    by_severity = Column(JSON)
    by_state = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow, server_default=func.now())

class MonitoringReserves(Base):
    __tablename__ = "monitoring_reserves"

    id = Column(Integer, primary_key=True, autoincrement=True)
    snapshot_date = Column(Date, nullable=False)
    company_name = Column(String(200))
    lob = Column(String(50))
    reserves_by_year = Column(JSON)
    premium_by_year = Column(JSON)
    reserve_to_premium = Column(JSON)
    total_ibnr = Column(Float)
    total_premium_cas = Column(Float)
    ibnr_to_premium_ratio = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow, server_default=func.now())
