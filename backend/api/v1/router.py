from fastapi import APIRouter
from api.v1.endpoints import auth, users, posts, social, messages, notifications, ai_chat, extra, upload

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(posts.router)
api_router.include_router(social.router)
api_router.include_router(messages.router)
api_router.include_router(notifications.router)
api_router.include_router(ai_chat.router)
api_router.include_router(extra.router)
api_router.include_router(upload.router)
