from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from schemas.user import UserBasic


class CommentCreate(BaseModel):
    content: str = Field(..., min_length=1)
    parent_comment_id: Optional[int] = None


class CommentUpdate(BaseModel):
    content: Optional[str] = Field(..., min_length=1)


class CommentResponse(BaseModel):
    comment_id: int
    content: str
    replies_count: int
    created_at: datetime
    updated_at: datetime
    user: UserBasic
    parent_comment_id: Optional[int] = None
    replies: List["CommentResponse"] = []

    class Config:
        from_attributes = True


CommentResponse.model_rebuild()
