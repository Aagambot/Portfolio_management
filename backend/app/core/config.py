from typing import List, Union
from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl, validator


class Settings(BaseSettings):
    PROJECT_NAME: str = "Indian Financial Portfolio Dashboard"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security & JWT
    SECRET_KEY: str = "dev-secret-key-change-in-production-portfolio-dashboard-2026"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day
    
    # Database (SQLite zero-config local default, PostgreSQL ready)
    DATABASE_URL: str = "sqlite:///./portfolio.db"
    
    # Indian Financial Model Defaults
    CURRENCY: str = "INR"
    CURRENCY_SYMBOL: str = "₹"
    RISK_FREE_RATE: float = 0.068  # 6.8% Indian 10-Year Sovereign Yield
    BENCHMARK_TICKER: str = "^NSEI"  # Nifty 50 Index
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "*"
    ]

    model_config = {
        "case_sensitive": True,
        "env_file": ".env",
        "extra": "allow"
    }


settings = Settings()
