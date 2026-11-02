from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship

from backend.app.database import Base


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    portfolio_id = Column(Integer, ForeignKey("portfolios.id", ondelete="CASCADE"), nullable=False)
    symbol = Column(String(50), index=True, nullable=False)
    name = Column(String(150), nullable=True)
    asset_type = Column(String(50), default="STOCK", nullable=False)  # STOCK, MUTUAL_FUND, ETF, CASH
    transaction_type = Column(String(20), nullable=False)  # BUY, SELL, DIVIDEND
    quantity = Column(Float, nullable=False)  # Supports fractional units (e.g. 142.385)
    price = Column(Float, nullable=False)  # Buy/sell price or NAV per unit
    fees = Column(Float, default=0.0, nullable=False)  # Brokerage, STT, stamp duty
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    notes = Column(Text, nullable=True)

    portfolio = relationship("Portfolio", back_populates="transactions")
