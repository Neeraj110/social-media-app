from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
from db.session import get_db
from api.deps import get_current_user
from models.user import User
from models.message import Conversation, ConversationParticipant, Message
from schemas.message import (
    ConversationCreate, ConversationResponse,
    MessageCreate, MessageResponse
)
from typing import List
from core.socket_manager import notify_new_message
router = APIRouter(prefix="/messages", tags=["Messages"])


@router.post("/conversations", response_model=ConversationResponse, status_code=201)
async def create_conversation(
    body: ConversationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new conversation (DM or group)."""
    # For DM, check if conversation already exists between these two users
    if not body.is_group and len(body.participant_ids) == 1:
        other_id = body.participant_ids[0]
        # Find existing DM conversation
        result = await db.execute(
            select(Conversation)
            .join(ConversationParticipant, ConversationParticipant.conversation_id == Conversation.conversation_id)
            .where(
                and_(
                    Conversation.is_group == False,
                    ConversationParticipant.user_id == current_user.user_id,
                )
            )
        )
        existing_convs = result.scalars().all()
        for conv in existing_convs:
            participants_result = await db.execute(
                select(ConversationParticipant).where(
                    ConversationParticipant.conversation_id == conv.conversation_id
                )
            )
            participants = participants_result.scalars().all()
            participant_ids = {p.user_id for p in participants}
            if participant_ids == {current_user.user_id, other_id}:
                # Load and return existing conversation
                full_result = await db.execute(
                    select(Conversation)
                    .options(selectinload(Conversation.participants).selectinload(ConversationParticipant.user))
                    .where(Conversation.conversation_id == conv.conversation_id)
                )
                return full_result.scalar_one()

    conversation = Conversation(
        is_group=body.is_group,
        group_name=body.group_name,
        created_by=current_user.user_id,
    )
    db.add(conversation)
    await db.flush()  # Get ID without committing

    # Add creator as admin participant
    creator_participant = ConversationParticipant(
        conversation_id=conversation.conversation_id,
        user_id=current_user.user_id,
        is_admin=True,
    )
    db.add(creator_participant)

    # Add other participants
    for pid in body.participant_ids:
        if pid != current_user.user_id:
            p = ConversationParticipant(
                conversation_id=conversation.conversation_id,
                user_id=pid,
            )
            db.add(p)

    await db.commit()

    # Return full conversation with participants
    full_result = await db.execute(
        select(Conversation)
        .options(selectinload(Conversation.participants).selectinload(ConversationParticipant.user))
        .where(Conversation.conversation_id == conversation.conversation_id)
    )
    return full_result.scalar_one()


@router.get("/conversations", response_model=List[ConversationResponse])
async def get_my_conversations(
    skip: int = 0,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all conversations for current user."""
    result = await db.execute(
        select(Conversation)
        .options(
            selectinload(Conversation.participants).selectinload(ConversationParticipant.user),
            selectinload(Conversation.messages),
        )
        .join(ConversationParticipant, ConversationParticipant.conversation_id == Conversation.conversation_id)
        .where(ConversationParticipant.user_id == current_user.user_id)
        .order_by(Conversation.updated_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


@router.get("/conversations/{conversation_id}", response_model=ConversationResponse)
async def get_conversation(
    conversation_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a single conversation."""
    # Check membership
    participant = await db.execute(
        select(ConversationParticipant).where(
            and_(
                ConversationParticipant.conversation_id == conversation_id,
                ConversationParticipant.user_id == current_user.user_id,
            )
        )
    )
    if not participant.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="Not a member of this conversation")

    result = await db.execute(
        select(Conversation)
        .options(selectinload(Conversation.participants).selectinload(ConversationParticipant.user))
        .where(Conversation.conversation_id == conversation_id)
    )
    conv = result.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conv


@router.post("/conversations/{conversation_id}/messages", response_model=MessageResponse, status_code=201)
async def send_message(
    conversation_id: int,
    body: MessageCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Send a message to a conversation."""
    # Verify membership
    participant = await db.execute(
        select(ConversationParticipant).where(
            and_(
                ConversationParticipant.conversation_id == conversation_id,
                ConversationParticipant.user_id == current_user.user_id,
            )
        )
    )
    if not participant.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="Not a member of this conversation")

    if not body.content and not body.media_url:
        raise HTTPException(status_code=400, detail="Message must have content or media")

    message = Message(
        conversation_id=conversation_id,
        sender_id=current_user.user_id,
        content=body.content,
        media_url=body.media_url,
        media_type=body.media_type,
        reply_to_message_id=body.reply_to_message_id,
    )
    db.add(message)

    # Update conversation updated_at
    conv_result = await db.execute(
        select(Conversation).where(Conversation.conversation_id == conversation_id)
    )
    conv = conv_result.scalar_one_or_none()
    if conv:
        from sqlalchemy import func
        conv.updated_at = func.now()

    await db.commit()
    await db.refresh(message)
    
    # Load sender for the response and notification
    await db.refresh(message, ['sender'])

    # Emit socket.io event
    # We need to construct a dict similar to MessageResponse for the socket payload
    msg_data = {
        "message_id": message.message_id,
        "conversation_id": message.conversation_id,
        "sender_id": message.sender_id,
        "content": message.content,
        "media_url": message.media_url,
        "media_type": message.media_type.value if message.media_type else None,
        "reply_to_message_id": message.reply_to_message_id,
        "created_at": message.created_at.isoformat() if message.created_at else None,
    }
    await notify_new_message(conversation_id, msg_data)

    return message


@router.get("/conversations/{conversation_id}/messages", response_model=List[MessageResponse])
async def get_messages(
    conversation_id: int,
    skip: int = 0,
    limit: int = 50,
    cursor: int = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get messages in a conversation."""
    # Verify membership
    participant = await db.execute(
        select(ConversationParticipant).where(
            and_(
                ConversationParticipant.conversation_id == conversation_id,
                ConversationParticipant.user_id == current_user.user_id,
            )
        )
    )
    if not participant.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="Not a member of this conversation")

    query = (
        select(Message)
        .options(selectinload(Message.sender))
        .where(Message.conversation_id == conversation_id)
    )
    
    if cursor:
        query = query.where(Message.message_id < cursor)
        
    query = query.order_by(Message.message_id.desc())
    
    if not cursor:
        query = query.offset(skip)
        
    query = query.limit(limit)
    
    result = await db.execute(query)
    return result.scalars().all()


@router.delete("/conversations/{conversation_id}/messages/{message_id}", status_code=204)
async def delete_message(
    conversation_id: int,
    message_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete (soft delete) a message."""
    result = await db.execute(
        select(Message).where(
            and_(Message.message_id == message_id, Message.conversation_id == conversation_id)
        )
    )
    message = result.scalar_one_or_none()
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    if message.sender_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    message.is_deleted = True
    message.content = None
    await db.commit()
