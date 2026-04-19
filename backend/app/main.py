from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

from app.database import create_tables
from app.routers.auth import router as auth_router
from app.routers.tasks import router as tasks_router

app = FastAPI(
    title="Task Manager API",
    description="A simple task manager with JWT authentication",
    version="1.0.0",
)

# CORS — allow frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    create_tables()


# API routes
app.include_router(auth_router)
app.include_router(tasks_router)


# Serve frontend static files (if present)
FRONTEND_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "frontend")
if os.path.isdir(FRONTEND_DIR):
    app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")

    @app.get("/", include_in_schema=False)
    def serve_frontend():
        return FileResponse(os.path.join(FRONTEND_DIR, "index.html"))
else:
    @app.get("/", include_in_schema=False)
    def root():
        return {"message": "Task Manager API is running. Visit /docs for API documentation."}
