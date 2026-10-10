from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from models.post import Post, PostMedia
from schemas.post import PostCreate, PostUpdate


async def create_post(db: AsyncSession, user_id: int, post_in: PostCreate) -> Post:
    db_post = Post(
        user_id=user_id,
        content=post_in.content,
        post_visibility=post_in.post_visibility,
    )
    db.add(db_post)
    await db.commit()
    if post_in.media:
        for media in post_in.media:
            db_post_media = PostMedia(
                post_id=db_post.post_id,
                media_type=media.media_type,
                media_url=media.media_url,
                position=media.position,
            )
            db.add(db_post_media)
    await db.commit()
    await db.refresh(db_post)
    return db_post


async def get_post(db: AsyncSession, post_id: int) -> Post | None:
    result = await db.execute(
        select(Post)
        .options(selectinload(Post.media), selectinload(Post.user))
        .where(Post.post_id == post_id)
    )
    return result.scalar_one_or_none()


async def get_posts(db: AsyncSession, skip: int = 0, limit: int = 20, cursor: int | None = None):
    query = select(Post).options(selectinload(Post.media), selectinload(Post.user))
    
    if cursor:
        query = query.where(Post.post_id < cursor)
        
    query = query.order_by(Post.post_id.desc())
    if not cursor:
        query = query.offset(skip)
        
    query = query.limit(limit)
    
    result = await db.execute(query)
    return result.scalars().all()


async def update_post(db: AsyncSession, post: Post, post_in: PostUpdate) -> Post:
    update_data = post_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field != "media" and hasattr(post, field):
            setattr(post, field, value)
    await db.commit()
    await db.refresh(post)
    return post


async def delete_post(db: AsyncSession, post: Post):
    await db.delete(post)
    await db.commit()
