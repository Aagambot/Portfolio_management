from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime

from backend.app.database import Base


class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(150), nullable=False)
    asset_type = Column(String(50), default="STOCK", nullable=False)  # STOCK, MUTUAL_FUND, ETF, CASH
    sector = Column(String(100), nullable=True)
    current_price = Column(Float, nullable=False)
    currency = Column(String(10), default="INR", nullable=False)
    last_updated = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

