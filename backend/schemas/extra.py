from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from enum import Enum


class ReportReason(str, Enum):
    spam = "spam"
    harassment = "harassment"
    hate_speech = "hate_speech"
    nudity = "nudity"
    violence = "violence"
    other = "other"


class ReportStatus(str, Enum):
    pending = "pending"
    reviewed = "reviewed"
    resolved = "resolved"
    rejected = "rejected"


class DeviceType(str, Enum):
    android = "android"
    ios = "ios"
    web = "web"


# -------- Report --------
class ReportCreate(BaseModel):
    reported_user_id: Optional[int] = None
    post_id: Optional[int] = None
    comment_id: Optional[int] = None
    reason: ReportReason
    description: Optional[str] = None


class ReportResponse(BaseModel):
    report_id: int
    reason: ReportReason
    description: Optional[str] = None
    status: ReportStatus
    created_at: datetime

    class Config:
        from_attributes = True


# -------- User Settings --------
class UserSettingsUpdate(BaseModel):
    who_can_message: Optional[str] = None
    who_can_comment: Optional[str] = None
    show_online_status: Optional[bool] = None
    show_last_seen: Optional[bool] = None
    email_notifications: Optional[bool] = None
    push_notifications: Optional[bool] = None


class UserSettingsResponse(BaseModel):
    who_can_message: str
    who_can_comment: str
    show_online_status: bool
    show_last_seen: bool
    email_notifications: bool
    push_notifications: bool
    updated_at: datetime

    class Config:
        from_attributes = True


# -------- Device Token --------
class DeviceTokenCreate(BaseModel):
    device_token: str
    device_type: DeviceType


class DeviceTokenResponse(BaseModel):
    token_id: int
    device_token: str
    device_type: DeviceType
    created_at: datetime

    class Config:
        from_attributes = True


# -------- Hashtag --------
class HashtagResponse(BaseModel):
    hashtag_id: int
    name: str
    posts_count: int

    class Config:
        from_attributes = True
