# Project Agent Guide

## Project Overview
Financial Portfolio Management Dashboard built with FastAPI, React, PostgreSQL/SQLite, Docker, and AWS Terraform IaC.

## Conventions
- Backend: FastAPI, SQLAlchemy 2.0, Pydantic v2, Pytest.
- Frontend: React 18 / 19, Vite, Tailwind CSS, Recharts, Lucide Icons.
- Authentication: JWT with RBAC (`admin`, `investor`).
- Database: Dual support - SQLite for zero-config local development and testing; PostgreSQL for Docker Compose and AWS RDS production.
- Infrastructure: Terraform IaC in `terraform/` targeting AWS ECS Fargate, RDS PostgreSQL, ALB, CloudWatch.

## Common Commands
### Backend
- Create virtual environment: `python -m venv venv`
- Activate (Windows): `.\venv\Scripts\Activate.ps1`
- Install dependencies: `pip install -r backend/requirements.txt`
- Run tests: `pytest backend/tests`
- Run dev server: `uvicorn backend.app.main:app --reload --port 8000`

### Frontend
- Install dependencies: `npm --prefix frontend install`
- Run dev server: `npm --prefix frontend run dev`
- Build frontend: `npm --prefix frontend run build`
- Run tests: `npm --prefix frontend test`

## Known Mistakes & Rules
- In Windows PowerShell, use `;` instead of `&&` to chain terminal commands.
- Use `python -m pip install` to target the active Python interpreter environment.
- Do not commit secrets or credentials.
- Work on a branch and never push directly to main.
- Never edit or skip tests to make them pass; fix the underlying code.
- Always verify changes with real test and build outputs.

