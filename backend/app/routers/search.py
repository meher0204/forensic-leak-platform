"""Global search across images, recipients, investigations, and copies."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import require_auth
from ..models import Image, LeakInvestigation, Recipient, User, WatermarkedCopy
from ..schemas import SearchResultItem, SearchResponse

router = APIRouter(prefix="/api/search", tags=["search"])


@router.get("", response_model=SearchResponse)
def search(
    q: str = Query("", min_length=1, max_length=100),
    user: User = Depends(require_auth),
    db: Session = Depends(get_db),
):
    pattern = f"%{q}%"

    image_query = db.query(Image).filter(Image.original_filename.ilike(pattern))
    if user.role != "admin":
        image_query = image_query.filter(Image.owner_id == user.id)
    images = image_query.order_by(Image.created_at.desc()).limit(5).all()

    recipient_query = db.query(Recipient).filter(
        or_(Recipient.name.ilike(pattern), Recipient.email.ilike(pattern))
    )
    if user.role != "admin":
        recipient_query = recipient_query.filter(Recipient.owner_id == user.id)
    recipients = recipient_query.order_by(Recipient.created_at.desc()).limit(5).all()

    inv_query = db.query(LeakInvestigation).filter(LeakInvestigation.leaked_filename.ilike(pattern))
    if user.role != "admin":
        inv_query = inv_query.filter(LeakInvestigation.owner_id == user.id)
    investigations = inv_query.order_by(LeakInvestigation.created_at.desc()).limit(5).all()

    copy_query = db.query(WatermarkedCopy).filter(WatermarkedCopy.watermark_id.ilike(pattern))
    if user.role != "admin":
        copy_query = copy_query.filter(WatermarkedCopy.owner_id == user.id)
    copies = copy_query.order_by(WatermarkedCopy.created_at.desc()).limit(5).all()

    results: list[SearchResultItem] = []

    for img in images:
        results.append(SearchResultItem(
            type="image",
            id=img.id,
            label=img.original_filename,
            subtitle=f"{img.mime_type} — {img.file_size // 1024} KB",
            url=f"/images/{img.id}/watermark",
        ))

    for r in recipients:
        results.append(SearchResultItem(
            type="recipient",
            id=r.id,
            label=r.name,
            subtitle=r.email,
            url="/recipients",
        ))

    for inv in investigations:
        results.append(SearchResultItem(
            type="investigation",
            id=inv.id,
            label=inv.leaked_filename,
            subtitle=f"Confidence: {inv.confidence:.0%}" if inv.match_found else "No match",
            url=f"/investigations/{inv.id}",
        ))

    for c in copies:
        image = db.query(Image).filter(Image.id == c.image_id).first()
        recipient = db.query(Recipient).filter(Recipient.id == c.recipient_id).first()
        results.append(SearchResultItem(
            type="copy",
            id=c.id,
            label=c.watermark_id,
            subtitle=f"{image.original_filename if image else '?'} → {recipient.name if recipient else '?'}",
            url="/copies",
        ))

    return SearchResponse(results=results)
