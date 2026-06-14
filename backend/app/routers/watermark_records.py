"""Watermark record audit log.

Each row tracks one watermark generation operation:
who (recipient), what (image), which algorithm, success/fail,
and how long it took.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import require_auth
from ..models import User, WatermarkRecord
from ..schemas import WatermarkRecordResponse

router = APIRouter(prefix="/api/watermark-records", tags=["watermark-records"])


@router.get("", response_model=list[WatermarkRecordResponse])
def list_records(user: User = Depends(require_auth), db: Session = Depends(get_db)):
    """List all watermark audit records, newest first."""
    query = db.query(WatermarkRecord)
    if user.role != "admin":
        query = query.filter(WatermarkRecord.owner_id == user.id)
    return query.order_by(WatermarkRecord.created_at.desc()).all()


@router.get("/by-recipient/{recipient_id}", response_model=list[WatermarkRecordResponse])
def records_by_recipient(recipient_id: int, user: User = Depends(require_auth), db: Session = Depends(get_db)):
    """Get all watermark records for a specific recipient."""
    query = db.query(WatermarkRecord).filter(WatermarkRecord.recipient_id == recipient_id)
    if user.role != "admin":
        query = query.filter(WatermarkRecord.owner_id == user.id)
    return query.order_by(WatermarkRecord.created_at.desc()).all()
