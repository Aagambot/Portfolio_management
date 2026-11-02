from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.models.portfolio import Portfolio
from backend.app.schemas.holdings import (
    HoldingResponse, 
    PortfolioSummaryResponse, 
    RiskMetricsResponse, 
    AllocationItem, 
    PerformancePoint
)
from backend.app.services.portfolio_service import calculate_portfolio_holdings
from backend.app.services.risk_engine import calculate_portfolio_risk_metrics
from backend.app.api.deps import get_current_user

router = APIRouter(prefix="/portfolios/{portfolio_id}", tags=["Holdings & Analytics"])


def _verify_portfolio_access(db: Session, portfolio_id: int, current_user: User) -> Portfolio:
    portfolio = db.query(Portfolio).filter(
        Portfolio.id == portfolio_id, 
        Portfolio.user_id == current_user.id
    ).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    return portfolio


@router.get("/holdings", response_model=List[HoldingResponse])
def get_holdings(
    portfolio_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve all active asset holdings in the portfolio."""
    _verify_portfolio_access(db, portfolio_id, current_user)
    holdings, _, _ = calculate_portfolio_holdings(db, portfolio_id)
    return holdings


@router.get("/summary", response_model=PortfolioSummaryResponse)
def get_summary(
    portfolio_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve overall portfolio performance, total value, invested capital, and realized/unrealized P&L."""
    _verify_portfolio_access(db, portfolio_id, current_user)
    _, summary, _ = calculate_portfolio_holdings(db, portfolio_id)
    return summary


@router.get("/allocations", response_model=List[AllocationItem])
def get_allocations(
    portfolio_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve asset allocation percentages across Equities, Mutual Funds, ETFs, and Cash."""
    _verify_portfolio_access(db, portfolio_id, current_user)
    _, _, allocations = calculate_portfolio_holdings(db, portfolio_id)
    return allocations


@router.get("/risk-metrics", response_model=RiskMetricsResponse)
def get_risk_metrics(
    portfolio_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve Indian market risk metrics: Sharpe Ratio (6.8% Rf), Nifty 50 Beta, Volatility, VaR 95%, and Drawdown."""
    _verify_portfolio_access(db, portfolio_id, current_user)
    risk_metrics, _ = calculate_portfolio_risk_metrics(db, portfolio_id)
    return risk_metrics


@router.get("/performance", response_model=List[PerformancePoint])
def get_performance_history(
    portfolio_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve daily historical portfolio growth points relative to invested capital and the Nifty 50 benchmark."""
    _verify_portfolio_access(db, portfolio_id, current_user)
    _, perf_points = calculate_portfolio_risk_metrics(db, portfolio_id)
    return perf_points
