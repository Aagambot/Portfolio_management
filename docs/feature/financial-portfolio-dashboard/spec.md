# Feature Specification: Financial Portfolio Management Dashboard (Indian Market Model)

## Context & Market Focus
The platform is designed exclusively around the **Indian Financial Ecosystem**:
- **Base Currency**: Indian Rupee (`INR` / `₹`).
- **Benchmark Index**: **Nifty 50 (`^NSEI`)** (with S&P BSE SENSEX fallback) for portfolio Beta and relative performance.
- **Risk-Free Rate**: **6.8%** per annum (matching the prevailing Indian 10-Year Government Sovereign Bond yield).
- **Asset Classes**:
  1. **Indian Equities**: Listed on the National Stock Exchange (NSE) or Bombay Stock Exchange (BSE), fetched live via `yfinance` (e.g. `RELIANCE.NS`, `TCS.NS`, `INFY.NS`, `HDFCBANK.NS`).
  2. **Indian Mutual Funds**: Direct and Regular Growth plans (Equity, Debt, Hybrid, Index Funds) tracked via units (up to 4–6 decimal places) and NAVs.
  3. **ETFs**: Gold ETFs (`GOLDBEES.NS`), Index ETFs (`NIFTYBEES.NS`), etc.
  4. **Cash & Liquid**: Uninvested funds.

---

## Detailed Requirements

### 1. CSV Statement Import Engine
- **Endpoint**: `POST /api/v1/portfolios/{id}/import-csv`
- **Supported Fields in CSV**:
  - `Date`: Transaction date (`YYYY-MM-DD` or `DD-MM-YYYY`).
  - `Symbol`: Ticker or scheme identifier (e.g. `RELIANCE`, `TCS.NS`, `HDFCBANK`, `PARAG_PARIKH_FLEXI_CAP`, `NIFTYBEES.NS`).
  - `Name`: Human-readable name (e.g. "Reliance Industries", "Parag Parikh Flexi Cap Regular Growth").
  - `AssetType`: `STOCK`, `MUTUAL_FUND`, `ETF`, or `CASH`.
  - `Type`: `BUY` or `SELL`.
  - `Quantity`: Decimal quantity (supports whole shares for stocks e.g. `10.0`, and fractional units for mutual funds e.g. `184.295`).
  - `Price`: Purchase price per share or purchase NAV.
  - `Fees`: Stamp duty, STT, brokerage, or exchange charges (default 0.0).
- **Validation**:
  - Strict validation of row formats.
  - Rejection of invalid dates, negative quantities, or unsupported transaction types.
  - Prevention of overselling (cannot sell more units of a stock or mutual fund than owned).
- **Downloadable Sample**: Endpoint `GET /api/v1/portfolios/sample-csv` providing a ready-to-use template populated with sample Indian stocks and mutual funds.

### 2. Live Market Data & NAV Engine (`backend/app/services/market_data.py`)
- **Stock Quotes via Yahoo Finance**:
  - Queries `yfinance` for NSE tickers (`{SYMBOL}.NS`). If no exchange suffix is provided, automatically tests `.NS` then `.BO`.
  - Caches prices in memory with a configurable TTL (e.g., 15 minutes) to avoid redundant network hits and respect rate limits.
  - Historical daily prices (last 365 days) pulled for accurate volatility, drawdown, and Beta calculations.
- **Mutual Fund Pricing**:
  - Supports live NAV fetching via open Indian MF API (`api.mfapi.in`) or latest recorded CSV NAV with manual override option in the UI.
  - Resilient offline fallback with standard seeded historical prices if the host is offline.

### 3. Financial Calculation & Risk Engine (`backend/app/services/risk_engine.py`)
- **Holdings Aggregation**:
  - Weighted Average Cost Basis for multiple purchase tranches (SIPs / staggered buys).
  - Current Market Value = \(\text{Quantity} \times \text{Current Price or NAV}\).
  - Unrealized P&L = \(\text{Current Value} - \text{Total Cost Basis}\).
  - Realized P&L calculated upon `SELL` transactions.
- **Risk Metrics (Calibrated to India)**:
  - **Annualized Volatility (\(\sigma\))**: Standard deviation of daily percentage returns scaled by \(\sqrt{252}\).
  - **Sharpe Ratio (\(S\))**: \(S = \frac{R_p - 0.068}{\sigma_p}\) using the Indian 6.8% risk-free rate.
  - **Portfolio Beta (\(\beta\))**: Systematic risk computed against Nifty 50 (`^NSEI`).
  - **Maximum Drawdown (MDD)**: Peak-to-trough decline over the portfolio history.
  - **Value at Risk (VaR 95%, 1-day)**: Institutional parametric 1-day potential downside in INR (₹).
  - **Asset Allocation**: Breakdown across Direct Stocks, Mutual Funds, ETFs, and Cash.

### 4. Frontend Experience (React 19, Tailwind CSS, Recharts)
- **Currency & Formatting**: Indian Rupee (`₹`) symbol throughout all cards, tables, charts, and modals.
- **Dashboard Widgets**:
  - Net Worth, Total Invested, Realized P&L, and Unrealized P&L summary cards.
  - Risk Metrics Panel with Sharpe Ratio, Volatility gauge, Nifty Beta, and VaR 95% with plain-English financial interpretations.
  - Asset Allocation Donut Chart (Indian Equities vs Mutual Funds vs ETFs).
  - Portfolio Growth vs Nifty 50 historical line chart.
  - Holdings Table with asset type badges (`Stock`, `Mutual Fund`), quantity (supporting decimals), average cost, live market price, and unrealized gain/loss.
- **CSV Import Modal**:
  - Drag-and-drop file upload.
  - Download Sample CSV button.
  - Live table preview of parsed records with green/red validation indicators before importing.

---

## Acceptance Criteria

1. **CSV Statement Import**:
   - Uploading a CSV with mixed Indian stocks (`TCS.NS`, `INFY.NS`) and mutual funds with fractional units (e.g. `24.582` units) imports all transactions cleanly.
   - Downloading the sample CSV returns a valid CSV with correct headers and Indian asset examples.
2. **Live Ticker Pricing**:
   - Backend queries live quotes via `yfinance` for Indian stocks (e.g. `RELIANCE.NS`) and updates current portfolio values.
   - Fallback is triggered seamlessly if network is unavailable without crashing the application.
3. **Mutual Fund Support**:
   - Fractional units are preserved accurately to 4+ decimal places without rounding errors.
   - Mutual funds are distinctly tagged and grouped in the Asset Allocation breakdown.
4. **Indian Risk Metrics**:
   - Sharpe Ratio accurately uses the 6.8% Indian risk-free rate.
   - Beta is calculated against the Nifty 50 benchmark.
   - VaR and Volatility compute non-null mathematical figures.
5. **Code & Build Verification**:
   - `python -m pytest backend/tests -v` passes 100%.
   - `npm --prefix frontend run build` completes with zero errors.
