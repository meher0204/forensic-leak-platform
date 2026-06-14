"""Admin operations — reset demo data, overview stats, etc."""

import shutil
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import require_admin
from ..models import User, Image, Recipient, WatermarkedCopy, WatermarkRecord, LeakInvestigation
from ..schemas import (
    AdminOverviewResponse,
    AdminUserResponse,
    UserActivityResponse,
    UserRoleUpdate,
    UserStatusUpdate,
)

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


@router.get("/users", response_model=list[AdminUserResponse])
def list_users(_admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    """Return all users. Admin-only."""
    users = db.query(User).order_by(User.created_at.desc()).all()
    return users


@router.patch("/users/{user_id}/role", response_model=AdminUserResponse)
def update_user_role(
    user_id: int,
    body: UserRoleUpdate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Promote a user to admin, or demote to investigator. Admin-only."""

    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(404, detail="User not found")

    if body.role == target.role:
        raise HTTPException(400, detail=f"User already has role '{target.role}'")

    if body.role == "investigator" and target.role == "admin":
        admin_count = db.query(User).filter(User.role == "admin").count()
        if admin_count <= 1:
            raise HTTPException(400, detail="Cannot demote the last remaining admin")

    target.role = body.role
    db.commit()
    db.refresh(target)
    return target


@router.patch("/users/{user_id}/status", response_model=AdminUserResponse)
def update_user_status(
    user_id: int,
    body: UserStatusUpdate,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Activate or deactivate a user. Admin-only.
    Prevents deactivating the last active admin."""

    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(404, detail="User not found")

    if body.is_active == target.is_active:
        raise HTTPException(400, detail=f"User already {'active' if body.is_active else 'inactive'}")

    if not body.is_active and target.role == "admin":
        admin_count = db.query(User).filter(User.role == "admin", User.is_active == True).count()
        if admin_count <= 1:
            raise HTTPException(400, detail="Cannot deactivate the last active admin")

    target.is_active = body.is_active
    db.commit()
    db.refresh(target)
    return target


@router.get("/users/{user_id}/activity", response_model=UserActivityResponse)
def get_user_activity(
    user_id: int,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Show a user's contribution counts and recent items. Admin-only."""
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(404, detail="User not found")

    images = db.query(Image).filter(Image.owner_id == user_id).count()
    recipients = db.query(Recipient).filter(Recipient.owner_id == user_id).count()
    copies = db.query(WatermarkedCopy).filter(WatermarkedCopy.owner_id == user_id).count()
    investigations = db.query(LeakInvestigation).filter(LeakInvestigation.owner_id == user_id).count()

    recent = (
        db.query(LeakInvestigation)
        .filter(LeakInvestigation.owner_id == user_id)
        .order_by(LeakInvestigation.created_at.desc())
        .limit(5)
        .all()
    )
    recent_items = []
    for inv in recent:
        label = inv.case_id or f"INV-{inv.id:04d}"
        status = "match" if inv.match_found else "no match"
        recent_items.append(f"{label} ({status})")

    return UserActivityResponse(
        images_count=images,
        recipients_count=recipients,
        copies_count=copies,
        investigations_count=investigations,
        recent_items=recent_items,
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
