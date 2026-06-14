from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import require_auth
from ..models import Recipient, User, WatermarkedCopy, WatermarkRecord
from ..schemas import RecipientCreate, RecipientUpdate, RecipientResponse

router = APIRouter(prefix="/api/recipients", tags=["recipients"])


@router.post("", response_model=RecipientResponse, status_code=201)
def create_recipient(
    body: RecipientCreate,
    user: User = Depends(require_auth),
    db: Session = Depends(get_db),
):
    recipient = Recipient(name=body.name, email=body.email, notes=body.notes, owner_id=user.id)
    db.add(recipient)
    db.commit()
    db.refresh(recipient)
    return recipient


@router.get("", response_model=list[RecipientResponse])
def list_recipients(user: User = Depends(require_auth), db: Session = Depends(get_db)):
    query = db.query(Recipient)
    if user.role != "admin":
        query = query.filter(Recipient.owner_id == user.id)
    return query.order_by(Recipient.created_at.desc()).all()


@router.get("/{recipient_id}", response_model=RecipientResponse)
def get_recipient(recipient_id: int, user: User = Depends(require_auth), db: Session = Depends(get_db)):
    query = db.query(Recipient).filter(Recipient.id == recipient_id)
    if user.role != "admin":
        query = query.filter(Recipient.owner_id == user.id)
    recipient = query.first()
    if not recipient:
        raise HTTPException(404, detail="Recipient not found")
    return recipient


@router.put("/{recipient_id}", response_model=RecipientResponse)
def update_recipient(
    recipient_id: int,
    body: RecipientUpdate,
    user: User = Depends(require_auth),
    db: Session = Depends(get_db),
):
    query = db.query(Recipient).filter(Recipient.id == recipient_id)
    if user.role != "admin":
        query = query.filter(Recipient.owner_id == user.id)
    recipient = query.first()
    if not recipient:
        raise HTTPException(404, detail="Recipient not found")

    if body.name is not None:
        recipient.name = body.name
    if body.email is not None:
        recipient.email = body.email
    if body.notes is not None:
        recipient.notes = body.notes

    db.commit()
    db.refresh(recipient)
    return recipient


@router.delete("/{recipient_id}")
def delete_recipient(recipient_id: int, user: User = Depends(require_auth), db: Session = Depends(get_db)):
    query = db.query(Recipient).filter(Recipient.id == recipient_id)
    if user.role != "admin":
        query = query.filter(Recipient.owner_id == user.id)
    recipient = query.first()
    if not recipient:
        raise HTTPException(404, detail="Recipient not found")

    # Prevent deletion if watermarked copies exist (FK constraint).
    # The recipient must be disassociated from all copies first.
    copy_count = (
        db.query(WatermarkedCopy)
        .filter(WatermarkedCopy.recipient_id == recipient_id)
        .count()
    )
    if copy_count > 0:
        raise HTTPException(
            409,
            detail=(
                f"Cannot delete — {copy_count} watermarked cop{copy_count == 1 and 'y' or 'ies'} "
                f"still reference this recipient. Delete the copies first."
            ),
        )

    record_count = (
        db.query(WatermarkRecord)
        .filter(WatermarkRecord.recipient_id == recipient_id)
        .count()
    )
    if record_count > 0:
        raise HTTPException(
            409,
            detail=(
                f"Cannot delete — {record_count} watermark record{record_count == 1 and '' or 's'} "
                f"still reference this recipient."
            ),
        )

    db.delete(recipient)
    db.commit()
    return {"success": True}
