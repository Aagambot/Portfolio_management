# Feature Intent: Financial Portfolio Management Dashboard (Indian Market Model)

## Problem
Indian retail and high-net-worth investors frequently manage diversified portfolios spanning NSE/BSE direct equities and Indian mutual funds across various brokers (Zerodha, Groww, CAMS, KFintech). Currently, investors lack a unified, privacy-first local platform that can import their real transaction statements via CSV, fetch live market prices and NAVs, and calculate institutional-grade financial risk metrics (Sharpe ratio against Indian risk-free rate, Nifty 50 Beta, Portfolio Volatility, Max Drawdown) without deploying to the cloud or paying for expensive third-party subscriptions.

## Proposed Outcome
A full-stack Financial Portfolio Management platform tailored completely to the **Indian Market Model (INR ₹)**:
1. **Live Market Pricing & NAV Resolver**:
   - **NSE / BSE Equities**: Real-time / live quote fetching via **Yahoo Finance (`yfinance`)** using standard Indian tickers (e.g., `RELIANCE.NS`, `TCS.NS`, `HDFCBANK.NS`, `INFY.NS`). Automatically normalizes raw stock symbols (e.g. `TATAMOTORS` -> `TATAMOTORS.NS`).
   - **Indian Mutual Funds**: Support for Mutual Fund units and NAVs via broker CSV import and live AMFI / MF lookup (`api.mfapi.in` / scheme NAV resolver).
   - High-precision decimal tracking for mutual fund fractional units (e.g., `124.582` units from SIPs).
2. **Flexible CSV Statement Import**:
   - Upload transaction history CSVs directly from Indian brokers or via a downloadable standard CSV template.
   - Supports fractional quantities, buy/sell types, trade date, execution price / NAV, and brokerage/STT fees.
   - Interactive preview and validation modal before committing records to the database.
3. **Indian Risk & Performance Engine**:
   - Currency configured to **INR (₹)**.
   - Benchmark comparison against **Nifty 50 (`^NSEI`)** for systematic risk (Beta).
   - Risk-free rate calibrated to the **Indian 10-Year Government Bond yield (\(R_f = 6.8\%\))** for Sharpe Ratio calculation.
   - Annualized Volatility, Realized vs. Unrealized P&L in ₹, 1-Day Value at Risk (VaR 95%), and Maximum Drawdown.
4. **Backend (FastAPI, SQLAlchemy 2.0, PostgreSQL / SQLite)**:
   - Data models for Users, Portfolios, Transactions, and Assets with high-precision decimals.
   - JWT authentication with Role-Based Access Control (`investor`, `admin`).
   - SQLite by default for zero-setup local execution and automated Pytest verification; PostgreSQL ready for Docker.
5. **Frontend (React 19, Vite, Tailwind CSS, Recharts, Lucide Icons)**:
   - Rupee (₹) financial formatting.
   - Holdings table categorized by Asset Type (`STOCK`, `MUTUAL_FUND`, `ETF`).
   - Performance growth chart, Asset Allocation donut chart (Stocks vs Mutual Funds vs Cash), and Risk Assessment panel.
   - One-click CSV Import modal + Add Transaction modal.
6. **Infrastructure as Code (AWS Terraform & Docker)**:
   - Multi-stage Dockerfiles and `docker-compose.yml`.
   - Production-ready Terraform templates (`terraform/`) for AWS ECS Fargate, RDS PostgreSQL, ALB, and CloudWatch.

## Affected Users & Systems
- **Indian Retail Investors**: Upload Zerodha/Groww/CAMS CSVs or enter Indian stock/mutual fund transactions, viewing real-time portfolio performance in ₹.
- **FastAPI Backend**: Orchestrates transactions, queries `yfinance` for NSE/BSE tickers and MF NAVs, and calculates portfolio metrics.
- **Frontend App**: Interactive dashboard with charts, transaction modals, and CSV importer.

## Constraints
- **Zero Cloud Deployment**: All cloud infrastructure is declared in Terraform and Docker without executing live AWS deployments or incurring cloud costs.
- **Zero Paid API Requirement**: Uses free `yfinance` and public AMFI NAV services with internal caching to prevent rate-limiting.
- **Dual Database**: Runs locally on SQLite with zero external dependencies; PostgreSQL enabled for Docker.
- **Branch Protection**: Work on `feature/portfolio-dashboard`.

## Open Questions & Confirmed Choices
- *Confirmed*: Full Indian financial model (INR ₹, Nifty 50 benchmark, 6.8% Indian risk-free rate).
- *Confirmed*: CSV import supporting both Stocks and Mutual Funds (with fractional units).
- *Confirmed*: Live market prices via `yfinance` for NSE/BSE tickers.
