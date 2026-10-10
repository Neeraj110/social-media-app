from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from enum import Enum
from schemas.user import UserBasic


class PostVisibility(str, Enum):
    public = "public"
    friends = "friends"
    private = "private"


class MediaType(str, Enum):
    image = "image"
    video = "video"


class ReactionType(str, Enum):
    like = "like"
    love = "love"
    haha = "haha"
    wow = "wow"
    sad = "sad"
    angry = "angry"


class PostMediaCreate(BaseModel):
    media_type: MediaType
    media_url: str
    position: int = 0


class PostMediaResponse(BaseModel):
    media_id: int
    media_type: MediaType
    media_url: str
    position: int

    class Config:
        from_attributes = True


class PostCreate(BaseModel):
    content: str = Field(..., min_length=1)
    post_visibility: PostVisibility = PostVisibility.public
    media: Optional[List[PostMediaCreate]] = None


class PostUpdate(BaseModel):
    content: Optional[str] = Field(None, min_length=1)
    post_visibility: Optional[PostVisibility] = None
    media: Optional[List[PostMediaCreate]] = None


class PostResponse(BaseModel):
    post_id: int
    content: str
    post_visibility: PostVisibility
    comments_count: int
    reactions_count: int
    created_at: datetime
    updated_at: datetime
    user: UserBasic
    media: List[PostMediaResponse] = []

    class Config:
        from_attributes = True


class ReactionCreate(BaseModel):
    type: ReactionType


class ReactionResponse(BaseModel):
    reaction_id: int
    type: ReactionType
    user: UserBasic
    created_at: datetime

    class Config:
        from_attributes = True
