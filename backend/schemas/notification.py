from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from enum import Enum
from schemas.user import UserBasic


class NotificationType(str, Enum):
    like = "like"
    love = "love"
    haha = "haha"
    wow = "wow"
    sad = "sad"
    angry = "angry"
    comment = "comment"
    reply = "reply"
    follow = "follow"
    friend_request = "friend_request"
    friend_accept = "friend_accept"
    mention = "mention"
    message = "message"
    system = "system"


class EntityType(str, Enum):
    post = "post"
    comment = "comment"
    user = "user"
    message = "message"
    friend_request = "friend_request"


class NotificationResponse(BaseModel):
    notification_id: int
    type: NotificationType
    entity_type: Optional[EntityType] = None
    entity_id: Optional[int] = None
    content: Optional[str] = None
    is_read: bool
    created_at: datetime
    actor: Optional[UserBasic] = None

    class Config:
        from_attributes = True
