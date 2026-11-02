from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.models.portfolio import Portfolio
from backend.app.models.transaction import Transaction
from backend.app.schemas.transaction import TransactionCreate, TransactionResponse
from backend.app.services.portfolio_service import calculate_portfolio_holdings
from backend.app.api.deps import get_current_user

router = APIRouter(tags=["Transactions"])


@router.get("/portfolios/{portfolio_id}/transactions", response_model=List[TransactionResponse])
def list_transactions(
    portfolio_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all transactions recorded for the portfolio."""
    portfolio = db.query(Portfolio).filter(
        Portfolio.id == portfolio_id, 
        Portfolio.user_id == current_user.id
    ).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    transactions = (
        db.query(Transaction)
        .filter(Transaction.portfolio_id == portfolio_id)
        .order_by(Transaction.timestamp.desc(), Transaction.id.desc())
        .all()
    )

    results = []
    for tx in transactions:
        total = (tx.quantity * tx.price) + (tx.fees or 0.0)
        res = TransactionResponse(
            id=tx.id,
            portfolio_id=tx.portfolio_id,
            symbol=tx.symbol,
            name=tx.name,
            asset_type=tx.asset_type,
            transaction_type=tx.transaction_type,
            quantity=tx.quantity,
            price=tx.price,
            fees=tx.fees,
            timestamp=tx.timestamp,
            notes=tx.notes,
            total_amount=round(total, 2)
        )
        results.append(res)
    return results


@router.post("/portfolios/{portfolio_id}/transactions", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
def create_transaction(
    portfolio_id: int,
    tx_in: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a new BUY or SELL transaction to the portfolio with validation."""
    portfolio = db.query(Portfolio).filter(
        Portfolio.id == portfolio_id, 
        Portfolio.user_id == current_user.id
    ).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    # If SELL order, check if user holds sufficient units
    if tx_in.transaction_type == "SELL":
        holdings, _, _ = calculate_portfolio_holdings(db, portfolio.id)
        current_holding = next((h for h in holdings if h.symbol == tx_in.symbol), None)
        available_units = current_holding.quantity if current_holding else 0.0

        if available_units < tx_in.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot execute SELL order: you currently hold {available_units:.4f} units of {tx_in.symbol}, but attempted to sell {tx_in.quantity:.4f} units."
            )

    tx_time = tx_in.timestamp or datetime.now(timezone.utc)
    tx = Transaction(
        portfolio_id=portfolio.id,
        symbol=tx_in.symbol.upper(),
        name=tx_in.name,
        asset_type=tx_in.asset_type,
        transaction_type=tx_in.transaction_type.upper(),
        quantity=tx_in.quantity,
        price=tx_in.price,
        fees=tx_in.fees or 0.0,
        timestamp=tx_time,
        notes=tx_in.notes
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)

    total = (tx.quantity * tx.price) + tx.fees
    return TransactionResponse(
        id=tx.id,
        portfolio_id=tx.portfolio_id,
        symbol=tx.symbol,
        name=tx.name,
        asset_type=tx.asset_type,
        transaction_type=tx.transaction_type,
        quantity=tx.quantity,
        price=tx.price,
        fees=tx.fees,
        timestamp=tx.timestamp,
        notes=tx.notes,
        total_amount=round(total, 2)
    )


@router.delete("/transactions/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a transaction."""
    tx = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    # Verify user owns the portfolio
    portfolio = db.query(Portfolio).filter(
        Portfolio.id == tx.portfolio_id, 
        Portfolio.user_id == current_user.id
    ).first()
    if not portfolio:
        raise HTTPException(status_code=403, detail="Forbidden")

    db.delete(tx)
    db.commit()
    return None
