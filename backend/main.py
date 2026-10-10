import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from api.v1.router import api_router
from db.session import engine
from db.base import Base

# Import all models so metadata is complete for create_all
import db.models_registry  # noqa: F401
from core.socket_manager import attach_socketio


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create all tables on startup (dev mode). Use Alembic for production."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


app = FastAPI(
    title="Social Media API",
    description="Social Media Platform API for managing users, posts, and interactions",
    version="1.0.0",
    lifespan=lifespan
)

# Ensure uploads directory exists and mount static files
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "static", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Allow requests from frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all API routes
app.include_router(api_router)


@app.get("/")
def read_root():
    return {"message": "Welcome to the Social Media API", "docs": "/docs"}


@app.get("/health")
def health_check():
    return {"status": "ok"}

# Wrap with Socket.IO
app = attach_socketio(app)
