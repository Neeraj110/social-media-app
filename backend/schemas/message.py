from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from enum import Enum
from schemas.user import UserBasic


class MediaType(str, Enum):
    image = "image"
    video = "video"
    file = "file"


class MessageCreate(BaseModel):
    content: Optional[str] = None
    media_url: Optional[str] = None
    media_type: Optional[MediaType] = None
    reply_to_message_id: Optional[int] = None


class MessageResponse(BaseModel):
    message_id: int
    content: Optional[str] = None
    media_url: Optional[str] = None
    media_type: Optional[MediaType] = None
    is_deleted: bool
    created_at: datetime
    sender: UserBasic
    reply_to_message_id: Optional[int] = None

    class Config:
        from_attributes = True


class ConversationCreate(BaseModel):
    participant_ids: List[int]
    is_group: bool = False
    group_name: Optional[str] = None


class ConversationResponse(BaseModel):
    conversation_id: int
    is_group: bool
    group_name: Optional[str] = None
    group_image: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    participants: List[UserBasic] = []
    last_message: Optional[MessageResponse] = None

    class Config:
        from_attributes = True
