from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from sqlalchemy.orm import selectinload
from db.session import get_db
from api.deps import get_current_user
from models.user import User
from models.post import Post, Reaction, Comment, SavedPost
from schemas.post import PostCreate, PostUpdate, PostResponse, ReactionCreate, ReactionResponse
from schemas.comment import CommentCreate, CommentUpdate, CommentResponse
from crud.post import create_post, get_post, get_posts, delete_post
from typing import List

router = APIRouter(prefix="/posts", tags=["Posts"])


@router.post("/", response_model=PostResponse, status_code=status.HTTP_201_CREATED)
async def create_new_post(
    post_in: PostCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new post."""
    post = await create_post(db, current_user.user_id, post_in)
    post = await get_post(db, post.post_id)
    return post


@router.get("/feed", response_model=List[PostResponse])
async def get_feed(
    skip: int = 0,
    limit: int = 20,
    cursor: int = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get public feed (posts from all public users)."""
    posts = await get_posts(db, skip=skip, limit=limit, cursor=cursor)
    return posts


@router.get("/{post_id}", response_model=PostResponse)
async def get_single_post(
    post_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific post by ID."""
    post = await get_post(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@router.put("/{post_id}", response_model=PostResponse)
async def update_existing_post(
    post_id: int,
    post_in: PostUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a post (owner only)."""
    post = await get_post(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    update_data = post_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field != "media":
            setattr(post, field, value)
    await db.commit()
    await db.refresh(post)
    return await get_post(db, post_id)


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_existing_post(
    post_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a post (owner only)."""
    post = await get_post(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    await delete_post(db, post)


# ─── Reactions ───────────────────────────────────────────────────────────────

@router.post("/{post_id}/react", response_model=ReactionResponse)
async def react_to_post(
    post_id: int,
    reaction_in: ReactionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add or update a reaction to a post."""
    post = await get_post(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    # Check if already reacted
    existing = await db.execute(
        select(Reaction).where(
            and_(Reaction.post_id == post_id, Reaction.user_id == current_user.user_id)
        )
    )
    existing_reaction = existing.scalar_one_or_none()

    if existing_reaction:
        existing_reaction.type = reaction_in.type
        await db.commit()
        await db.refresh(existing_reaction)
        return existing_reaction
    else:
        new_reaction = Reaction(
            post_id=post_id,
            user_id=current_user.user_id,
            type=reaction_in.type,
        )
        db.add(new_reaction)
        # Increment reactions count
        post.reactions_count = (post.reactions_count or 0) + 1
        await db.commit()
        await db.refresh(new_reaction)
        return new_reaction


@router.delete("/{post_id}/react", status_code=status.HTTP_204_NO_CONTENT)
async def remove_reaction(
    post_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Remove a reaction from a post."""
    existing = await db.execute(
        select(Reaction).where(
            and_(Reaction.post_id == post_id, Reaction.user_id == current_user.user_id)
        )
    )
    reaction = existing.scalar_one_or_none()
    if not reaction:
        raise HTTPException(status_code=404, detail="Reaction not found")

    post = await get_post(db, post_id)
    if post and post.reactions_count > 0:
        post.reactions_count -= 1

    await db.delete(reaction)
    await db.commit()


# ─── Comments ────────────────────────────────────────────────────────────────

@router.post("/{post_id}/comments", response_model=CommentResponse, status_code=201)
async def add_comment(
    post_id: int,
    comment_in: CommentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Add a comment to a post."""
    post = await get_post(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    comment = Comment(
        post_id=post_id,
        user_id=current_user.user_id,
        content=comment_in.content,
        parent_comment_id=comment_in.parent_comment_id,
    )
    db.add(comment)

    # Increment comment count on post
    post.comments_count = (post.comments_count or 0) + 1

    # If it's a reply, increment reply count on parent
    if comment_in.parent_comment_id:
        parent_result = await db.execute(
            select(Comment).where(Comment.comment_id == comment_in.parent_comment_id)
        )
        parent = parent_result.scalar_one_or_none()
        if parent:
            parent.replies_count = (parent.replies_count or 0) + 1

    await db.commit()
    await db.refresh(comment)
    return comment


@router.get("/{post_id}/comments", response_model=List[CommentResponse])
async def get_comments(
    post_id: int,
    skip: int = 0,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get top-level comments for a post."""
    result = await db.execute(
        select(Comment)
        .options(selectinload(Comment.user), selectinload(Comment.replies).selectinload(Comment.user))
        .where(and_(Comment.post_id == post_id, Comment.parent_comment_id == None))
        .order_by(Comment.created_at.asc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


@router.put("/{post_id}/comments/{comment_id}", response_model=CommentResponse)
async def update_comment(
    post_id: int,
    comment_id: int,
    comment_in: CommentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a comment (owner only)."""
    result = await db.execute(
        select(Comment).options(selectinload(Comment.user)).where(Comment.comment_id == comment_id)
    )
    comment = result.scalar_one_or_none()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    if comment.user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    comment.content = comment_in.content
    await db.commit()
    await db.refresh(comment)
    return comment


@router.delete("/{post_id}/comments/{comment_id}", status_code=204)
async def delete_comment(
    post_id: int,
    comment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a comment (owner only)."""
    result = await db.execute(
        select(Comment).where(Comment.comment_id == comment_id)
    )
    comment = result.scalar_one_or_none()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    if comment.user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Decrement post comment count
    post = await get_post(db, post_id)
    if post and post.comments_count > 0:
        post.comments_count -= 1

    await db.delete(comment)
    await db.commit()


# ─── Save / Unsave ──────────────────────────────────────────────────────────

@router.post("/{post_id}/save", status_code=200)
async def save_post(
    post_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Save a post."""
    post = await get_post(db, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    existing = await db.execute(
        select(SavedPost).where(
            and_(SavedPost.user_id == current_user.user_id, SavedPost.post_id == post_id)
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Post already saved")

    saved = SavedPost(user_id=current_user.user_id, post_id=post_id)
    db.add(saved)
    await db.commit()
    return {"message": "Post saved"}


@router.delete("/{post_id}/save", status_code=204)
async def unsave_post(
    post_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Unsave a post."""
    existing = await db.execute(
        select(SavedPost).where(
            and_(SavedPost.user_id == current_user.user_id, SavedPost.post_id == post_id)
        )
    )
    saved = existing.scalar_one_or_none()
    if not saved:
        raise HTTPException(status_code=404, detail="Saved post not found")
    await db.delete(saved)
    await db.commit()


@router.get("/saved/me", response_model=List[PostResponse])
async def get_saved_posts(
    skip: int = 0,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all posts saved by current user."""
    result = await db.execute(
        select(Post)
        .options(selectinload(Post.user), selectinload(Post.media))
        .join(SavedPost, and_(SavedPost.post_id == Post.post_id, SavedPost.user_id == current_user.user_id))
        .order_by(SavedPost.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()


@router.get("/user/{user_id}", response_model=List[PostResponse])
async def get_user_posts(
    user_id: int,
    skip: int = 0,
    limit: int = 20,
    cursor: int = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all posts by a specific user."""
    query = (
        select(Post)
        .options(selectinload(Post.user), selectinload(Post.media))
        .where(Post.user_id == user_id)
    )
    if cursor:
        query = query.where(Post.post_id < cursor)
        
    query = query.order_by(Post.post_id.desc())
    if not cursor:
        query = query.offset(skip)
        
    query = query.limit(limit)
    
    result = await db.execute(query)
    return result.scalars().all()
