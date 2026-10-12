from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from db.session import get_db
from api.deps import get_current_user
from models.user import User
from models.social import Follow, FriendRequest, FriendRequestStatus, Friendship, Block
from schemas.social import (
    FollowResponse, FriendRequestCreate, FriendRequestResponse, FriendshipResponse
)
from schemas.user import UserBasic
from typing import List

router = APIRouter(tags=["Social"])


# ─── Follow / Unfollow ───────────────────────────────────────────────────────

@router.post("/users/{user_id}/follow", status_code=200)
async def follow_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Follow a user."""
    if user_id == current_user.user_id:
        raise HTTPException(status_code=400, detail="Cannot follow yourself")

    existing = await db.execute(
        select(Follow).where(
            and_(Follow.follower_id == current_user.user_id, Follow.following_id == user_id)
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Already following this user")

    follow = Follow(follower_id=current_user.user_id, following_id=user_id)
    db.add(follow)
    await db.commit()
    return {"message": "Followed successfully"}


@router.delete("/users/{user_id}/follow", status_code=204)
async def unfollow_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Unfollow a user."""
    existing = await db.execute(
        select(Follow).where(
            and_(Follow.follower_id == current_user.user_id, Follow.following_id == user_id)
        )
    )
    follow = existing.scalar_one_or_none()
    if not follow:
        raise HTTPException(status_code=404, detail="Not following this user")

    await db.delete(follow)
    await db.commit()


# ─── Friend Requests ─────────────────────────────────────────────────────────

@router.post("/friend-requests", response_model=FriendRequestResponse, status_code=201)
async def send_friend_request(
    body: FriendRequestCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Send a friend request."""
    if body.receiver_id == current_user.user_id:
        raise HTTPException(status_code=400, detail="Cannot send friend request to yourself")

    existing = await db.execute(
        select(FriendRequest).where(
            or_(
                and_(FriendRequest.sender_id == current_user.user_id, FriendRequest.receiver_id == body.receiver_id),
                and_(FriendRequest.sender_id == body.receiver_id, FriendRequest.receiver_id == current_user.user_id),
            )
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Friend request already exists")

    fr = FriendRequest(sender_id=current_user.user_id, receiver_id=body.receiver_id)
    db.add(fr)
    await db.commit()
    await db.refresh(fr)
    return fr


@router.get("/friend-requests/pending", response_model=List[FriendRequestResponse])
async def get_pending_requests(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all incoming pending friend requests."""
    result = await db.execute(
        select(FriendRequest).where(
            and_(
                FriendRequest.receiver_id == current_user.user_id,
                FriendRequest.status == FriendRequestStatus.pending
            )
        )
    )
    return result.scalars().all()


@router.get("/friend-requests/sent", response_model=List[FriendRequestResponse])
async def get_sent_requests(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all sent pending friend requests."""
    result = await db.execute(
        select(FriendRequest).where(
            and_(
                FriendRequest.sender_id == current_user.user_id,
                FriendRequest.status == FriendRequestStatus.pending
            )
        )
    )
    return result.scalars().all()


@router.put("/friend-requests/{request_id}/accept", response_model=FriendRequestResponse)
async def accept_friend_request(
    request_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Accept a friend request."""
    result = await db.execute(
        select(FriendRequest).where(FriendRequest.request_id == request_id)
    )
    fr = result.scalar_one_or_none()
    if not fr:
        raise HTTPException(status_code=404, detail="Friend request not found")
    if fr.receiver_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    if fr.status != FriendRequestStatus.pending:
        raise HTTPException(status_code=400, detail="Request already processed")

    fr.status = FriendRequestStatus.accepted

    # Create friendship (ensure user_id_1 < user_id_2)
    uid1 = min(fr.sender_id, fr.receiver_id)
    uid2 = max(fr.sender_id, fr.receiver_id)
    friendship = Friendship(user_id_1=uid1, user_id_2=uid2)
    db.add(friendship)

    await db.commit()
    await db.refresh(fr)
    return fr


@router.put("/friend-requests/{request_id}/reject", response_model=FriendRequestResponse)
async def reject_friend_request(
    request_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Reject a friend request."""
    result = await db.execute(
        select(FriendRequest).where(FriendRequest.request_id == request_id)
    )
    fr = result.scalar_one_or_none()
    if not fr:
        raise HTTPException(status_code=404, detail="Friend request not found")
    if fr.receiver_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    fr.status = FriendRequestStatus.rejected
    await db.commit()
    await db.refresh(fr)
    return fr


@router.delete("/friend-requests/{request_id}", status_code=204)
async def cancel_friend_request(
    request_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Cancel a sent friend request."""
    result = await db.execute(
        select(FriendRequest).where(FriendRequest.request_id == request_id)
    )
    fr = result.scalar_one_or_none()
    if not fr:
        raise HTTPException(status_code=404, detail="Friend request not found")
    if fr.sender_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    await db.delete(fr)
    await db.commit()


# ─── Friends List ─────────────────────────────────────────────────────────────

@router.get("/friends", response_model=List[UserBasic])
async def get_my_friends(
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get list of current user's friends with full user profiles."""
    result = await db.execute(
        select(Friendship).where(
            or_(
                Friendship.user_id_1 == current_user.user_id,
                Friendship.user_id_2 == current_user.user_id,
            )
        )
        .offset(skip)
        .limit(limit)
    )
    friendships = result.scalars().all()
    friend_ids = [
        f.user_id_2 if f.user_id_1 == current_user.user_id else f.user_id_1
        for f in friendships
    ]
    if not friend_ids:
        return []

    users_result = await db.execute(
        select(User).where(User.user_id.in_(friend_ids))
    )
    return users_result.scalars().all()


# ─── Block / Unblock ─────────────────────────────────────────────────────────

@router.post("/users/{user_id}/block", status_code=200)
async def block_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Block a user."""
    if user_id == current_user.user_id:
        raise HTTPException(status_code=400, detail="Cannot block yourself")

    existing = await db.execute(
        select(Block).where(
            and_(Block.blocker_id == current_user.user_id, Block.blocked_id == user_id)
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="User already blocked")

    block = Block(blocker_id=current_user.user_id, blocked_id=user_id)
    db.add(block)
    await db.commit()
    return {"message": "User blocked"}


@router.delete("/users/{user_id}/block", status_code=204)
async def unblock_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Unblock a user."""
    existing = await db.execute(
        select(Block).where(
            and_(Block.blocker_id == current_user.user_id, Block.blocked_id == user_id)
        )
    )
    block = existing.scalar_one_or_none()
    if not block:
        raise HTTPException(status_code=404, detail="Block not found")

    await db.delete(block)
    await db.commit()
