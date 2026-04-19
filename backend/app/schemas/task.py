from pydantic import BaseModel
from datetime import datetime


class TaskCreate(BaseModel):
    title: str
    description: str | None = None


class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    completed: bool | None = None


class TaskOut(BaseModel):
    id: int
    title: str
    description: str | None
    completed: bool
    created_at: datetime | None
    owner_id: int

    model_config = {"from_attributes": True}


class TaskListOut(BaseModel):
    tasks: list[TaskOut]
    total: int
    page: int
    page_size: int
    total_pages: int
