def test_list_portfolios_empty(client, auth_headers):
    response = client.get("/api/v1/portfolios", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_create_portfolio(client, auth_headers):
    response = client.post(
        "/api/v1/portfolios",
        headers=auth_headers,
        json={
            "name": "Retirement Fund 2040",
            "description": "Long term Indian index & mutual funds",
            "currency": "INR"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Retirement Fund 2040"
    assert data["currency"] == "INR"


def test_get_portfolio_by_id(client, auth_headers, test_portfolio):
    response = client.get(f"/api/v1/portfolios/{test_portfolio.id}", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_portfolio.id
    assert data["name"] == test_portfolio.name


def test_delete_portfolio(client, auth_headers, test_portfolio):
    response = client.delete(f"/api/v1/portfolios/{test_portfolio.id}", headers=auth_headers)
    assert response.status_code == 204

    # Verify 404 after deletion
    check = client.get(f"/api/v1/portfolios/{test_portfolio.id}", headers=auth_headers)
    assert check.status_code == 404
