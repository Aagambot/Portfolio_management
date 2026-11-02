from datetime import datetime, timezone
from typing import List, Dict, Any, Tuple
from sqlalchemy.orm import Session

from backend.app.models.portfolio import Portfolio
from backend.app.models.transaction import Transaction
from backend.app.schemas.holdings import HoldingResponse, PortfolioSummaryResponse, AllocationItem
from backend.app.services.market_data import get_current_price, normalize_symbol
from backend.app.core.config import settings


def calculate_portfolio_holdings(db: Session, portfolio_id: int) -> Tuple[List[HoldingResponse], PortfolioSummaryResponse, List[AllocationItem]]:
    """
    Compute current holdings, weighted average cost basis, realized & unrealized P&L,
    and asset allocation for a given portfolio.
    """
    portfolio = db.query(Portfolio).filter(Portfolio.id == portfolio_id).first()
    if not portfolio:
        raise ValueError("Portfolio not found")

    # Fetch all transactions ordered chronologically
    transactions = (
        db.query(Transaction)
        .filter(Transaction.portfolio_id == portfolio_id)
        .order_by(Transaction.timestamp.asc(), Transaction.id.asc())
        .all()
    )

    # Asset state tracking: {symbol: {"units": float, "total_cost": float, "name": str, "asset_type": str}}
    positions: Dict[str, Dict[str, Any]] = {}
    total_realized_pnl = 0.0

    for tx in transactions:
        sym = tx.symbol
        if sym not in positions:
            positions[sym] = {
                "units": 0.0,
                "total_cost": 0.0,
                "name": tx.name or sym,
                "asset_type": tx.asset_type or "STOCK",
                "last_tx_price": tx.price
            }

        pos = positions[sym]
        pos["name"] = tx.name or pos["name"]
        pos["asset_type"] = tx.asset_type or pos["asset_type"]

        if tx.transaction_type == "BUY":
            cost_increase = (tx.quantity * tx.price) + (tx.fees or 0.0)
            pos["total_cost"] += cost_increase
            pos["units"] += tx.quantity
            pos["last_tx_price"] = tx.price

        elif tx.transaction_type == "SELL":
            if pos["units"] <= 0:
                # Disallow selling unowned asset
                continue
            
            sell_qty = min(tx.quantity, pos["units"])
            avg_cost = pos["total_cost"] / pos["units"]
            realized = (tx.price - avg_cost) * sell_qty - (tx.fees or 0.0)
            total_realized_pnl += realized

            pos["units"] -= sell_qty
            pos["total_cost"] = pos["units"] * avg_cost
            pos["last_tx_price"] = tx.price

    # Filter out closed positions (units == 0) and evaluate current market values
    holdings_list: List[HoldingResponse] = []
    total_portfolio_value = 0.0
    total_portfolio_invested = 0.0
    total_unrealized_pnl = 0.0

    for sym, pos in positions.items():
        if round(pos["units"], 6) <= 0:
            continue

        units = pos["units"]
        total_cost = pos["total_cost"]
        avg_price = total_cost / units if units > 0 else 0.0

        current_price, name, sector = get_current_price(
            sym, 
            asset_type=pos["asset_type"], 
            fallback_price=pos["last_tx_price"]
        )

        current_val = units * current_price
        unrealized = current_val - total_cost
        unrealized_pct = (unrealized / total_cost * 100.0) if total_cost > 0 else 0.0

        total_portfolio_value += current_val
        total_portfolio_invested += total_cost
        total_unrealized_pnl += unrealized

        holdings_list.append(HoldingResponse(
            symbol=sym,
            name=pos["name"] or name,
            asset_type=pos["asset_type"],
            quantity=round(units, 4),
            avg_buy_price=round(avg_price, 2),
            current_price=round(current_price, 2),
            total_invested=round(total_cost, 2),
            current_value=round(current_val, 2),
            unrealized_pnl=round(unrealized, 2),
            unrealized_pnl_percent=round(unrealized_pct, 2),
            allocation_percent=0.0  # calculated in second pass below
        ))

    # Calculate allocation percentages
    for h in holdings_list:
        if total_portfolio_value > 0:
            h.allocation_percent = round((h.current_value / total_portfolio_value) * 100.0, 2)
        else:
            h.allocation_percent = 0.0

    # Sort holdings descending by value
    holdings_list.sort(key=lambda x: x.current_value, reverse=True)

    # Compute Asset Allocation by category (Equities, Mutual Funds, ETFs, Cash)
    allocation_map: Dict[str, float] = {}
    for h in holdings_list:
        category = "Indian Equities"
        if h.asset_type == "MUTUAL_FUND":
            category = "Mutual Funds"
        elif h.asset_type == "ETF":
            category = "ETFs"
        elif h.asset_type == "CASH":
            category = "Cash & Liquid"
        
        allocation_map[category] = allocation_map.get(category, 0.0) + h.current_value

    allocations: List[AllocationItem] = []
    for cat, val in allocation_map.items():
        pct = (val / total_portfolio_value * 100.0) if total_portfolio_value > 0 else 0.0
        allocations.append(AllocationItem(name=cat, value=round(val, 2), percent=round(pct, 2)))

    # Overall Summary
    total_pnl = total_realized_pnl + total_unrealized_pnl
    total_roi_pct = (total_pnl / total_portfolio_invested * 100.0) if total_portfolio_invested > 0 else 0.0

    summary = PortfolioSummaryResponse(
        portfolio_id=portfolio.id,
        portfolio_name=portfolio.name,
        currency=portfolio.currency,
        currency_symbol=settings.CURRENCY_SYMBOL,
        total_value=round(total_portfolio_value, 2),
        total_invested=round(total_portfolio_invested, 2),
        realized_pnl=round(total_realized_pnl, 2),
        unrealized_pnl=round(total_unrealized_pnl, 2),
        total_pnl=round(total_pnl, 2),
        total_roi_percent=round(total_roi_pct, 2),
        holdings_count=len(holdings_list),
        last_updated=datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    )

    return holdings_list, summary, allocations
