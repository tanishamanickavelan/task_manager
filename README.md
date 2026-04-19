# ✅ Task Manager — FastAPI + Vanilla JS

A full-stack Task Manager application built with **FastAPI** (backend) and **plain HTML/CSS/JS** (frontend).

**🌐 Live Demo:** _[Add your deployment URL here after deploying]_

---

## ✅ Feature Checklist

### Backend
- [x] User Registration (`POST /register`)
- [x] User Login with JWT (`POST /login`)
- [x] Password hashing with bcrypt
- [x] Create task (`POST /tasks`)
- [x] List all tasks with **pagination** (`GET /tasks?page=1&page_size=10`)
- [x] **Filter** tasks by completion (`GET /tasks?completed=true`)
- [x] Get single task (`GET /tasks/{id}`)
- [x] Update / mark task completed (`PUT /tasks/{id}`)
- [x] Delete task (`DELETE /tasks/{id}`)
- [x] Users can only access their own tasks
- [x] Proper HTTP status codes
- [x] Proper error handling
- [x] Clean folder structure (models / schemas / routers / auth)
- [x] SQLite database via SQLAlchemy
- [x] Pydantic models for validation
- [x] `pytest` test suite (auth + tasks)
- [x] Dockerfile
- [x] `.env.example`

### Frontend
- [x] User registration form
- [x] User login form
- [x] Create task modal
- [x] View all tasks list
- [x] Mark task completed (checkbox)
- [x] Edit task inline modal
- [x] Delete task (with confirmation)
- [x] Filter: All / Pending / Completed
- [x] Pagination controls
- [x] Responsive design
- [x] White / light theme (no dark theme)
- [x] Toast notifications

---

## 📁 Project Structure

```
task-manager/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI app entrypoint
│   │   ├── config.py         # Settings via pydantic-settings
│   │   ├── database.py       # SQLAlchemy engine & session
│   │   ├── dependencies.py   # get_current_user dependency
│   │   ├── models/
│   │   │   ├── user.py       # User ORM model
│   │   │   └── task.py       # Task ORM model
│   │   ├── schemas/
│   │   │   ├── user.py       # Pydantic schemas for users
│   │   │   └── task.py       # Pydantic schemas for tasks
│   │   ├── routers/
│   │   │   ├── auth.py       # /register and /login routes
│   │   │   └── tasks.py      # /tasks CRUD routes
│   │   └── auth/
│   │       ├── hashing.py    # bcrypt password hashing
│   │       └── jwt.py        # JWT create & decode
│   ├── tests/
│   │   ├── conftest.py       # pytest fixtures
│   │   ├── test_auth.py      # Auth endpoint tests
│   │   └── test_tasks.py     # Task endpoint tests
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── index.html            # Single-page app
│   ├── style.css             # White/light theme styles
│   └── app.js                # All frontend logic
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## 🚀 Quick Start (Local)

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
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Configure environment variables
```bash
cp .env.example .env
# Open .env and set a strong SECRET_KEY
```

### 4. Run the backend
```bash
uvicorn app.main:app --reload --port 8000
```

The API will be available at:
- **API:** http://localhost:8000
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

### 5. Open the frontend
Open `frontend/index.html` directly in your browser, **or** serve it:
```bash
# From the project root:
cd frontend
python -m http.server 3000
# Then visit http://localhost:3000
```

> The frontend auto-detects `localhost` and points to `http://localhost:8000`.

---

## 🌐 Run with Docker

```bash
# From the project root:
docker-compose up --build
```

Visit http://localhost:8000

---

## 🧪 Run Tests

```bash
cd backend
# (with venv active)
pytest tests/ -v
```

---

## 🔑 Environment Variables

| Variable | Default | Description |
|---|---|---|
| `SECRET_KEY` | `changeme-...` | JWT signing secret — **change this in production!** |
| `ALGORITHM` | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` | Token validity in minutes |
| `DATABASE_URL` | `sqlite:///./taskmanager.db` | Database connection string |

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/register` | Create a new user |
| `POST` | `/login` | Log in and receive JWT |

### Tasks _(require Bearer token)_
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/tasks` | Create a task |
| `GET` | `/tasks` | List tasks (paginated, filterable) |
| `GET` | `/tasks/{id}` | Get a single task |
| `PUT` | `/tasks/{id}` | Update a task |
| `DELETE` | `/tasks/{id}` | Delete a task |

**Query params for `GET /tasks`:**
- `page` — page number (default: 1)
- `page_size` — items per page (default: 10, max: 100)
- `completed` — `true` or `false` to filter by status

---

## ☁️ Deployment (Render)

1. Push this repo to GitHub (public)
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your repository
4. Set:
   - **Root directory:** `backend`
   - **Build command:** `pip install -r requirements.txt`
   - **Start command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables in the Render dashboard
6. Deploy!

For the frontend on Render Static Site:
- **Root directory:** `frontend`
- **Publish directory:** `frontend`
- Update `API` in `app.js` to your Render backend URL

---

## 🔒 Security Notes
- Never commit `.env` — it is in `.gitignore`
- Use a strong random `SECRET_KEY` in production
- Passwords are hashed with bcrypt before storage
- JWT tokens expire after `ACCESS_TOKEN_EXPIRE_MINUTES`
