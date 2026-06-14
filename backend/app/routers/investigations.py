"""Leak investigation history with enriched detail endpoint.

Stores every detection analysis result so users can review
past investigations, track repeat offenders, and maintain
an evidence trail.
"""

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from pathlib import Path
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import require_auth
from ..models import LeakInvestigation, Image, Recipient, User, WatermarkedCopy
from ..schemas import InvestigationResponse, InvestigationDetailResponse

EVIDENCE_DIR = (
    Path(__file__).resolve().parent.parent.parent.parent / "uploads" / "evidence"
)

router = APIRouter(prefix="/api/investigations", tags=["investigations"])


@router.get("", response_model=list[InvestigationResponse])
def list_investigations(user: User = Depends(require_auth), db: Session = Depends(get_db)):
    """List all leak investigations, newest first."""
    query = db.query(LeakInvestigation)
    if user.role != "admin":
        query = query.filter(LeakInvestigation.owner_id == user.id)
    return query.order_by(LeakInvestigation.created_at.desc()).all()


@router.get("/{investigation_id}", response_model=InvestigationResponse)
def get_investigation(investigation_id: int, user: User = Depends(require_auth), db: Session = Depends(get_db)):
    """Get a single investigation by ID."""
    query = db.query(LeakInvestigation).filter(LeakInvestigation.id == investigation_id)
    if user.role != "admin":
        query = query.filter(LeakInvestigation.owner_id == user.id)
    inv = query.first()
    if not inv:
        raise HTTPException(404, detail="Investigation not found")
    return inv


@router.get("/{investigation_id}/detail", response_model=InvestigationDetailResponse)
def get_investigation_detail(investigation_id: int, user: User = Depends(require_auth), db: Session = Depends(get_db)):
    """Get enriched investigation with joined names and timestamps."""
    query = db.query(LeakInvestigation).filter(LeakInvestigation.id == investigation_id)
    if user.role != "admin":
        query = query.filter(LeakInvestigation.owner_id == user.id)
    inv = query.first()
    if not inv:
        raise HTTPException(404, detail="Investigation not found")

    investigator_name = None
    if inv.owner_id:
        owner = db.query(User).filter(User.id == inv.owner_id).first()
        if owner:
            investigator_name = owner.username

    data = {
        "id": inv.id,
        "case_id": inv.case_id,
        "leaked_filename": inv.leaked_filename,
        "detected_watermark_id": inv.detected_watermark_id,
        "match_found": inv.match_found,
        "confidence": inv.confidence,
        "matched_recipient_id": inv.matched_recipient_id,
        "matched_image_id": inv.matched_image_id,
        "possible_tampering": inv.possible_tampering,
        "image_width": inv.image_width,
        "image_height": inv.image_height,
        "file_size": inv.file_size,
        "notes": inv.notes,
        "created_at": inv.created_at,
        "recipient_name": None,
        "recipient_email": None,
        "image_filename": None,
        "image_created_at": None,
        "watermark_created_at": None,
        "evidence_url": None,
        "investigator": investigator_name,
    }

    if inv.matched_recipient_id:
        recipient = (
            db.query(Recipient)
            .filter(Recipient.id == inv.matched_recipient_id)
            .first()
        )
        if recipient:
            data["recipient_name"] = recipient.name
            data["recipient_email"] = recipient.email

    if inv.matched_image_id:
        image = (
            db.query(Image).filter(Image.id == inv.matched_image_id).first()
        )
        if image:
            data["image_filename"] = image.original_filename
            data["image_created_at"] = image.created_at

    if inv.detected_watermark_id:
        copy = (
            db.query(WatermarkedCopy)
            .filter(WatermarkedCopy.watermark_id == inv.detected_watermark_id)
            .first()
        )
        if copy:
            data["watermark_created_at"] = copy.created_at

    if inv.storage_path:
        evidence_path = EVIDENCE_DIR / inv.storage_path
        if evidence_path.exists():
            data["evidence_url"] = f"/api/investigations/{investigation_id}/evidence"

    return data


@router.get("/{investigation_id}/evidence")
def get_evidence(investigation_id: int, user: User = Depends(require_auth), db: Session = Depends(get_db)):
    """Serve the leaked image stored as evidence for an investigation."""
    inv = db.query(LeakInvestigation).filter(LeakInvestigation.id == investigation_id).first()
    if not inv or not inv.storage_path:
        raise HTTPException(404, detail="No evidence file found")
    if user.role != "admin" and inv.owner_id != user.id:
        raise HTTPException(403, detail="Access denied")

    evidence_path = EVIDENCE_DIR / inv.storage_path
    if not evidence_path.exists():
        raise HTTPException(404, detail="Evidence file not found on disk")

    return FileResponse(evidence_path, media_type="image/png")


@router.delete("/{investigation_id}")
def delete_investigation(investigation_id: int, user: User = Depends(require_auth), db: Session = Depends(get_db)):
    """Delete an investigation and its evidence file."""
    query = db.query(LeakInvestigation).filter(LeakInvestigation.id == investigation_id)
    if user.role != "admin":
        query = query.filter(LeakInvestigation.owner_id == user.id)
    inv = query.first()
    if not inv:
        raise HTTPException(404, detail="Investigation not found")

    if inv.storage_path:
        evidence_path = EVIDENCE_DIR / inv.storage_path
        if evidence_path.exists():
            evidence_path.unlink()

    db.delete(inv)
    db.commit()
    return {"success": True}
