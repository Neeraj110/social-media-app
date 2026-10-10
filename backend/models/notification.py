from typing import TYPE_CHECKING, Optional
from sqlalchemy import String, ForeignKey, Enum, Boolean, TIMESTAMP, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from db.base import Base
import enum

if TYPE_CHECKING:
    from models.user import User


class NotificationType(str, enum.Enum):
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


class EntityType(str, enum.Enum):
    post = "post"
    comment = "comment"
    user = "user"
    message = "message"
    friend_request = "friend_request"


class Notification(Base):
    __tablename__ = "notifications"

    notification_id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False
    )
    actor_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.user_id", ondelete="SET NULL")
    )
    type: Mapped[NotificationType] = mapped_column(
        Enum(NotificationType), nullable=False
    )
    entity_type: Mapped[EntityType | None] = mapped_column(
        Enum(EntityType),
    )
    entity_id: Mapped[int] = mapped_column(nullable=False)
    content: Mapped[str | None] = mapped_column(String(255))
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[TIMESTAMP] = mapped_column(
        TIMESTAMP(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[TIMESTAMP] = mapped_column(
        TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    actor: Mapped[Optional["User"]] = relationship(
        "User", foreign_keys=[actor_id], lazy="selectin"
    )
