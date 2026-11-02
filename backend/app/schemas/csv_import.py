from typing import List, Optional, Dict, Any
from pydantic import BaseModel


class CsvRowParsed(BaseModel):
    row_number: int
    date: str
    symbol: str
    name: Optional[str] = None
    asset_type: str
    type: str  # BUY or SELL
    quantity: float
    price: float
    fees: float = 0.0
    status: str = "valid"  # valid or error
    error_message: Optional[str] = None


class CsvImportPreview(BaseModel):
    total_rows: int
    valid_rows_count: int
    error_rows_count: int
    rows: List[CsvRowParsed]


class CsvImportResult(BaseModel):
    success: bool
    imported_count: int
    errors: List[str]
    message: str
