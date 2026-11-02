from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Response
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.models.portfolio import Portfolio
from backend.app.models.transaction import Transaction
from backend.app.schemas.portfolio import PortfolioCreate, PortfolioResponse, PortfolioUpdate
from backend.app.schemas.csv_import import CsvImportResult, CsvImportPreview
from backend.app.services.csv_service import parse_csv_transactions, SAMPLE_INDIAN_CSV_CONTENT
from backend.app.services.portfolio_service import calculate_portfolio_holdings
from backend.app.api.deps import get_current_user

router = APIRouter(prefix="/portfolios", tags=["Portfolios"])


@router.get("/sample-csv")
def download_sample_csv():
    """Download a standardized sample Indian Portfolio CSV statement."""
    return Response(
        content=SAMPLE_INDIAN_CSV_CONTENT,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=indian_portfolio_sample.csv"}
    )


@router.get("", response_model=List[PortfolioResponse])
def list_portfolios(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve all portfolios owned by the active user."""
    portfolios = db.query(Portfolio).filter(Portfolio.user_id == current_user.id).all()
    results = []
    for p in portfolios:
        try:
            holdings, summary, _ = calculate_portfolio_holdings(db, p.id)
            total_val = summary.total_value
            count = len(holdings)
        except Exception:
            total_val = 0.0
            count = 0
        
        resp = PortfolioResponse.model_validate(p)
        resp.total_value = round(total_val, 2)
        resp.holdings_count = count
        results.append(resp)
    return results


@router.post("", response_model=PortfolioResponse, status_code=status.HTTP_201_CREATED)
def create_portfolio(
    portfolio_in: PortfolioCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new portfolio."""
    portfolio = Portfolio(
        user_id=current_user.id,
        name=portfolio_in.name,
        description=portfolio_in.description,
        currency=portfolio_in.currency or "INR"
    )
    db.add(portfolio)
    db.commit()
    db.refresh(portfolio)
    return PortfolioResponse.model_validate(portfolio)


@router.get("/{portfolio_id}", response_model=PortfolioResponse)
def get_portfolio(
    portfolio_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieve specific portfolio details."""
    portfolio = db.query(Portfolio).filter(
        Portfolio.id == portfolio_id, 
        Portfolio.user_id == current_user.id
    ).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    holdings, summary, _ = calculate_portfolio_holdings(db, portfolio.id)
    resp = PortfolioResponse.model_validate(portfolio)
    resp.total_value = round(summary.total_value, 2)
    resp.holdings_count = len(holdings)
    return resp


@router.delete("/{portfolio_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_portfolio(
    portfolio_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a portfolio and all associated transactions."""
    portfolio = db.query(Portfolio).filter(
        Portfolio.id == portfolio_id, 
        Portfolio.user_id == current_user.id
    ).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    
    db.delete(portfolio)
    db.commit()
    return None


@router.post("/{portfolio_id}/preview-csv", response_model=CsvImportPreview)
async def preview_csv_import(
    portfolio_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Preview and validate rows in an uploaded CSV statement before committing."""
    portfolio = db.query(Portfolio).filter(
        Portfolio.id == portfolio_id, 
        Portfolio.user_id == current_user.id
    ).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    content = await file.read()
    try:
        csv_text = content.decode("utf-8-sig")
    except UnicodeDecodeError:
        csv_text = content.decode("latin-1")

    try:
        preview = parse_csv_transactions(csv_text)
        return preview
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/{portfolio_id}/import-csv", response_model=CsvImportResult)
async def import_csv_transactions(
    portfolio_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Parse and commit all valid transactions from a CSV broker statement into the portfolio."""
    portfolio = db.query(Portfolio).filter(
        Portfolio.id == portfolio_id, 
        Portfolio.user_id == current_user.id
    ).first()
    if not portfolio:
        raise HTTPException(status_code=404, detail="Portfolio not found")

    content = await file.read()
    try:
        csv_text = content.decode("utf-8-sig")
    except UnicodeDecodeError:
        csv_text = content.decode("latin-1")

    try:
        preview = parse_csv_transactions(csv_text)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    imported_count = 0
    errors = []

    for row in preview.rows:
        if row.status == "valid":
            try:
                dt = datetime.strptime(row.date, "%Y-%m-%d").replace(tzinfo=timezone.utc)
                tx = Transaction(
                    portfolio_id=portfolio.id,
                    symbol=row.symbol,
                    name=row.name,
                    asset_type=row.asset_type,
                    transaction_type=row.type,
                    quantity=row.quantity,
                    price=row.price,
                    fees=row.fees,
                    timestamp=dt,
                    notes=f"Imported from CSV (row #{row.row_number})"
                )
                db.add(tx)
                imported_count += 1
            except Exception as ex:
                errors.append(f"Row {row.row_number}: {str(ex)}")
        else:
            errors.append(f"Row {row.row_number}: {row.error_message}")

    db.commit()

    return CsvImportResult(
        success=imported_count > 0,
        imported_count=imported_count,
        errors=errors,
        message=f"Successfully imported {imported_count} transaction(s)."
    )
