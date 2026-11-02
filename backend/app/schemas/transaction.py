from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class TransactionBase(BaseModel):
    symbol: str = Field(..., min_length=1, max_length=50)
    name: Optional[str] = None
    asset_type: str = Field(default="STOCK")  # STOCK, MUTUAL_FUND, ETF, CASH
    transaction_type: str = Field(...)  # BUY, SELL, DIVIDEND
    quantity: float = Field(..., gt=0)
    price: float = Field(..., gt=0)
    fees: float = Field(default=0.0, ge=0)
    timestamp: Optional[datetime] = None
    notes: Optional[str] = None


class TransactionCreate(TransactionBase):
    pass


class TransactionResponse(TransactionBase):
    id: int
    portfolio_id: int
    timestamp: datetime
    total_amount: float

    model_config = ConfigDict(from_attributes=True)
