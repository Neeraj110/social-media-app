from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_, func
from db.session import get_db
from api.deps import get_current_user
from models.user import User
from models.social import Follow, Friendship, Block
from schemas.user import UserResponse, UserUpdate, UserBasic, PasswordChange
from crud.user import get_user_by_id, update_user
from core.security import verify_password, hash_password
from typing import List

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """Get current logged-in user's profile."""
    return current_user


@router.put("/me", response_model=UserResponse)
async def update_me(
    user_in: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update current user profile."""
    update_data = user_in.model_dump(exclude_unset=True)

    # Map schema field names to model field names
    field_map = {
        "name": "full_name",
        "profile_picture": "profile_image_url",
        "cover_photo": "cover_image_url",
    }
    mapped = {}
    for k, v in update_data.items():
        mapped[field_map.get(k, k)] = v

    for field, value in mapped.items():
        if hasattr(current_user, field):
            setattr(current_user, field, value)

    await db.commit()
    await db.refresh(current_user)
    return current_user


@router.post("/me/change-password", status_code=status.HTTP_200_OK)
async def change_password(
    body: PasswordChange,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Change current user's password."""
    if not verify_password(body.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")

    current_user.hashed_password = hash_password(body.new_password)
    await db.commit()
    return {"message": "Password changed successfully"}


@router.get("/suggested", response_model=List[UserBasic])
async def get_suggested_users(
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Return suggested users for discovery excluding current user, followed users, and blocked users."""
    following_subq = select(Follow.following_id).where(Follow.follower_id == current_user.user_id)
    blocked_by_me = select(Block.blocked_id).where(Block.blocker_id == current_user.user_id)
    blocked_me = select(Block.blocker_id).where(Block.blocked_id == current_user.user_id)

    # First attempt: users not followed and not blocked
    result = await db.execute(
        select(User)
        .where(
            and_(
                User.user_id != current_user.user_id,
                User.user_id.not_in(following_subq),
                User.user_id.not_in(blocked_by_me),
                User.user_id.not_in(blocked_me),
            )
        )
        .order_by(User.created_at.desc())
        .limit(limit)
    )
    suggested = result.scalars().all()

    # If not enough unfollowed users, fill with other non-blocked users
    if len(suggested) < limit:
        already_suggested_ids = [u.user_id for u in suggested] + [current_user.user_id]
        fallback_result = await db.execute(
            select(User)
            .where(
                and_(
                    User.user_id.not_in(already_suggested_ids),
                    User.user_id.not_in(blocked_by_me),
                    User.user_id.not_in(blocked_me),
                )
            )
            .order_by(User.created_at.desc())
            .limit(limit - len(suggested))
        )
        suggested = list(suggested) + list(fallback_result.scalars().all())

    return suggested


@router.get("/{user_id}", response_model=UserResponse)
async def get_user_profile(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a user's public profile."""
    user = await get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Check if the current user is blocked
    block_check = await db.execute(
        select(Block).where(
            or_(
                and_(Block.blocker_id == user_id, Block.blocked_id == current_user.user_id),
                and_(Block.blocker_id == current_user.user_id, Block.blocked_id == user_id),
            )
        )
    )
    if block_check.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="Access denied")

    return user


@router.get("/{user_id}/followers", response_model=List[UserBasic])
async def get_followers(
    user_id: int,
    skip: int = 0,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get followers of a user."""
    result = await db.execute(
        select(User)
        .join(Follow, Follow.follower_id == User.user_id)
        .where(Follow.following_id == user_id)
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


@router.get("/{user_id}/following", response_model=List[UserBasic])
async def get_following(
    user_id: int,
    skip: int = 0,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get users that this user is following."""
    result = await db.execute(
        select(User)
        .join(Follow, Follow.following_id == User.user_id)
        .where(Follow.follower_id == user_id)
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


@router.get("/search/", response_model=List[UserBasic])
async def search_users(
    q: str,
    skip: int = 0,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Search users by username or name."""
    result = await db.execute(
        select(User)
        .where(
            or_(
                User.username.ilike(f"%{q}%"),
                User.full_name.ilike(f"%{q}%"),
            )
        )
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()
