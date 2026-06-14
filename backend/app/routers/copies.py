"""List watermarked copies with image and recipient details."""

from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import require_auth
from ..models import Image, Recipient, User, WatermarkedCopy, WatermarkRecord
from ..schemas import WatermarkedCopyDetailResponse

WATERMARKED_DIR = (
    Path(__file__).resolve().parent.parent.parent.parent / "uploads" / "watermarked"
)

router = APIRouter(prefix="/api/copies", tags=["copies"])


@router.get("", response_model=list[WatermarkedCopyDetailResponse])
def list_copies(user: User = Depends(require_auth), db: Session = Depends(get_db)):
    """List all watermarked copies with image and recipient details."""
    query = db.query(WatermarkedCopy)
    if user.role != "admin":
        query = query.filter(WatermarkedCopy.owner_id == user.id)
    copies = query.order_by(WatermarkedCopy.created_at.desc()).all()
    result = []
    for c in copies:
        image = db.query(Image).filter(Image.id == c.image_id).first()
        recipient = db.query(Recipient).filter(Recipient.id == c.recipient_id).first()
        result.append(WatermarkedCopyDetailResponse(
            id=c.id,
            image_id=c.image_id,
            image_filename=image.original_filename if image else "Unknown",
            recipient_id=c.recipient_id,
            recipient_name=recipient.name if recipient else "Unknown",
            recipient_email=recipient.email if recipient else "",
            watermark_id=c.watermark_id,
            created_at=c.created_at,
        ))
    return result


@router.get("/{copy_id}/download")
def download_copy(copy_id: int, user: User = Depends(require_auth), db: Session = Depends(get_db)):
    """Download a watermarked copy."""
    copy = db.query(WatermarkedCopy).filter(WatermarkedCopy.id == copy_id).first()
    if not copy:
        raise HTTPException(404, detail="Copy not found")
    if user.role != "admin" and copy.owner_id != user.id:
        raise HTTPException(403, detail="Access denied")

    path = WATERMARKED_DIR / copy.storage_path
    if not path.exists():
        raise HTTPException(404, detail="File not found on disk")

    original = db.query(Image).filter(Image.id == copy.image_id).first()
    download_name = f"watermarked_{copy.recipient_id}_{original.original_filename}"

    return FileResponse(path=path, filename=download_name, media_type="image/png")


@router.delete("/{copy_id}")
def delete_copy(copy_id: int, user: User = Depends(require_auth), db: Session = Depends(get_db)):
    query = db.query(WatermarkedCopy).filter(WatermarkedCopy.id == copy_id)
    if user.role != "admin":
        query = query.filter(WatermarkedCopy.owner_id == user.id)
    copy = query.first()
    if not copy:
        raise HTTPException(404, detail="Copy not found")

    path = WATERMARKED_DIR / copy.storage_path
    if path.exists():
        path.unlink()

    db.delete(copy)
    db.commit()
    return {"success": True}
