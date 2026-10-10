from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from db.session import get_db
from api.deps import get_current_user
from models.user import User
from models.extra import UserSettings, Report
from schemas.extra import (
    UserSettingsUpdate, UserSettingsResponse,
    ReportCreate, ReportResponse,
    HashtagResponse
)
from models.extra import Hashtag

router = APIRouter(tags=["Settings & Reports"])


# ─── User Settings ────────────────────────────────────────────────────────────

@router.get("/settings", response_model=UserSettingsResponse)
async def get_settings(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user settings."""
    result = await db.execute(
        select(UserSettings).where(UserSettings.user_id == current_user.user_id)
    )
    settings = result.scalar_one_or_none()
    if not settings:
        # Create default settings
        settings = UserSettings(user_id=current_user.user_id)
        db.add(settings)
        await db.commit()
        await db.refresh(settings)
    return settings


@router.put("/settings", response_model=UserSettingsResponse)
async def update_settings(
    body: UserSettingsUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update user settings."""
    result = await db.execute(
        select(UserSettings).where(UserSettings.user_id == current_user.user_id)
    )
    settings = result.scalar_one_or_none()
    if not settings:
        settings = UserSettings(user_id=current_user.user_id)
        db.add(settings)
        await db.flush()

    update_data = body.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(settings, field, value)

    await db.commit()
    await db.refresh(settings)
    return settings


# ─── Reports ─────────────────────────────────────────────────────────────────

@router.post("/reports", response_model=ReportResponse, status_code=201)
async def submit_report(
    body: ReportCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Submit a report for a user, post, or comment."""
    if not any([body.reported_user_id, body.post_id, body.comment_id]):
        raise HTTPException(status_code=400, detail="Must specify what to report")

    report = Report(
        reporter_id=current_user.user_id,
        reported_user_id=body.reported_user_id,
        post_id=body.post_id,
        comment_id=body.comment_id,
        reason=body.reason,
        description=body.description,
    )
    db.add(report)
    await db.commit()
    await db.refresh(report)
    return report


# ─── Hashtags ─────────────────────────────────────────────────────────────────

@router.get("/hashtags/trending", response_model=list[HashtagResponse])
async def get_trending_hashtags(
    limit: int = 10,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get trending hashtags sorted by post count."""
    result = await db.execute(
        select(Hashtag)
        .order_by(Hashtag.posts_count.desc())
        .limit(limit)
    )
    return result.scalars().all()


@router.get("/hashtags/search", response_model=list[HashtagResponse])
async def search_hashtags(
    q: str,
    limit: int = 10,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Search hashtags by name."""
    result = await db.execute(
        select(Hashtag)
        .where(Hashtag.name.ilike(f"%{q}%"))
        .order_by(Hashtag.posts_count.desc())
        .limit(limit)
    )
    return result.scalars().all()
