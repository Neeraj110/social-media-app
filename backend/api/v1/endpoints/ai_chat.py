from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
from db.session import get_db
from api.deps import get_current_user
from models.user import User
from models.ai_chat import AIChat, AIMessage, AIRole
from schemas.ai_chat import (
    AIChatCreate, AIChatResponse, AIChatListResponse,
    AIMessageCreate, AIMessageResponse
)
from typing import List
from google import genai
from google.genai import types
from core.config import settings

router = APIRouter(prefix="/ai", tags=["AI Chat"])


@router.post("/chats", response_model=AIChatResponse, status_code=201)
async def create_chat(
    body: AIChatCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new AI chat session."""
    chat = AIChat(user_id=current_user.user_id, title=body.title or "New Chat")
    db.add(chat)
    await db.commit()
    await db.refresh(chat)
    return chat


@router.get("/chats", response_model=List[AIChatListResponse])
async def list_chats(
    skip: int = 0,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all AI chat sessions for current user."""
    result = await db.execute(
        select(AIChat)
        .where(AIChat.user_id == current_user.user_id)
        .order_by(AIChat.updated_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


@router.get("/chats/{chat_id}", response_model=AIChatResponse)
async def get_chat(
    chat_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific AI chat with all messages."""
    result = await db.execute(
        select(AIChat)
        .options(selectinload(AIChat.messages))
        .where(and_(AIChat.chat_id == chat_id, AIChat.user_id == current_user.user_id))
    )
    chat = result.scalar_one_or_none()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")
    return chat


@router.post("/chats/{chat_id}/messages", response_model=AIMessageResponse)
async def send_message_to_ai(
    chat_id: int,
    body: AIMessageCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Send a message to the AI and get a response."""
    # Verify chat ownership
    result = await db.execute(
        select(AIChat)
        .options(selectinload(AIChat.messages))
        .where(and_(AIChat.chat_id == chat_id, AIChat.user_id == current_user.user_id))
    )
    chat = result.scalar_one_or_none()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    # Save user message
    user_message = AIMessage(chat_id=chat_id, role=AIRole.user, content=body.content)
    db.add(user_message)
    await db.flush()

    # Call Gemini AI
    try:
        if settings.GEMINI_API_KEY:
            client = genai.Client(api_key=settings.GEMINI_API_KEY)
            history_contents = [
                types.Content(
                    role="user" if msg.role == AIRole.user else "model",
                    parts=[types.Part.from_text(text=msg.content or "")]
                )
                for msg in chat.messages
            ]
            gemini_chat = client.chats.create(
                model="gemini-2.5-flash",
                history=history_contents
            )
            response = gemini_chat.send_message(message=body.content)
            ai_content = response.text or "I'm sorry, I'm unable to process your request right now."
        else:
            ai_content = "AI Assistant is running in local mode. Please configure GEMINI_API_KEY in your environment to enable real-time Gemini responses."

    except Exception as e:
        # Fallback if Gemini not configured or encounters an API error
        ai_content = f"I'm sorry, I encountered an issue processing your request: {str(e)}"

    # Save AI response
    ai_message = AIMessage(chat_id=chat_id, role=AIRole.assistant, content=ai_content)
    db.add(ai_message)

    # Update chat title from first message
    if len(chat.messages) == 0:
        chat.title = body.content[:50] + ("..." if len(body.content) > 50 else "")

    await db.commit()
    await db.refresh(ai_message)
    return ai_message


@router.delete("/chats/{chat_id}", status_code=204)
async def delete_chat(
    chat_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete an AI chat session."""
    result = await db.execute(
        select(AIChat).where(
            and_(AIChat.chat_id == chat_id, AIChat.user_id == current_user.user_id)
        )
    )
    chat = result.scalar_one_or_none()
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    await db.delete(chat)
    await db.commit()
