import csv
import io
from datetime import datetime
from typing import List, Dict, Any, Tuple
from backend.app.schemas.csv_import import CsvRowParsed, CsvImportPreview


SAMPLE_INDIAN_CSV_CONTENT = """Date,Symbol,Name,AssetType,Type,Quantity,Price,Fees
2024-01-10,RELIANCE.NS,Reliance Industries Ltd,STOCK,BUY,15.0,2720.50,15.00
2024-01-18,PARAG_PARIKH_FLEXI_CAP,Parag Parikh Flexi Cap Fund - Direct,MUTUAL_FUND,BUY,142.385,68.20,0.00
2024-02-05,TCS.NS,Tata Consultancy Services Ltd,STOCK,BUY,10.0,3850.00,12.50
2024-02-20,HDFCBANK.NS,HDFC Bank Ltd,STOCK,BUY,25.0,1520.00,10.00
2024-03-01,UTI_NIFTY_50_INDEX,UTI Nifty 50 Index Fund Direct Growth,MUTUAL_FUND,BUY,85.420,165.40,0.00
2024-03-15,TATAMOTORS.NS,Tata Motors Ltd,STOCK,BUY,30.0,880.00,8.00
2024-04-02,NIFTYBEES.NS,Nippon India ETF Nifty 50 BeES,ETF,BUY,50.0,245.00,5.00
2024-04-18,PARAG_PARIKH_FLEXI_CAP,Parag Parikh Flexi Cap Fund - Direct,MUTUAL_FUND,BUY,58.615,72.40,0.00
2024-05-10,HDFC_TOP_100,HDFC Top 100 Fund Direct Growth,MUTUAL_FUND,BUY,62.150,104.50,0.00
2024-06-05,TATAMOTORS.NS,Tata Motors Ltd,STOCK,SELL,10.0,960.00,5.00
"""


def parse_date(date_str: str) -> datetime:
    """Parse date in various common formats used in broker statements."""
    formats = [
        "%Y-%m-%d",
        "%d-%m-%Y",
        "%d/%m/%Y",
        "%Y/%m/%d",
        "%d-%b-%Y",
        "%d %b %Y",
        "%Y-%m-%dT%H:%M:%S",
    ]
    cleaned = date_str.strip()
    for fmt in formats:
        try:
            return datetime.strptime(cleaned, fmt)
        except ValueError:
            continue
    raise ValueError(f"Unrecognized date format: '{date_str}'. Expected YYYY-MM-DD or DD-MM-YYYY.")


def parse_csv_transactions(csv_content: str) -> CsvImportPreview:
    """
    Parse and validate a CSV transaction statement.
    Returns preview summary with list of valid and error rows.
    """
    f = io.StringIO(csv_content.strip())
    reader = csv.DictReader(f)

    if not reader.fieldnames:
        raise ValueError("CSV is empty or missing headers.")

    # Normalize header mapping
    header_map = {}
    for col in reader.fieldnames:
        norm = col.strip().lower().replace(" ", "_").replace("-", "_")
        header_map[norm] = col

    # Required column identifiers
    date_col = header_map.get("date") or header_map.get("trade_date") or header_map.get("order_date")
    symbol_col = header_map.get("symbol") or header_map.get("ticker") or header_map.get("scheme_name") or header_map.get("isin")
    type_col = header_map.get("type") or header_map.get("transaction_type") or header_map.get("order_type") or header_map.get("trade_type")
    qty_col = header_map.get("quantity") or header_map.get("units") or header_map.get("qty") or header_map.get("shares")
    price_col = header_map.get("price") or header_map.get("nav") or header_map.get("execution_price") or header_map.get("avg_price")

    if not all([date_col, symbol_col, type_col, qty_col, price_col]):
        missing = []
        if not date_col: missing.append("Date")
        if not symbol_col: missing.append("Symbol/Scheme")
        if not type_col: missing.append("Type (BUY/SELL)")
        if not qty_col: missing.append("Quantity/Units")
        if not price_col: missing.append("Price/NAV")
        raise ValueError(f"Missing required columns in CSV: {', '.join(missing)}. Please use the sample template.")

    name_col = header_map.get("name") or header_map.get("asset_name")
    asset_type_col = header_map.get("assettype") or header_map.get("asset_type") or header_map.get("category")
    fees_col = header_map.get("fees") or header_map.get("charges") or header_map.get("brokerage") or header_map.get("stt")

    parsed_rows: List[CsvRowParsed] = []
    valid_count = 0
    error_count = 0

    for idx, row in enumerate(reader, start=1):
        try:
            raw_date = row.get(date_col, "").strip()
            raw_symbol = row.get(symbol_col, "").strip()
            raw_type = row.get(type_col, "").strip().upper()
            raw_qty = row.get(qty_col, "").strip()
            raw_price = row.get(price_col, "").strip()

            if not raw_symbol:
                raise ValueError("Symbol is empty.")

            # Validate date
            dt = parse_date(raw_date)

            # Validate Type
            if raw_type not in ["BUY", "SELL", "DIVIDEND"]:
                raise ValueError(f"Invalid transaction type '{raw_type}'. Expected BUY, SELL, or DIVIDEND.")

            # Validate Quantity
            try:
                qty = float(raw_qty.replace(",", ""))
                if qty <= 0:
                    raise ValueError("Quantity must be greater than 0.")
            except ValueError:
                raise ValueError(f"Invalid quantity: '{raw_qty}'.")

            # Validate Price
            try:
                price = float(raw_price.replace(",", "").replace("₹", "").replace("$", ""))
                if price <= 0:
                    raise ValueError("Price/NAV must be greater than 0.")
            except ValueError:
                raise ValueError(f"Invalid price/NAV: '{raw_price}'.")

            # Validate Fees
            fees = 0.0
            if fees_col and row.get(fees_col):
                try:
                    fees = float(row.get(fees_col).replace(",", "").replace("₹", "").strip() or 0.0)
                except ValueError:
                    fees = 0.0

            # Infer asset type
            asset_type = "STOCK"
            if asset_type_col and row.get(asset_type_col):
                raw_at = row.get(asset_type_col).strip().upper()
                if "MUTUAL" in raw_at or "MF" in raw_at or "FUND" in raw_at:
                    asset_type = "MUTUAL_FUND"
                elif "ETF" in raw_at:
                    asset_type = "ETF"
                elif "BOND" in raw_at or "DEBT" in raw_at:
                    asset_type = "BOND"
            else:
                if "FUND" in raw_symbol.upper() or "CAP" in raw_symbol.upper() or "INDEX" in raw_symbol.upper():
                    asset_type = "MUTUAL_FUND"
                elif "BEES" in raw_symbol.upper() or "ETF" in raw_symbol.upper():
                    asset_type = "ETF"

            name = row.get(name_col).strip() if name_col and row.get(name_col) else raw_symbol.replace(".NS", "").replace("_", " ").title()

            parsed_rows.append(CsvRowParsed(
                row_number=idx,
                date=dt.strftime("%Y-%m-%d"),
                symbol=raw_symbol,
                name=name,
                asset_type=asset_type,
                type=raw_type,
                quantity=qty,
                price=price,
                fees=fees,
                status="valid",
                error_message=None
            ))
            valid_count += 1
        except Exception as e:
            error_count += 1
            parsed_rows.append(CsvRowParsed(
                row_number=idx,
                date=row.get(date_col, ""),
                symbol=row.get(symbol_col, ""),
                name=row.get(name_col, ""),
                asset_type="UNKNOWN",
                type=row.get(type_col, ""),
                quantity=0.0,
                price=0.0,
                fees=0.0,
                status="error",
                error_message=str(e)
            ))

    return CsvImportPreview(
        total_rows=len(parsed_rows),
        valid_rows_count=valid_count,
        error_rows_count=error_count,
        rows=parsed_rows
    )
