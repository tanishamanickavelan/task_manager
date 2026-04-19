# ✅ Task Manager — FastAPI + Vanilla JS

A full-stack Task Manager web application built with **FastAPI** (Python) for the backend and **plain HTML/CSS/JavaScript** for the frontend. Features JWT authentication, SQLite database, full CRUD task management, pagination, filtering, and a clean responsive UI.

---

## 🌐 Live Demo

> **Frontend:** [https://your-app.onrender.com](https://your-app.onrender.com)  
> **API Docs:** [https://your-app.onrender.com/docs](https://your-app.onrender.com/docs)

*(Replace with your actual Render URL after deploying)*

---

## 📸 Features

- 🔐 User registration & login with JWT authentication
- 🔒 Password hashing with bcrypt
- ✅ Create, view, update, and delete tasks
- 🎯 Mark tasks as completed
- 🔍 Filter tasks by status (`?completed=true`)
- 📄 Pagination support
- 👤 Users can only access their own tasks
- 📱 Responsive UI (works on mobile & desktop)
- 🧪 Pytest test suite (16 tests)
- 🐳 Dockerfile included

---

## 🗂️ Project Structure

```
task-manager/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app entry point
│   │   ├── config.py          # Settings & environment variables
│   │   ├── database.py        # SQLAlchemy engine & session
│   │   ├── dependencies.py    # JWT auth dependency
│   │   ├── models/
│   │   │   ├── user.py        # User ORM model
│   │   │   └── task.py        # Task ORM model
│   │   ├── schemas/
│   │   │   ├── user.py        # Pydantic schemas for users
│   │   │   └── task.py        # Pydantic schemas for tasks
│   │   ├── routers/
│   │   │   ├── auth.py        # /register and /login endpoints
│   │   │   └── tasks.py       # /tasks CRUD endpoints
│   │   └── auth/
│   │       ├── hashing.py     # bcrypt password hashing
│   │       └── jwt.py         # JWT token creation & decoding
│   ├── tests/
│   │   ├── conftest.py        # Pytest fixtures
│   │   ├── test_auth.py       # Auth endpoint tests
│   │   └── test_tasks.py      # Task endpoint tests
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   └── index.html             # Single-page app (CSS + JS inline)
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## ⚙️ Environment Variables

Create a `.env` file inside the `backend/` folder based on `.env.example`:

| Variable | Default | Description |
|---|---|---|
| `SECRET_KEY` | `changeme-...` | JWT signing secret — **change this in production!** |
| `ALGORITHM` | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | Token expiry in minutes |
| `DATABASE_URL` | `sqlite:///./taskmanager.db` | Database connection string |

---

## 🚀 How to Run Locally

### Prerequisites
- Python 3.11+
- pip

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/task-manager.git
cd task-manager
```

### 2. Set up the backend

```bash
cd backend
python -m venv venv

# Windows:
venv\Scripts\activate

# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and set a strong `SECRET_KEY`.

### 4. Run the backend

```bash
uvicorn app.main:app --reload --port 8000
```

### 5. Open the frontend

Open `frontend/index.html` directly in your browser — no extra server needed.

---

## 🔗 API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/register` | Register a new user |
| `POST` | `/login` | Login and receive JWT token |

### Tasks *(all require Bearer token)*

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/tasks` | Create a task |
| `GET` | `/tasks` | Get all tasks (paginated) |
| `GET` | `/tasks/{id}` | Get a single task |
| `PUT` | `/tasks/{id}` | Update a task |
| `DELETE` | `/tasks/{id}` | Delete a task |

### Query Parameters for `GET /tasks`

| Parameter | Type | Description |
|---|---|---|
| `page` | int | Page number (default: 1) |
| `page_size` | int | Items per page (default: 10, max: 100) |
| `completed` | bool | Filter by `true` or `false` |

**Example:**
```
GET /tasks?page=1&page_size=10&completed=false
```

---

## 🧪 Running Tests

```bash
cd backend
# (with venv activated)
pytest tests/ -v
```

Expected output: **16 passed**

---

## 🐳 Run with Docker

```bash
# From the project root:
docker-compose up --build
```

Visit `http://localhost:8000`

---

## ☁️ Deployment on Render

1. Push this repo to GitHub (public)
2. Go to [render.com](https://render.com) → **New Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Root directory:** `backend`
   - **Build command:** `pip install -r requirements.txt`
   - **Start command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables in Render dashboard:
   - `SECRET_KEY` → any long random string
   - `DATABASE_URL` → `sqlite:///./taskmanager.db`
6. Deploy!

For the frontend, create a **Render Static Site**:
- **Root directory:** `frontend`
- **Publish directory:** `frontend`
- Update the `API` variable in `frontend/index.html` to your Render backend URL

---

## 🔒 Security Notes

- Never commit `.env` — it is in `.gitignore`
- Always use a strong random `SECRET_KEY` in production
- Passwords are hashed with bcrypt before storage
- JWT tokens expire after `ACCESS_TOKEN_EXPIRE_MINUTES` minutes
- Users can only access their own tasks (enforced at API level)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI (Python) |
| Database | SQLite (via SQLAlchemy) |
| Auth | JWT + bcrypt |
| Frontend | HTML + CSS + JavaScript (single file) |
| Testing | pytest |
| Deployment | Render |