from sqlalchemy import String, Text, ForeignKey, Enum, TIMESTAMP, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from db.base import Base
import enum


class AIRole(str, enum.Enum):
    user = "user"
    assistant = "assistant"
    system = "system"


class AIChat(Base):
    __tablename__ = "ai_chats"

    chat_id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False
    )
    title: Mapped[str] = mapped_column(String(150), default="New Chat")
    created_at: Mapped[TIMESTAMP] = mapped_column(
        TIMESTAMP(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[TIMESTAMP] = mapped_column(
        TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    messages = relationship(
        "AIMessage", back_populates="chat", cascade="all, delete-orphan"
    )


class AIMessage(Base):
    __tablename__ = "ai_messages"

    message_id: Mapped[int] = mapped_column(primary_key=True)
    chat_id: Mapped[int] = mapped_column(
        ForeignKey("ai_chats.chat_id", ondelete="CASCADE"), nullable=False
    )
    role: Mapped[AIRole] = mapped_column(Enum(AIRole), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[TIMESTAMP] = mapped_column(
        TIMESTAMP(timezone=True), server_default=func.now()
    )

    chat = relationship("AIChat", back_populates="messages")
