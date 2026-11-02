from contextlib import asynccontextmanager
from datetime import datetime, timezone, timedelta
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from backend.app.core.config import settings
from backend.app.database import engine, init_db, SessionLocal
from backend.app.models.user import User
from backend.app.models.portfolio import Portfolio
from backend.app.models.transaction import Transaction
from backend.app.core.security import get_password_hash

from backend.app.api.v1.auth import router as auth_router
from backend.app.api.v1.portfolios import router as portfolios_router
from backend.app.api.v1.transactions import router as transactions_router
from backend.app.api.v1.holdings import router as holdings_router
from backend.app.api.v1.admin import router as admin_router


def seed_demo_data(db: Session):
    """Seed initial demo accounts and Indian sample portfolio if DB is empty."""
    # Check if demo investor exists
    investor = db.query(User).filter(User.email == "investor@example.com").first()
    if not investor:
        investor = User(
            email="investor@example.com",
            hashed_password=get_password_hash("investor123"),
            full_name="Rajesh Sharma",
            role="investor",
            is_active=True
        )
        db.add(investor)
        db.commit()
        db.refresh(investor)

    # Check if demo admin exists
    admin = db.query(User).filter(User.email == "admin@example.com").first()
    if not admin:
        admin = User(
            email="admin@example.com",
            hashed_password=get_password_hash("admin123"),
            full_name="System Administrator",
            role="admin",
            is_active=True
        )
        db.add(admin)
        db.commit()

    # Check if demo portfolio exists
    portfolio = db.query(Portfolio).filter(Portfolio.user_id == investor.id).first()
    if not portfolio:
        portfolio = Portfolio(
            user_id=investor.id,
            name="Indian Wealth & Growth Portfolio",
            description="Core holdings in Indian Bluechips, Mutual Funds (SIPs) & Nifty ETFs",
            currency="INR"
        )
        db.add(portfolio)
        db.commit()
        db.refresh(portfolio)

        # Seed initial transactions across Indian Stocks, Mutual Funds & ETFs
        now = datetime.now(timezone.utc)
        demo_txs = [
            Transaction(
                portfolio_id=portfolio.id,
                symbol="RELIANCE.NS",
                name="Reliance Industries Ltd",
                asset_type="STOCK",
                transaction_type="BUY",
                quantity=15.0,
                price=2750.0,
                fees=15.0,
                timestamp=now - timedelta(days=90),
                notes="Core energy & digital conglomerate"
            ),
            Transaction(
                portfolio_id=portfolio.id,
                symbol="TCS.NS",
                name="Tata Consultancy Services Ltd",
                asset_type="STOCK",
                transaction_type="BUY",
                quantity=10.0,
                price=3850.0,
                fees=12.0,
                timestamp=now - timedelta(days=75),
                notes="IT services export leader"
            ),
            Transaction(
                portfolio_id=portfolio.id,
                symbol="HDFCBANK.NS",
                name="HDFC Bank Ltd",
                asset_type="STOCK",
                transaction_type="BUY",
                quantity=25.0,
                price=1540.0,
                fees=10.0,
                timestamp=now - timedelta(days=60),
                notes="Private banking leader"
            ),
            Transaction(
                portfolio_id=portfolio.id,
                symbol="TATAMOTORS.NS",
                name="Tata Motors Ltd",
                asset_type="STOCK",
                transaction_type="BUY",
                quantity=30.0,
                price=890.0,
                fees=8.0,
                timestamp=now - timedelta(days=45),
                notes="Auto & EV growth"
            ),
            Transaction(
                portfolio_id=portfolio.id,
                symbol="PARAG_PARIKH_FLEXI_CAP",
                name="Parag Parikh Flexi Cap Fund Direct Growth",
                asset_type="MUTUAL_FUND",
                transaction_type="BUY",
                quantity=200.540,
                price=68.50,
                fees=0.0,
                timestamp=now - timedelta(days=120),
                notes="Monthly SIP tranche 1"
            ),
            Transaction(
                portfolio_id=portfolio.id,
                symbol="PARAG_PARIKH_FLEXI_CAP",
                name="Parag Parikh Flexi Cap Fund Direct Growth",
                asset_type="MUTUAL_FUND",
                transaction_type="BUY",
                quantity=100.250,
                price=73.20,
                fees=0.0,
                timestamp=now - timedelta(days=30),
                notes="Monthly SIP tranche 2"
            ),
            Transaction(
                portfolio_id=portfolio.id,
                symbol="UTI_NIFTY_50_INDEX",
                name="UTI Nifty 50 Index Fund Direct Growth",
                asset_type="MUTUAL_FUND",
                transaction_type="BUY",
                quantity=120.450,
                price=162.00,
                fees=0.0,
                timestamp=now - timedelta(days=80),
                notes="Passive broad market index SIP"
            ),
            Transaction(
                portfolio_id=portfolio.id,
                symbol="NIFTYBEES.NS",
                name="Nippon India ETF Nifty 50 BeES",
                asset_type="ETF",
                transaction_type="BUY",
                quantity=60.0,
                price=248.00,
                fees=5.0,
                timestamp=now - timedelta(days=40),
                notes="Exchange traded fund liquidity"
            ),
            Transaction(
                portfolio_id=portfolio.id,
                symbol="TATAMOTORS.NS",
                name="Tata Motors Ltd",
                asset_type="STOCK",
                transaction_type="SELL",
                quantity=10.0,
                price=970.0,
                fees=6.0,
                timestamp=now - timedelta(days=10),
                notes="Profit booking"
            )
        ]
        db.add_all(demo_txs)
        db.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: initialize database tables and seed demo accounts
    init_db()
    db = SessionLocal()
    try:
        seed_demo_data(db)
    finally:
        db.close()
    yield
    # Shutdown logic if any


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Full-stack Indian Financial Portfolio Management Platform with Stocks, Mutual Funds, and Nifty Risk Metrics",
    lifespan=lifespan
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routers
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(portfolios_router, prefix=settings.API_V1_STR)
app.include_router(transactions_router, prefix=settings.API_V1_STR)
app.include_router(holdings_router, prefix=settings.API_V1_STR)
app.include_router(admin_router, prefix=settings.API_V1_STR)


@app.get("/health")
def health_check():
    """Health check endpoint for container probes and load balancers."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "currency": settings.CURRENCY,
        "currency_symbol": settings.CURRENCY_SYMBOL,
        "benchmark": settings.BENCHMARK_TICKER,
        "risk_free_rate": settings.RISK_FREE_RATE,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
