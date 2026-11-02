# 📈 FinFolio India: Financial Portfolio Management Platform

A production-grade full-stack portfolio management platform tailored completely to the **Indian Financial Ecosystem (INR ₹)**. Built with **FastAPI**, **React 18/19 (Vite + Tailwind CSS + Recharts)**, **PostgreSQL/SQLite**, **Docker**, and **AWS Terraform Infrastructure as Code (IaC)**.

---

## 🚀 Key Highlights & Capabilities

- **100% Indian Market Model (INR ₹)**: All holdings, cash flows, and performance values are tracked in Indian Rupees with Nifty 50 (`^NSEI`) as the market benchmark.
- **Live Real-World Tickers via Yahoo Finance**: Real-time quote synchronization for Indian equities and ETFs on the National Stock Exchange (NSE) and Bombay Stock Exchange (BSE) (e.g. `RELIANCE.NS`, `TCS.NS`, `HDFCBANK.NS`, `TATAMOTORS.NS`, `NIFTYBEES.NS`).
- **Comprehensive Indian Mutual Fund Tracking**: Full support for Mutual Fund schemes (Equity, Debt, Hybrid, Index funds) with **high-precision fractional unit accounting** (e.g., `142.385` units from monthly SIP investments) and weighted-average cost basis calculation.
- **CSV Statement Importer**: Import your actual tradebooks and transaction statements directly from Indian brokers (**Zerodha Kite/Coin**, **Groww**, **CAMS / KFintech CAS**) or using the built-in downloadable standard CSV template.
- **Calibrated Financial & Risk Engine**:
  - **Sharpe Ratio (\(S\))**: Risk-adjusted return calculated against the prevailing **6.8% Indian 10-Year Government Sovereign Bond yield (\(R_f\))**.
  - **Portfolio Beta (\(\beta\))**: Systematic market sensitivity measured directly against **Nifty 50 (`^NSEI`)**.
  - **Annualized Volatility (\(\sigma\))**: 252-day scaled dispersion of daily portfolio returns.
  - **1-Day Value at Risk (VaR 95%)**: Institutional parametric downside exposure in INR.
  - **Maximum Drawdown (MDD)**: Historical peak-to-trough decline analysis.
  - **Asset Allocation**: Dynamic multi-asset breakdown (Indian Equities, Mutual Funds, ETFs, Cash).
- **Authentication & RBAC**: Secure JWT authentication with Role-Based Access Control (`investor`, `admin`).
- **Dual Database Flexibility**: Zero-config **SQLite** out of the box for immediate local development and unit tests; **PostgreSQL** ready for Docker Compose and AWS RDS production.
- **Cloud Infrastructure as Code (AWS)**: Modular **Terraform** configuration in `terraform/` targeting AWS ECS Fargate, Application Load Balancer (ALB), RDS PostgreSQL (ap-south-1 Mumbai), and CloudWatch alarms.

---

## 🏗️ Architecture

```
                                  [ User Browser ]
                                         │
                    ┌────────────────────┴────────────────────┐
                    ▼                                         ▼
         [ React 19 Frontend ]                       [ CSV Import Modal ]
      (Vite + Tailwind + Recharts)               (Broker statements: Zerodha/Groww)
                    │                                         │
                    └────────────────────┬────────────────────┘
                                         ▼
                            HTTP REST / Bearer Token
                                         ▼
                       [ FastAPI Backend Application ]
                        ├── Auth & RBAC Security Layer
                        ├── Market Data Service (Yahoo Finance NSE/BSE)
                        ├── Indian Risk Engine (Nifty 50 Beta, 6.8% Rf Sharpe)
                        ├── CSV Statement Parser
                        └── SQLAlchemy 2.0 ORM
                                         │
                    ┌────────────────────┴────────────────────┐
                    ▼                                         ▼
         [ SQLite (Local Dev) ]                   [ PostgreSQL (Docker / RDS) ]
```

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Backend** | Python 3.12, FastAPI, SQLAlchemy 2.0, Pydantic v2, Pytest, Pandas, NumPy, yfinance |
| **Frontend** | React 18/19, Vite, Tailwind CSS, Recharts, Lucide Icons, Axios, Papaparse |
| **Authentication** | JSON Web Tokens (JWT) with HS256, Bcrypt password hashing |
| **Database** | SQLite (local zero-setup), PostgreSQL 16 (Docker & AWS RDS) |
| **DevOps / Containers** | Docker (multi-stage Dockerfiles), Docker Compose |
| **Cloud IaC** | Terraform (AWS ECS Fargate, ALB, RDS Multi-AZ, CloudWatch Alarms in `ap-south-1`) |

---

## 🚦 Quickstart Guide

### 1. Backend Setup & Run (Local SQLite)

```powershell
# Install backend requirements
python -m pip install -r backend/requirements.txt

# Run automated tests
python -m pytest backend/tests -v

# Start development server on port 8000
python -m uvicorn backend.app.main:app --reload --port 8000
```
- API Docs (Swagger UI): `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`

### 2. Frontend Setup & Run

```powershell
# Install frontend packages
npm --prefix frontend install

# Run Vite dev server on port 5173
npm --prefix frontend run dev

# Or build static assets for production
npm --prefix frontend run build
```
- Access Dashboard: `http://localhost:5173`

---

## 👤 Pre-Seeded Demo Accounts

The application automatically seeds ready-to-test accounts and sample portfolios on first launch:

| Role | Email | Password | Pre-Loaded Portfolio |
| :--- | :--- | :--- | :--- |
| **Investor** | `investor@example.com` | `investor123` | Indian Wealth & Growth (Reliance, TCS, HDFC Bank, Parag Parikh Flexi Cap, UTI Nifty 50, Nifty BeES) |
| **Admin** | `admin@example.com` | `admin123` | Platform Audit & Observability Access (`/api/v1/admin/stats`) |

---

## 📊 CSV Statement Import Format

To import your real holdings, you can upload your broker's CSV or use this format:

```csv
Date,Symbol,Name,AssetType,Type,Quantity,Price,Fees
2024-01-10,RELIANCE.NS,Reliance Industries Ltd,STOCK,BUY,15.0,2720.50,15.00
2024-01-18,PARAG_PARIKH_FLEXI_CAP,Parag Parikh Flexi Cap Fund - Direct,MUTUAL_FUND,BUY,142.385,68.20,0.00
2024-02-05,TCS.NS,Tata Consultancy Services Ltd,STOCK,BUY,10.0,3850.00,12.50
2024-02-20,HDFCBANK.NS,HDFC Bank Ltd,STOCK,BUY,25.0,1520.00,10.00
2024-03-01,UTI_NIFTY_50_INDEX,UTI Nifty 50 Index Fund Direct Growth,MUTUAL_FUND,BUY,85.420,165.40,0.00
2024-03-15,TATAMOTORS.NS,Tata Motors Ltd,STOCK,BUY,30.0,880.00,8.00
2024-04-02,NIFTYBEES.NS,Nippon India ETF Nifty 50 BeES,ETF,BUY,50.0,245.00,5.00
```
*Note: A ready-to-use template can also be downloaded directly by clicking "Download Sample CSV" inside the application.*

---

## 🐳 Docker Compose (Multi-Container Local Run)

To run the complete stack with PostgreSQL and containerized services:

```powershell
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- PostgreSQL: `localhost:5432`

---

## ☁️ AWS Terraform Deployment (IaC)

Production infrastructure declared in `terraform/`:
- **VPC & Subnets**: Public & private subnets across 2 Availability Zones in Mumbai (`ap-south-1`).
- **Application Load Balancer**: Health-checked routing to ECS tasks.
- **ECS Fargate**: Containerized FastAPI service with auto-healing and task definitions.
- **RDS PostgreSQL**: Managed relational database with automated backups.
- **CloudWatch**: Log groups and automated alerts for CPU, memory, and 5xx error anomalies.

To initialize (requires AWS CLI credentials):
```powershell
cd terraform
terraform init
terraform plan
```
