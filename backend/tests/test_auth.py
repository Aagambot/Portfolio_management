def test_register_user(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "newinvestor@example.com",
            "password": "securepassword123",
            "full_name": "New Investor",
            "role": "investor"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "newinvestor@example.com"
    assert data["user"]["role"] == "investor"


def test_register_duplicate_email(client, test_user):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": test_user.email,
            "password": "anotherpassword",
            "full_name": "Duplicate User"
        }
    )
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]


def test_login_successful(client, test_user):
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": test_user.email,
            "password": "testpass123"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == test_user.email


def test_login_wrong_password(client, test_user):
    response = client.post(
        "/api/v1/auth/login",
        json={
            "email": test_user.email,
            "password": "wrongpassword"
        }
    )
    assert response.status_code == 401


def test_get_current_user_profile(client, auth_headers, test_user):
    response = client.get("/api/v1/auth/me", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["email"] == test_user.email


def test_admin_route_forbidden_for_investor(client, auth_headers):
    response = client.get("/api/v1/admin/stats", headers=auth_headers)
    assert response.status_code == 403


def test_admin_route_allowed_for_admin(client, admin_headers, test_admin):
    response = client.get("/api/v1/admin/stats", headers=admin_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["admin_email"] == test_admin.email
