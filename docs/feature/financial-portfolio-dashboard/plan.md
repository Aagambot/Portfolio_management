# Implementation Plan: Financial Portfolio Management Dashboard (Indian Market Model)

## Files to Create / Change

### Backend Core & API (`backend/`)
- `backend/requirements.txt`: Python dependencies (`fastapi`, `uvicorn`, `sqlalchemy`, `pydantic`, `pydantic-settings`, `python-jose`, `passlib`, `bcrypt==4.0.1`, `python-multipart`, `pytest`, `httpx`, `numpy`, `pandas`, `yfinance`).
- `backend/app/core/config.py`: Settings (Default currency: `INR`, Risk-free rate: `0.068`, Benchmark ticker: `^NSEI`, Database URL).
- `backend/app/core/security.py`: Password hashing and JWT token handling.
- `backend/app/database.py`: SQLAlchemy session and SQLite/PostgreSQL engine.
- `backend/app/models/`:
  - `user.py`: User model.
  - `portfolio.py`: Portfolio model (currency default `INR`).
  - `transaction.py`: Transaction model (quantity as `Numeric(18, 6)` for fractional MF units, asset type).
  - `asset.py`: Asset metadata with symbol, name, asset type (`STOCK`, `MUTUAL_FUND`, `ETF`, `CASH`), sector, current price/NAV.
- `backend/app/schemas/`:
  - `user.py`, `portfolio.py`, `transaction.py`, `holdings.py`, `csv_import.py`.
- `backend/app/services/market_data.py`:
  - Fetches live quotes for Indian tickers from `yfinance` (`.NS` / `.BO`).
  - Fetches or resolves Indian Mutual Fund NAVs (via AMFI API / CSV recorded NAV).
  - Caches prices in-memory to prevent rate-limiting.
  - Fallback offline data generator for development/testing reliability.
- `backend/app/services/portfolio_service.py`:
  - CSV parser (validates columns, parses dates, verifies fractional quantities and prices).
  - Holdings aggregator calculating weighted average cost basis and realized/unrealized P&L.
- `backend/app/services/risk_engine.py`:
  - Volatility, Sharpe ratio (\(R_f = 6.8\%\)), Beta vs Nifty 50, VaR 95%, Max Drawdown.
- `backend/app/api/v1/`:
  - `auth.py`: Register, login, get current user.
  - `portfolios.py`: Portfolio CRUD + CSV import (`POST /portfolios/{id}/import-csv`) + Sample CSV (`GET /portfolios/sample-csv`).
  - `transactions.py`: Manual buy/sell transaction entry.
  - `holdings.py`: Active holdings, historical performance, and risk metrics.
  - `admin.py`: Platform monitoring and admin statistics.
  - `main.py`: App initialization, CORS, health check, seed demo Indian portfolio on startup.

### Frontend Application (`frontend/`)
- `frontend/package.json`: Vite, React 19, Tailwind CSS, Lucide-React, Recharts, Axios, Papaparse.
- `frontend/src/services/api.js`: Axios instance with JWT interceptor.
- `frontend/src/context/AuthContext.jsx`: Authentication and active portfolio state.
- `frontend/src/components/Navbar.jsx`: Navbar with Rupee symbol and Indian market status.
- `frontend/src/components/MetricCard.jsx`: Financial cards in ₹ with trend indicators.
- `frontend/src/components/HoldingsTable.jsx`: Filterable holdings table separating Stocks and Mutual Funds with fractional unit display.
- `frontend/src/components/PerformanceChart.jsx`: Recharts area chart showing portfolio trajectory vs Nifty 50.
- `frontend/src/components/AllocationChart.jsx`: Donut chart of asset classes (Equities, Mutual Funds, ETFs, Cash).
- `frontend/src/components/RiskAnalysis.jsx`: Risk metrics breakdown with financial rationale for Indian investors.
- `frontend/src/components/CsvImportModal.jsx`: Drag-and-drop CSV upload, validation table preview, and sample CSV download.
- `frontend/src/components/TransactionModal.jsx`: Quick manual transaction entry for Indian stocks and mutual funds.
- `frontend/src/pages/Dashboard.jsx`: Main integrated dashboard.
- `frontend/src/pages/Login.jsx`: Login & registration views.

### Infrastructure & Orchestration (`terraform/` & Docker)
- `backend/Dockerfile` & `frontend/Dockerfile`
- `docker-compose.yml`
- `terraform/` (AWS ECS Fargate, RDS PostgreSQL, ALB, CloudWatch alarms).
- `README.md`: Architecture guide, setup commands, and Indian portfolio usage documentation.

### Automated Tests (`backend/tests/`)
- `test_auth.py`: Tests auth and JWT.
- `test_portfolios.py`: Tests portfolio CRUD and isolation.
- `test_transactions.py`: Tests transaction validation and fractional shares.
- `test_csv_import.py`: Tests CSV parsing, sample download, and validation of Indian stock & mutual fund statements.
- `test_risk_engine.py`: Tests Sharpe (6.8%), Beta (Nifty 50), Volatility, and VaR.

---

## Order of Work
1. **Backend Foundation & Database**: Models with high-precision decimal quantity, SQLAlchemy setup, schemas.
2. **Indian Market Data & Risk Services**: Live `yfinance` quote resolver (`.NS`/`.BO`), MF NAV handler, and Indian risk metrics engine.
3. **CSV Statement Importer**: CSV parser, sample generator, transaction validation.
4. **Backend API Endpoints**: Wire up routes (`/auth`, `/portfolios`, `/transactions`, `/holdings`, `/import-csv`).
5. **Backend Unit & Integration Tests**: Pytest verification for CSV import, fractional holdings, and risk engine.
6. **Frontend Dashboard & Components**: Scaffold React 19 + Tailwind, build Rupee-formatted widgets, CSV import modal, and Recharts visualizations.
7. **Frontend Build Verification**: Test production build with `npm run build`.
8. **DevOps & Terraform Configurations**: Multi-stage Dockerfiles and complete AWS Terraform configs.
9. **Final Verification & Walkthrough**: End-to-end testing, output gathering, and walkthrough documentation.
