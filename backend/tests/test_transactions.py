def test_create_buy_transaction_stock(client, auth_headers, test_portfolio):
    response = client.post(
        f"/api/v1/portfolios/{test_portfolio.id}/transactions",
        headers=auth_headers,
        json={
            "symbol": "RELIANCE.NS",
            "name": "Reliance Industries Ltd",
            "asset_type": "STOCK",
            "transaction_type": "BUY",
            "quantity": 10.0,
            "price": 2800.0,
            "fees": 15.0,
            "notes": "Initial purchase"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["symbol"] == "RELIANCE.NS"
    assert data["quantity"] == 10.0
    assert data["total_amount"] == 28015.0


def test_create_buy_transaction_mutual_fund_fractional(client, auth_headers, test_portfolio):
    response = client.post(
        f"/api/v1/portfolios/{test_portfolio.id}/transactions",
        headers=auth_headers,
        json={
            "symbol": "PARAG_PARIKH_FLEXI_CAP",
            "name": "Parag Parikh Flexi Cap Fund",
            "asset_type": "MUTUAL_FUND",
            "transaction_type": "BUY",
            "quantity": 142.385,
            "price": 70.25,
            "fees": 0.0,
            "notes": "SIP tranche"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["symbol"] == "PARAG_PARIKH_FLEXI_CAP"
    assert data["quantity"] == 142.385
    assert data["asset_type"] == "MUTUAL_FUND"


def test_overselling_rejection(client, auth_headers, test_portfolio):
    # Buy 5 shares of TCS.NS
    client.post(
        f"/api/v1/portfolios/{test_portfolio.id}/transactions",
        headers=auth_headers,
        json={
            "symbol": "TCS.NS",
            "name": "Tata Consultancy Services Ltd",
            "asset_type": "STOCK",
            "transaction_type": "BUY",
            "quantity": 5.0,
            "price": 4000.0,
            "fees": 5.0
        }
    )

    # Attempt to sell 10 shares of TCS.NS (should fail with 400)
    response = client.post(
        f"/api/v1/portfolios/{test_portfolio.id}/transactions",
        headers=auth_headers,
        json={
            "symbol": "TCS.NS",
            "name": "Tata Consultancy Services Ltd",
            "asset_type": "STOCK",
            "transaction_type": "SELL",
            "quantity": 10.0,
            "price": 4200.0,
            "fees": 5.0
        }
    )
    assert response.status_code == 400
    assert "Cannot execute SELL order" in response.json()["detail"]


def test_successful_partial_sell(client, auth_headers, test_portfolio):
    # Buy 10 shares of INFY.NS
    client.post(
        f"/api/v1/portfolios/{test_portfolio.id}/transactions",
        headers=auth_headers,
        json={
            "symbol": "INFY.NS",
            "name": "Infosys Ltd",
            "asset_type": "STOCK",
            "transaction_type": "BUY",
            "quantity": 10.0,
            "price": 1800.0,
            "fees": 10.0
        }
    )

    # Sell 4 shares of INFY.NS
    response = client.post(
        f"/api/v1/portfolios/{test_portfolio.id}/transactions",
        headers=auth_headers,
        json={
            "symbol": "INFY.NS",
            "name": "Infosys Ltd",
            "asset_type": "STOCK",
            "transaction_type": "SELL",
            "quantity": 4.0,
            "price": 1900.0,
            "fees": 5.0
        }
    )
    assert response.status_code == 201

    # Check holdings: remaining should be 6.0
    holdings_resp = client.get(f"/api/v1/portfolios/{test_portfolio.id}/holdings", headers=auth_headers)
    assert holdings_resp.status_code == 200
    infy_holding = next(h for h in holdings_resp.json() if h["symbol"] == "INFY.NS")
    assert infy_holding["quantity"] == 6.0

