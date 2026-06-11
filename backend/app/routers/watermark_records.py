"""Watermark record audit log.

Each row tracks one watermark generation operation:
who (recipient), what (image), which algorithm, success/fail,
and how long it took.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import WatermarkRecord
from ..schemas import WatermarkRecordResponse

router = APIRouter(prefix="/api/watermark-records", tags=["watermark-records"])


@router.get("", response_model=list[WatermarkRecordResponse])
def list_records(db: Session = Depends(get_db)):
    """List all watermark audit records, newest first.

    This provides a full audit trail of every watermarking
    operation — who received what, when, and using which
    algorithm.
    """
    return (
        db.query(WatermarkRecord)
        .order_by(WatermarkRecord.created_at.desc())
        .all()
    )


@router.get("/by-recipient/{recipient_id}", response_model=list[WatermarkRecordResponse])
def records_by_recipient(recipient_id: int, db: Session = Depends(get_db)):
    """Get all watermark records for a specific recipient."""
    return (
        db.query(WatermarkRecord)
        .filter(WatermarkRecord.recipient_id == recipient_id)
        .order_by(WatermarkRecord.created_at.desc())
        .all()
    )
