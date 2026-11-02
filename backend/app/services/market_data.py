import logging
import time
from datetime import datetime, timedelta, timezone
from typing import Dict, Any, Optional, List, Tuple
import pandas as pd
import numpy as np

try:
    import yfinance as yf
except ImportError:
    yf = None

logger = logging.getLogger(__name__)

# In-memory cache for live quotes: {symbol: (price, timestamp, asset_meta)}
_PRICE_CACHE: Dict[str, Tuple[float, float, Dict[str, Any]]] = {}
CACHE_TTL_SECONDS = 900  # 15 minutes cache

# High-fidelity realistic offline prices and metadata for Indian Market
DEFAULT_INDIAN_ASSETS = {
    # NSE Equities
    "RELIANCE.NS": {"name": "Reliance Industries Ltd", "type": "STOCK", "price": 2980.50, "sector": "Energy & Conglomerate"},
    "TCS.NS": {"name": "Tata Consultancy Services Ltd", "type": "STOCK", "price": 4185.00, "sector": "Information Technology"},
    "HDFCBANK.NS": {"name": "HDFC Bank Ltd", "type": "STOCK", "price": 1690.25, "sector": "Banking & Financials"},
    "INFY.NS": {"name": "Infosys Ltd", "type": "STOCK", "price": 1845.50, "sector": "Information Technology"},
    "TATAMOTORS.NS": {"name": "Tata Motors Ltd", "type": "STOCK", "price": 995.00, "sector": "Automobile"},
    "ICICIBANK.NS": {"name": "ICICI Bank Ltd", "type": "STOCK", "price": 1255.00, "sector": "Banking & Financials"},
    "ITC.NS": {"name": "ITC Ltd", "type": "STOCK", "price": 492.30, "sector": "FMCG"},
    "LT.NS": {"name": "Larsen & Toubro Ltd", "type": "STOCK", "price": 3620.00, "sector": "Infrastructure"},
    "BHARTIARTL.NS": {"name": "Bharti Airtel Ltd", "type": "STOCK", "price": 1540.00, "sector": "Telecommunications"},
    # Indian ETFs
    "NIFTYBEES.NS": {"name": "Nippon India ETF Nifty 50 BeES", "type": "ETF", "price": 268.40, "sector": "Broad Market ETF"},
    "GOLDBEES.NS": {"name": "Nippon India ETF Gold BeES", "type": "ETF", "price": 64.20, "sector": "Precious Metals"},
    # Indian Mutual Funds (Direct & Growth NAVs)
    "PARAG_PARIKH_FLEXI_CAP": {"name": "Parag Parikh Flexi Cap Fund - Direct Growth", "type": "MUTUAL_FUND", "price": 82.45, "sector": "Equity Flexi Cap"},
    "HDFC_TOP_100": {"name": "HDFC Top 100 Fund - Direct Growth", "type": "MUTUAL_FUND", "price": 118.20, "sector": "Equity Large Cap"},
    "UTI_NIFTY_50_INDEX": {"name": "UTI Nifty 50 Index Fund - Direct Growth", "type": "MUTUAL_FUND", "price": 182.50, "sector": "Index Fund"},
    "MIRAE_ASSET_LARGE_CAP": {"name": "Mirae Asset Large Cap Fund - Direct Growth", "type": "MUTUAL_FUND", "price": 112.80, "sector": "Equity Large Cap"},
    "SBI_SMALL_CAP": {"name": "SBI Small Cap Fund - Direct Growth", "type": "MUTUAL_FUND", "price": 164.30, "sector": "Equity Small Cap"},
    # Benchmark
    "^NSEI": {"name": "Nifty 50", "type": "BENCHMARK", "price": 24200.00, "sector": "Index"}
}


def normalize_symbol(symbol: str, asset_type: str = "STOCK") -> str:
    """Normalize raw Indian stock symbols to Yahoo Finance NSE format."""
    clean = symbol.strip().upper()
    if asset_type.upper() in ["STOCK", "ETF"]:
        if not (clean.endswith(".NS") or clean.endswith(".BO") or clean.startswith("^")):
            clean = f"{clean}.NS"
    elif asset_type.upper() == "MUTUAL_FUND":
        clean = clean.replace(" ", "_").replace("-", "_")
    return clean


def get_current_price(symbol: str, asset_type: str = "STOCK", fallback_price: Optional[float] = None) -> Tuple[float, str, str]:
    """
    Fetch current market price / NAV for an asset.
    Returns: (price, asset_name, sector)
    """
    norm_symbol = normalize_symbol(symbol, asset_type)
    now = time.time()

    # Check cache
    if norm_symbol in _PRICE_CACHE:
        cached_price, cached_time, meta = _PRICE_CACHE[norm_symbol]
        if now - cached_time < CACHE_TTL_SECONDS and cached_price > 0:
            return cached_price, meta.get("name", symbol), meta.get("sector", "Financial Assets")

    # If yfinance is available and ticker is a stock or ETF, try live quote
    if yf is not None and (norm_symbol.endswith(".NS") or norm_symbol.endswith(".BO") or norm_symbol.startswith("^")):
        try:
            ticker = yf.Ticker(norm_symbol)
            fast_info = getattr(ticker, "fast_info", None)
            live_price = None
            if fast_info:
                live_price = getattr(fast_info, "last_price", None) or getattr(fast_info, "regular_market_price", None)
            
            if not live_price:
                hist = ticker.history(period="5d")
                if not hist.empty and "Close" in hist.columns:
                    live_price = float(hist["Close"].iloc[-1])

            if live_price and live_price > 0:
                name = norm_symbol.replace(".NS", "").replace(".BO", "")
                sector = "Indian Equities"
                try:
                    info = ticker.info or {}
                    name = info.get("shortName") or info.get("longName") or name
                    sector = info.get("sector") or sector
                except Exception:
                    pass
                _PRICE_CACHE[norm_symbol] = (live_price, now, {"name": name, "sector": sector})
                return live_price, name, sector
        except Exception as e:
            logger.warning(f"Live fetch for {norm_symbol} failed: {e}. Falling back to default.")

    # Check pre-seeded default catalog
    if norm_symbol in DEFAULT_INDIAN_ASSETS:
        item = DEFAULT_INDIAN_ASSETS[norm_symbol]
        _PRICE_CACHE[norm_symbol] = (item["price"], now, {"name": item["name"], "sector": item["sector"]})
        return item["price"], item["name"], item["sector"]

    # Match normalized without extension
    clean_sym = norm_symbol.replace(".NS", "").replace(".BO", "")
    for k, v in DEFAULT_INDIAN_ASSETS.items():
        if clean_sym in k:
            _PRICE_CACHE[norm_symbol] = (v["price"], now, {"name": v["name"], "sector": v["sector"]})
            return v["price"], v["name"], v["sector"]

    # If user provided a fallback purchase price / NAV in CSV
    if fallback_price and fallback_price > 0:
        name = symbol.replace("_", " ").title()
        sector = "Mutual Funds" if asset_type == "MUTUAL_FUND" else "General"
        _PRICE_CACHE[norm_symbol] = (fallback_price, now, {"name": name, "sector": sector})
        return fallback_price, name, sector

    # Default generic price
    default_price = 100.0
    return default_price, symbol, "General"


def get_historical_price_series(symbols: List[str], days: int = 365) -> pd.DataFrame:
    """
    Fetch or synthesize historical daily close price series for symbols + Nifty 50 benchmark.
    Returns DataFrame indexed by date with symbols as columns.
    """
    end_date = datetime.now(timezone.utc)
    start_date = end_date - timedelta(days=days)
    dates = pd.date_range(start=start_date, end=end_date, freq="B")  # Business days

    df = pd.DataFrame(index=dates)

    # Benchmark: Nifty 50 (^NSEI)
    nifty_pulled = False
    if yf is not None:
        try:
            nifty = yf.Ticker("^NSEI")
            nifty_hist = nifty.history(start=start_date.strftime("%Y-%m-%d"), end=end_date.strftime("%Y-%m-%d"))
            if not nifty_hist.empty and "Close" in nifty_hist.columns:
                nifty_hist.index = nifty_hist.index.tz_localize(None)
                df["^NSEI"] = nifty_hist["Close"].reindex(dates).ffill().bfill()
                nifty_pulled = True
        except Exception:
            pass

    if not nifty_pulled or "^NSEI" not in df.columns or df["^NSEI"].isna().all():
        # Realistic Nifty 50 geometric brownian motion
        np.random.seed(42)
        base = 21000.0
        daily_returns = np.random.normal(0.0005, 0.008, len(dates))
        nifty_series = base * np.exp(np.cumsum(daily_returns))
        df["^NSEI"] = nifty_series

    for sym in symbols:
        norm = normalize_symbol(sym)
        pulled = False
        if yf is not None and (norm.endswith(".NS") or norm.endswith(".BO")):
            try:
                hist = yf.Ticker(norm).history(start=start_date.strftime("%Y-%m-%d"), end=end_date.strftime("%Y-%m-%d"))
                if not hist.empty and "Close" in hist.columns:
                    hist.index = hist.index.tz_localize(None)
                    df[sym] = hist["Close"].reindex(dates).ffill().bfill()
                    pulled = True
            except Exception:
                pass

        if not pulled or sym not in df.columns or df[sym].isna().all():
            cur_price, _, _ = get_current_price(sym)
            np.random.seed(abs(hash(sym)) % 10000)
            daily_returns = np.random.normal(0.0006, 0.012, len(dates))
            prices = cur_price * np.exp(np.cumsum(daily_returns[::-1]))[::-1]
            # Scale so final price aligns with current price
            prices = prices * (cur_price / prices[-1])
            df[sym] = prices

    return df.ffill().bfill()

