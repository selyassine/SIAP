from sqlalchemy import Column, Integer, String, Date, Float, JSON, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.db.session import Base

class ReservingCompany(Base):
    __tablename__ = "reserving_companies"

    id = Column(Integer, primary_key=True, index=True)
    grcode = Column(Integer, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    line_of_business = Column(String, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

class ReservingSnapshot(Base):
    __tablename__ = "reserving_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    grcode = Column(Integer, ForeignKey("reserving_companies.grcode"), index=True, nullable=False)
    snapshot_date = Column(Date, nullable=False)
    
    # Chain Ladder
    cl_total_reserve = Column(Float)
    cl_ldf = Column(JSON)
    cl_cdf = Column(JSON)
    cl_ultimate_by_year = Column(JSON)
    cl_reserve_by_year = Column(JSON)
    
    # Mack
    mack_total_reserve = Column(Float)
    mack_total_std_error = Column(Float)
    mack_ci_95_lower = Column(Float)
    mack_ci_95_upper = Column(Float)
    mack_by_year = Column(JSON)
    
    # BF
    bf_apriori_loss_ratio = Column(Float)
    bf_total_reserve = Column(Float)
    bf_by_year = Column(JSON)
    
    # Bootstrap
    bootstrap_n_sims = Column(Integer)
    bootstrap_mean = Column(Float)
    bootstrap_std = Column(Float)
    bootstrap_percentiles = Column(JSON)
    bootstrap_histogram = Column(JSON)
    
    # Backtest
    backtest_mape_pct = Column(Float)
    backtest_by_year = Column(JSON)
    
    created_at = Column(DateTime, server_default=func.now())

class ReservingTriangle(Base):
    __tablename__ = "reserving_triangles"

    id = Column(Integer, primary_key=True, index=True)
    grcode = Column(Integer, ForeignKey("reserving_companies.grcode"), index=True, nullable=False)
    snapshot_date = Column(Date, nullable=False)
    
    origin_years = Column(JSON)
    development_lags = Column(JSON)
    cumulative_paid = Column(JSON)
    
    created_at = Column(DateTime, server_default=func.now())
