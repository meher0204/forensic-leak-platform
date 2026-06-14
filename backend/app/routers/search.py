"""Global search across images, recipients, investigations, and copies."""

from fastapi import APIRouter, Depends, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Image, Recipient, LeakInvestigation, WatermarkedCopy
from ..schemas import SearchResultItem, SearchResponse

router = APIRouter(prefix="/api/search", tags=["search"])


@router.get("", response_model=SearchResponse)
def search(q: str = Query("", min_length=1, max_length=100), db: Session = Depends(get_db)):
    pattern = f"%{q}%"

    images = (
        db.query(Image)
        .filter(Image.original_filename.ilike(pattern))
        .order_by(Image.created_at.desc())
        .limit(5)
        .all()
    )

    recipients = (
        db.query(Recipient)
        .filter(or_(Recipient.name.ilike(pattern), Recipient.email.ilike(pattern)))
        .order_by(Recipient.created_at.desc())
        .limit(5)
        .all()
    )

    investigations = (
        db.query(LeakInvestigation)
        .filter(LeakInvestigation.leaked_filename.ilike(pattern))
        .order_by(LeakInvestigation.created_at.desc())
        .limit(5)
        .all()
    )

    copies = (
        db.query(WatermarkedCopy)
        .filter(WatermarkedCopy.watermark_id.ilike(pattern))
        .order_by(WatermarkedCopy.created_at.desc())
        .limit(5)
        .all()
    )

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
