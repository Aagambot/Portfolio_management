def test_portfolio_summary_and_allocations(client, auth_headers, test_portfolio):
    # Buy 10 RELIANCE.NS (Stock)
    client.post(
        f"/api/v1/portfolios/{test_portfolio.id}/transactions",
        headers=auth_headers,
        json={
            "symbol": "RELIANCE.NS",
            "name": "Reliance Industries Ltd",
            "asset_type": "STOCK",
            "transaction_type": "BUY",
            "quantity": 10.0,
            "price": 2800.0,
            "fees": 10.0
        }
    )

    # Buy 100 units of Mutual Fund
    client.post(
        f"/api/v1/portfolios/{test_portfolio.id}/transactions",
        headers=auth_headers,
        json={
            "symbol": "PARAG_PARIKH_FLEXI_CAP",
            "name": "Parag Parikh Flexi Cap Fund",
            "asset_type": "MUTUAL_FUND",
            "transaction_type": "BUY",
            "quantity": 100.0,
            "price": 70.0,
            "fees": 0.0
        }
    )

    # Check Summary
    summary_resp = client.get(f"/api/v1/portfolios/{test_portfolio.id}/summary", headers=auth_headers)
    assert summary_resp.status_code == 200
    summary = summary_resp.json()
    assert summary["portfolio_id"] == test_portfolio.id
    assert summary["currency"] == "INR"
    assert summary["currency_symbol"] == "₹"
    assert summary["total_invested"] > 30000.0
    assert summary["total_value"] > 0.0
    assert summary["holdings_count"] == 2

    # Check Allocations
    alloc_resp = client.get(f"/api/v1/portfolios/{test_portfolio.id}/allocations", headers=auth_headers)
    assert alloc_resp.status_code == 200
    allocations = alloc_resp.json()
    categories = [a["name"] for a in allocations]
    assert "Indian Equities" in categories
    assert "Mutual Funds" in categories
    total_pct = sum(a["percent"] for a in allocations)
    assert abs(total_pct - 100.0) < 0.5


def test_indian_risk_metrics_calculation(client, auth_headers, test_portfolio):
    # Add holdings
    client.post(
        f"/api/v1/portfolios/{test_portfolio.id}/transactions",
        headers=auth_headers,
        json={
            "symbol": "TCS.NS",
            "name": "Tata Consultancy Services",
            "asset_type": "STOCK",
            "transaction_type": "BUY",
            "quantity": 10.0,
            "price": 4000.0,
            "fees": 10.0
        }
    )

    risk_resp = client.get(f"/api/v1/portfolios/{test_portfolio.id}/risk-metrics", headers=auth_headers)
    assert risk_resp.status_code == 200
    risk = risk_resp.json()
    assert risk["risk_free_rate_used"] == 0.068  # Indian 6.8% G-Sec
    assert risk["benchmark_used"] == "^NSEI"  # Nifty 50
    assert risk["annualized_volatility"] >= 0.0
    assert isinstance(risk["sharpe_ratio"], (int, float))
    assert isinstance(risk["beta"], (int, float))
    assert risk["var_95_daily"] >= 0.0
    assert "volatility" in risk["metrics_interpretation"]
    assert "sharpe" in risk["metrics_interpretation"]
    assert "var_95" in risk["metrics_interpretation"]


def test_performance_history_endpoint(client, auth_headers, test_portfolio):
    client.post(
        f"/api/v1/portfolios/{test_portfolio.id}/transactions",
        headers=auth_headers,
        json={
            "symbol": "HDFCBANK.NS",
            "name": "HDFC Bank Ltd",
            "asset_type": "STOCK",
            "transaction_type": "BUY",
            "quantity": 20.0,
            "price": 1600.0,
            "fees": 10.0
        }
    )

    perf_resp = client.get(f"/api/v1/portfolios/{test_portfolio.id}/performance", headers=auth_headers)
    assert perf_resp.status_code == 200
    points = perf_resp.json()
    assert isinstance(points, list)
    if points:
        assert "date" in points[0]
        assert "portfolio_value" in points[0]
        assert "benchmark_normalized" in points[0]

