import pytest


def create_user_and_token(client, username="testuser", email="test@example.com", password="pass123"):
    client.post("/register", json={"username": username, "email": email, "password": password})
    res = client.post("/login", json={"username": username, "email": email, "password": password})
    return res.json()["access_token"]


def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


def test_create_task(client):
    token = create_user_and_token(client)
    response = client.post("/tasks", json={"title": "Buy groceries", "description": "Milk and eggs"},
                           headers=auth_headers(token))
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Buy groceries"
    assert data["completed"] is False


def test_create_task_unauthenticated(client):
    response = client.post("/tasks", json={"title": "Test"})
    assert response.status_code == 403


def test_get_all_tasks(client):
    token = create_user_and_token(client)
    headers = auth_headers(token)
    client.post("/tasks", json={"title": "Task 1"}, headers=headers)
    client.post("/tasks", json={"title": "Task 2"}, headers=headers)
    response = client.get("/tasks", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 2
    assert len(data["tasks"]) == 2


def test_get_tasks_pagination(client):
    token = create_user_and_token(client)
    headers = auth_headers(token)
    for i in range(5):
        client.post("/tasks", json={"title": f"Task {i}"}, headers=headers)
    response = client.get("/tasks?page=1&page_size=3", headers=headers)
    data = response.json()
    assert len(data["tasks"]) == 3
    assert data["total"] == 5
    assert data["total_pages"] == 2


def test_filter_completed_tasks(client):
    token = create_user_and_token(client)
    headers = auth_headers(token)
    r1 = client.post("/tasks", json={"title": "Task A"}, headers=headers)
    client.post("/tasks", json={"title": "Task B"}, headers=headers)
    task_id = r1.json()["id"]
    client.put(f"/tasks/{task_id}", json={"completed": True}, headers=headers)

    response = client.get("/tasks?completed=true", headers=headers)
    data = response.json()
    assert data["total"] == 1
    assert data["tasks"][0]["completed"] is True


def test_get_single_task(client):
    token = create_user_and_token(client)
    headers = auth_headers(token)
    created = client.post("/tasks", json={"title": "Single Task"}, headers=headers).json()
    response = client.get(f"/tasks/{created['id']}", headers=headers)
    assert response.status_code == 200
    assert response.json()["title"] == "Single Task"


def test_get_task_not_found(client):
    token = create_user_and_token(client)
    response = client.get("/tasks/9999", headers=auth_headers(token))
    assert response.status_code == 404


def test_update_task_mark_completed(client):
    token = create_user_and_token(client)
    headers = auth_headers(token)
    task = client.post("/tasks", json={"title": "Do laundry"}, headers=headers).json()
    response = client.put(f"/tasks/{task['id']}", json={"completed": True}, headers=headers)
    assert response.status_code == 200
    assert response.json()["completed"] is True


def test_delete_task(client):
    token = create_user_and_token(client)
    headers = auth_headers(token)
    task = client.post("/tasks", json={"title": "Delete me"}, headers=headers).json()
    response = client.delete(f"/tasks/{task['id']}", headers=headers)
    assert response.status_code == 204
    assert client.get(f"/tasks/{task['id']}", headers=headers).status_code == 404


def test_user_cannot_access_other_users_task(client):
    token1 = create_user_and_token(client, "user1", "u1@e.com")
    token2 = create_user_and_token(client, "user2", "u2@e.com")
    task = client.post("/tasks", json={"title": "Private"}, headers=auth_headers(token1)).json()
    response = client.get(f"/tasks/{task['id']}", headers=auth_headers(token2))
    assert response.status_code == 404
