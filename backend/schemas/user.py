from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional
from enum import Enum


class AccountVisibility(str, Enum):
    public = "public"
    private = "private"


class UserStatus(str, Enum):
    active = "active"
    suspended = "suspended"
    deleted = "deleted"


class UserCreate(BaseModel):
    name: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=4)
    username: str = Field(..., min_length=3, max_length=30)


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=4)


class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=3, max_length=50)
    bio: Optional[str] = None
    profile_picture: Optional[str] = None
    cover_photo: Optional[str] = None
    account_visibility: Optional[AccountVisibility] = None


class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=4)


class UserResponse(BaseModel):
    user_id: int
    full_name: Optional[str] = None
    username: str
    email: EmailStr
    bio: Optional[str] = None
    profile_image_url: Optional[str] = None
    cover_image_url: Optional[str] = None
    account_visibility: AccountVisibility
    is_verified: bool
    user_status: UserStatus
    created_at: datetime

    model_config = {"from_attributes": True}


class UserBasic(BaseModel):
    user_id: int
    full_name: Optional[str] = None
    username: str
    profile_image_url: Optional[str] = None
    is_verified: bool

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[int] = None
