"""Admin operations — reset demo data, etc."""

import shutil
from pathlib import Path

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Image, Recipient, WatermarkedCopy, WatermarkRecord, LeakInvestigation

router = APIRouter(prefix="/api/admin", tags=["admin"])

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
UPLOAD_DIRS = [
    BASE_DIR / "uploads" / "originals",
    BASE_DIR / "uploads" / "watermarked",
    BASE_DIR / "uploads" / "evidence",
]


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
