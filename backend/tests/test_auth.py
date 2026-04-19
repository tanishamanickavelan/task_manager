def test_register_success(client):
    response = client.post("/register", json={
        "username": "testuser",
        "email": "test@example.com",
        "password": "password123"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "testuser"
    assert data["email"] == "test@example.com"
    assert "id" in data


def test_register_duplicate_username(client):
    payload = {"username": "testuser", "email": "test@example.com", "password": "password123"}
    client.post("/register", json=payload)
    response = client.post("/register", json={**payload, "email": "other@example.com"})
    assert response.status_code == 400
    assert "Username already taken" in response.json()["detail"]


def test_register_duplicate_email(client):
    client.post("/register", json={"username": "user1", "email": "dupe@example.com", "password": "pass"})
    response = client.post("/register", json={"username": "user2", "email": "dupe@example.com", "password": "pass"})
    assert response.status_code == 400
    assert "Email already registered" in response.json()["detail"]


def test_login_success(client):
    client.post("/register", json={"username": "testuser", "email": "t@t.com", "password": "pass123"})
    response = client.post("/login", json={"username": "testuser", "email": "t@t.com", "password": "pass123"})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password(client):
    client.post("/register", json={"username": "testuser", "email": "t@t.com", "password": "pass123"})
    response = client.post("/login", json={"username": "testuser", "email": "t@t.com", "password": "wrongpass"})
    assert response.status_code == 401


def test_login_nonexistent_user(client):
    response = client.post("/login", json={"username": "nobody", "email": "n@n.com", "password": "pass"})
    assert response.status_code == 401
