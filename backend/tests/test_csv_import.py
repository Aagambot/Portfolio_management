import io


def test_download_sample_csv(client):
    response = client.get("/api/v1/portfolios/sample-csv")
    assert response.status_code == 200
    assert "Date,Symbol,Name,AssetType,Type,Quantity,Price,Fees" in response.text
    assert "RELIANCE.NS" in response.text
    assert "PARAG_PARIKH_FLEXI_CAP" in response.text


def test_import_valid_csv(client, auth_headers, test_portfolio):
    csv_data = (
        "Date,Symbol,Name,AssetType,Type,Quantity,Price,Fees\n"
        "2024-01-15,RELIANCE.NS,Reliance Industries Ltd,STOCK,BUY,10.0,2800.0,10.0\n"
        "2024-02-10,PARAG_PARIKH_FLEXI_CAP,Parag Parikh Flexi Cap Fund,MUTUAL_FUND,BUY,150.25,70.0,0.0\n"
        "2024-03-05,NIFTYBEES.NS,Nippon India ETF Nifty 50 BeES,ETF,BUY,40.0,250.0,5.0\n"
    )
    files = {"file": ("test_import.csv", io.BytesIO(csv_data.encode("utf-8")), "text/csv")}

    response = client.post(
        f"/api/v1/portfolios/{test_portfolio.id}/import-csv",
        headers=auth_headers,
        files=files
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["imported_count"] == 3

    # Verify holdings are created
    holdings_resp = client.get(f"/api/v1/portfolios/{test_portfolio.id}/holdings", headers=auth_headers)
    assert holdings_resp.status_code == 200
    holdings = holdings_resp.json()
    symbols = [h["symbol"] for h in holdings]
    assert "RELIANCE.NS" in symbols
    assert "PARAG_PARIKH_FLEXI_CAP" in symbols
    assert "NIFTYBEES.NS" in symbols


def test_preview_csv_validation(client, auth_headers, test_portfolio):
    csv_data = (
        "Date,Symbol,Name,AssetType,Type,Quantity,Price,Fees\n"
        "2024-01-15,TCS.NS,Tata Consultancy Services,STOCK,BUY,5.0,4000.0,0.0\n"
        "invalid-date,HDFCBANK.NS,HDFC Bank,STOCK,INVALID_TYPE,-10,0,0\n"
    )
    files = {"file": ("preview.csv", io.BytesIO(csv_data.encode("utf-8")), "text/csv")}

    response = client.post(
        f"/api/v1/portfolios/{test_portfolio.id}/preview-csv",
        headers=auth_headers,
        files=files
    )
    assert response.status_code == 200
    data = response.json()
    assert data["total_rows"] == 2
    assert data["valid_rows_count"] == 1
    assert data["error_rows_count"] == 1
