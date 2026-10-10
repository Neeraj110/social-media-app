from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from typing import Optional
import hmac
import hashlib
import time
import uuid
import os
import aiofiles
from core.config import settings
from api.deps import get_current_user, get_current_user_optional
from models.user import User

router = APIRouter(prefix="/upload", tags=["Upload & Media"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "static", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.get("/imagekit-auth")
async def get_imagekit_auth_parameters(
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Generate authentication parameters for ImageKit client-side direct uploads.
    Includes token, expire timestamp, HMAC-SHA1 signature, and public key.
    """
    token = str(uuid.uuid4())
    expire = int(time.time()) + 1800  # 30 minutes validity

    private_key = (settings.IMAGEKIT_PRIVATE_KEY or "").strip()
    if private_key:
        message = (token + str(expire)).encode("utf-8")
        signature = hmac.new(private_key.encode("utf-8"), message, hashlib.sha1).hexdigest()
    else:
        # Development fallback / mock signature
        signature = f"mock_sig_{token[:8]}_{expire}"

    return {
        "token": token,
        "expire": expire,
        "signature": signature,
        "publicKey": (settings.IMAGEKIT_PUBLIC_KEY or "").strip(),
        "urlEndpoint": (settings.IMAGEKIT_URL_ENDPOINT or "").strip(),
    }


@router.post("/file")
async def upload_file(
    file: UploadFile = File(...),
    folder: Optional[str] = Form("posts"),
    current_user: Optional[User] = Depends(get_current_user_optional)
):
    """
    Direct server-side upload endpoint as fallback when client-side upload isn't possible.
    If ImageKit private key is present, uploads to ImageKit.
    Otherwise stores locally and returns accessible URL.
    """
    try:
        content = await file.read()
        file_ext = os.path.splitext(file.filename or "")[1] or ".jpg"
        unique_name = f"{uuid.uuid4().hex}{file_ext}"

        # If ImageKit credentials configured, attempt ImageKit server upload
        if settings.IMAGEKIT_PRIVATE_KEY and settings.IMAGEKIT_URL_ENDPOINT:
            try:
                from imagekitio import ImageKit
                ik = ImageKit(private_key=settings.IMAGEKIT_PRIVATE_KEY)
                upload_res = ik.files.upload(
                    file=content,
                    file_name=unique_name,
                    folder=f"/{folder}"
                )
                if hasattr(upload_res, "url"):
                    return {
                        "url": upload_res.url,
                        "fileId": getattr(upload_res, "file_id", unique_name),
                        "name": file.filename,
                        "size": len(content),
                        "provider": "imagekit"
                    }
            except Exception as ik_err:
                print(f"[ImageKit Server Upload Warning]: {ik_err}, falling back to local storage")

        # Local storage fallback
        dest_path = os.path.join(UPLOAD_DIR, unique_name)
        async with aiofiles.open(dest_path, "wb") as f:
            await f.write(content)

        local_url = f"/uploads/{unique_name}"
        return {
            "url": local_url,
            "fileId": unique_name,
            "name": file.filename,
            "size": len(content),
            "provider": "local"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process media upload: {str(e)}"
        )
