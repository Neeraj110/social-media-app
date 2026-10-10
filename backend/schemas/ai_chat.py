from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from enum import Enum


class AIRole(str, Enum):
    user = "user"
    assistant = "assistant"
    system = "system"


class AIMessageCreate(BaseModel):
    content: str = Field(..., min_length=1)


class AIMessageResponse(BaseModel):
    message_id: int
    role: AIRole
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class AIChatCreate(BaseModel):
    title: Optional[str] = "New Chat"


class AIChatResponse(BaseModel):
    chat_id: int
    title: str
    created_at: datetime
    updated_at: datetime
    messages: List[AIMessageResponse] = []

    class Config:
        from_attributes = True


class AIChatListResponse(BaseModel):
    chat_id: int
    title: str
    updated_at: datetime

    class Config:
        from_attributes = True
