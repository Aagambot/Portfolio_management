from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class PortfolioBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    currency: str = "INR"


class PortfolioCreate(PortfolioBase):
    pass


class PortfolioUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class PortfolioResponse(PortfolioBase):
    id: int
    user_id: int
    created_at: datetime
    holdings_count: Optional[int] = 0
    total_value: Optional[float] = 0.0

    model_config = ConfigDict(from_attributes=True)
