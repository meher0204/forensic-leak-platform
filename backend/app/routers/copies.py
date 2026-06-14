"""List watermarked copies with image and recipient details."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Image, Recipient, WatermarkedCopy
from ..schemas import WatermarkedCopyDetailResponse

router = APIRouter(prefix="/api/copies", tags=["copies"])


@router.get("", response_model=list[WatermarkedCopyDetailResponse])
def list_copies(db: Session = Depends(get_db)):
    """List all watermarked copies with image and recipient details."""
    copies = (
        db.query(WatermarkedCopy)
        .order_by(WatermarkedCopy.created_at.desc())
        .all()
    )
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
