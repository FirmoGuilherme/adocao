from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Header
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from .. import models, schemas
from ..file_storage import FileStorageService

router = APIRouter(prefix="/pets", tags=["pet-media"])

ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "video/mp4",
    "video/webm",
}

IMAGE_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
VIDEO_CONTENT_TYPES = {"video/mp4", "video/webm"}

MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10 MB
MAX_VIDEO_SIZE = 100 * 1024 * 1024  # 100 MB
MAX_MEDIA_PER_PET = 20


def get_file_storage() -> FileStorageService:
    return FileStorageService()


def get_pet_or_404(pet_id: int, db: Session) -> models.Pet:
    pet = db.query(models.Pet).filter(models.Pet.id == pet_id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    return pet


def verify_caretaker_authorization(pet: models.Pet, x_shelter_name: Optional[str]) -> None:
    """Verify the requesting shelter is authorized to manage this pet's media."""
    if not x_shelter_name or x_shelter_name != pet.shelter_name:
        raise HTTPException(
            status_code=403,
            detail="You are not authorized to manage media for this pet",
        )


@router.post("/{pet_id}/media", response_model=schemas.PetMediaResponse, status_code=201)
async def upload_pet_media(
    pet_id: int,
    file: Optional[UploadFile] = File(default=None),
    x_shelter_name: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
    storage: FileStorageService = Depends(get_file_storage),
):
    """Upload a media file for a pet."""
    pet = get_pet_or_404(pet_id, db)
    verify_caretaker_authorization(pet, x_shelter_name)

    # Check if file field was provided
    if file is None:
        raise HTTPException(status_code=422, detail="File field is required")

    # Validate content-type
    content_type = file.content_type or ""
    if content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=415,
            detail="Unsupported media type. Accepted: image/jpeg, image/png, image/webp, video/mp4, video/webm",
        )

    # Read file content to validate size and emptiness
    file_content = await file.read()
    file_size = len(file_content)

    # Check empty file
    if file_size == 0:
        raise HTTPException(status_code=422, detail="File is empty")

    # Validate file size based on type
    if content_type in IMAGE_CONTENT_TYPES:
        if file_size > MAX_IMAGE_SIZE:
            raise HTTPException(
                status_code=413,
                detail="Image file size exceeds 10 MB limit",
            )
    elif content_type in VIDEO_CONTENT_TYPES:
        if file_size > MAX_VIDEO_SIZE:
            raise HTTPException(
                status_code=413,
                detail="Video file size exceeds 100 MB limit",
            )

    # Check media count limit
    media_count = db.query(models.PetMedia).filter(
        models.PetMedia.pet_id == pet_id
    ).count()
    if media_count >= MAX_MEDIA_PER_PET:
        raise HTTPException(
            status_code=409,
            detail="Maximum of 20 media files reached for this pet",
        )

    # Reset file position after reading for size check
    await file.seek(0)

    # Save file via storage service
    relative_path = storage.save_file(pet_id, file)
    url = storage.get_url(relative_path)

    # Determine media type
    media_type = "photo" if content_type in IMAGE_CONTENT_TYPES else "video"

    # Create database record
    db_media = models.PetMedia(
        pet_id=pet_id,
        media_type=media_type,
        file_name=file.filename or "",
        file_path=relative_path,
        url=url,
        file_size_bytes=file_size,
    )
    db.add(db_media)
    db.commit()
    db.refresh(db_media)

    return db_media


@router.get("/{pet_id}/media", response_model=List[schemas.PetMediaResponse])
def list_pet_media(
    pet_id: int,
    db: Session = Depends(get_db),
):
    """List all media for a pet, ordered by uploaded_at descending."""
    get_pet_or_404(pet_id, db)

    media_list = (
        db.query(models.PetMedia)
        .filter(models.PetMedia.pet_id == pet_id)
        .order_by(models.PetMedia.uploaded_at.desc())
        .all()
    )
    return media_list


@router.delete("/{pet_id}/media/{media_id}", status_code=204)
def delete_pet_media(
    pet_id: int,
    media_id: int,
    x_shelter_name: Optional[str] = Header(default=None),
    db: Session = Depends(get_db),
    storage: FileStorageService = Depends(get_file_storage),
):
    """Delete a specific media file for a pet."""
    pet = get_pet_or_404(pet_id, db)
    verify_caretaker_authorization(pet, x_shelter_name)

    media = (
        db.query(models.PetMedia)
        .filter(models.PetMedia.id == media_id, models.PetMedia.pet_id == pet_id)
        .first()
    )
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")

    # Delete file from filesystem
    storage.delete_file(media.file_path)

    # Delete record from database
    db.delete(media)
    db.commit()

    return None
