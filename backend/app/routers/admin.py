"""Admin operations — reset demo data, overview stats, etc."""

import shutil
from pathlib import Path

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import require_admin
from ..models import User, Image, Recipient, WatermarkedCopy, WatermarkRecord, LeakInvestigation
from ..schemas import AdminOverviewResponse

router = APIRouter(prefix="/api/admin", tags=["admin"])

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
UPLOAD_DIRS = [
    BASE_DIR / "uploads" / "originals",
    BASE_DIR / "uploads" / "watermarked",
    BASE_DIR / "uploads" / "evidence",
]


@router.get("/overview", response_model=AdminOverviewResponse)
def overview(_admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    """Return system-wide counts. Admin-only."""
    total_leaks_matched = (
        db.query(LeakInvestigation).filter(LeakInvestigation.match_found == True).count()
    )
    return AdminOverviewResponse(
        total_users=db.query(User).count(),
        total_images=db.query(Image).count(),
        total_recipients=db.query(Recipient).count(),
        total_watermarked_copies=db.query(WatermarkedCopy).count(),
        total_investigations=db.query(LeakInvestigation).count(),
        total_leaks_matched=total_leaks_matched,
    )


@router.post("/reset")
def reset_demo_data(db: Session = Depends(get_db)):
    """Delete all demo data: images, recipients, watermarked copies,
    watermark records, and investigations.  Preserves user accounts
    and active sessions."""

    db.query(WatermarkedCopy).delete()
    db.query(WatermarkRecord).delete()
    db.query(LeakInvestigation).delete()
    db.query(Image).delete()
    db.query(Recipient).delete()

    db.commit()

    for d in UPLOAD_DIRS:
        if d.exists():
            shutil.rmtree(d)
            d.mkdir(parents=True, exist_ok=True)

    return {"success": True, "message": "Demo data reset successfully"}
