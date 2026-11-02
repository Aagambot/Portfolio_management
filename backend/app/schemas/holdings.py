from typing import List, Dict, Any, Optional
from pydantic import BaseModel


class HoldingResponse(BaseModel):
    symbol: str
    name: str
    asset_type: str  # STOCK, MUTUAL_FUND, ETF, CASH
    quantity: float
    avg_buy_price: float
    current_price: float
    total_invested: float
    current_value: float
    unrealized_pnl: float
    unrealized_pnl_percent: float
    allocation_percent: float


class PortfolioSummaryResponse(BaseModel):
    portfolio_id: int
    portfolio_name: str
    currency: str
    currency_symbol: str
    total_value: float
    total_invested: float
    realized_pnl: float
    unrealized_pnl: float
    total_pnl: float
    total_roi_percent: float
    holdings_count: int
    last_updated: str


class RiskMetricsResponse(BaseModel):
    portfolio_id: int
    annualized_volatility: float
    sharpe_ratio: float
    beta: float
    max_drawdown: float
    var_95_daily: float  # In INR
    risk_free_rate_used: float
    benchmark_used: str
    risk_level: str  # Low, Moderate, High, Aggressive
    metrics_interpretation: Dict[str, str]


class AllocationItem(BaseModel):
    name: str
    value: float
    percent: float


class PerformancePoint(BaseModel):
    date: str
    portfolio_value: float
    invested_value: float
    benchmark_normalized: float

