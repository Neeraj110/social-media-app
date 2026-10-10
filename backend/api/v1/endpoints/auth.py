from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from pydantic import BaseModel
from db.session import get_db
from schemas.user import UserCreate, UserResponse, Token
from crud.user import (
    get_user_by_email,
    get_user_by_username,
    get_user_by_google_id,
    create_user,
    create_google_user,
)
from core.security import verify_password, create_access_token
from core.config import settings

router = APIRouter(prefix="/auth", tags=["Auth"])


class GoogleTokenRequest(BaseModel):
    credential: str  # The Google ID token from the frontend



@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    """Register a new user."""
    # Check if email already exists
    existing_email = await get_user_by_email(db, user_in.email)
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Check if username already exists
    existing_username = await get_user_by_username(db, user_in.username)
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )

    user = await create_user(db, user_in)
    return user


@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db)
):
    """Login and get access token. Use email as username field."""
    user = await get_user_by_email(db, form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"}
        )

    if user.user_status.value != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is not active"
        )

    access_token = create_access_token(data={"sub": str(user.user_id)})
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/google", response_model=Token)
async def google_auth(body: GoogleTokenRequest, db: AsyncSession = Depends(get_db)):
    """Authenticate with Google ID token. Creates account on first login."""
    try:
        idinfo = id_token.verify_oauth2_token(
            body.credential,
            google_requests.Request(),
            settings.GOOGLE_CLIENT_ID,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid Google token: {e}",
        )

    google_id: str = idinfo["sub"]
    email: str = idinfo.get("email", "")
    full_name: str = idinfo.get("name", "")
    picture: str | None = idinfo.get("picture")

    # 1. Try to find user by google_id first
    user = await get_user_by_google_id(db, google_id)

    if not user:
        # 2. Try to link to an existing account with the same email
        user = await get_user_by_email(db, email)
        if user:
            # Link google_id to existing account
            user.google_id = google_id
            if picture and not user.profile_image_url:
                user.profile_image_url = picture
            await db.commit()
            await db.refresh(user)
        else:
            # 3. Brand new user — create account
            base_username = email.split("@")[0].lower().replace(".", "_")[:40]
            username = base_username
            suffix = 1
            while await get_user_by_username(db, username):
                username = f"{base_username}_{suffix}"
                suffix += 1

            user = await create_google_user(
                db,
                google_id=google_id,
                email=email,
                full_name=full_name,
                profile_image_url=picture,
                username=username,
            )

    if user.user_status.value != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is suspended.",
        )

    access_token = create_access_token(data={"sub": str(user.user_id)})
    return {"access_token": access_token, "token_type": "bearer"}

