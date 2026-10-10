from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from enum import Enum
from schemas.user import UserBasic


class FollowStatus(str, Enum):
    pending = "pending"
    accepted = "accepted"


class FriendRequestStatus(str, Enum):
    pending = "pending"
    accepted = "accepted"
    rejected = "rejected"


class FollowResponse(BaseModel):
    follower_id: int
    following_id: int
    status: FollowStatus
    created_at: datetime
    user: Optional[UserBasic] = None

    class Config:
        from_attributes = True


class FriendRequestCreate(BaseModel):
    receiver_id: int


class FriendRequestResponse(BaseModel):
    request_id: int
    sender_id: int
    receiver_id: int
    status: FriendRequestStatus
    created_at: datetime
    sender: Optional[UserBasic] = None
    receiver: Optional[UserBasic] = None

    class Config:
        from_attributes = True


class FriendshipResponse(BaseModel):
    user_id_1: int
    user_id_2: int
    created_at: datetime

    class Config:
        from_attributes = True
