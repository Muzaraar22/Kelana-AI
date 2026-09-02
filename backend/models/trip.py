from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, Text, ForeignKey
from sqlalchemy.sql import func
from database import Base

class Trip (Base) :
    __tablename__ = "trips"
    id                  = Column(Integer, primary_key=True)
    user_id             = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    destination         = Column(String, nullable=False)
    days                = Column(Integer, nullable=False)
    currency            = Column(String, nullable=False)
    budget              = Column(Float, nullable=False)
    category            = Column(String, nullable=False)
    daily_budget        = Column(Float, nullable=False)
    transportation_recommendation = Column(String, nullable=False)
    travel_month        = Column(String, nullable=False)
    travel_season       = Column(String, nullable=False)
    recommended_places  = Column(JSON, nullable=True)
    ai_recommendation   = Column(Text, nullable=True)
    travel_style        = Column(Text, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
