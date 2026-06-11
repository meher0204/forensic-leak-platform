import uuid
from pathlib import Path

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import LeakInvestigation
from ..schemas import DetectionResponse
from ..services import detection as detect_svc

EVIDENCE_DIR = (
    Path(__file__).resolve().parent.parent.parent.parent / "uploads" / "evidence"
)

router = APIRouter(prefix="/api/detect", tags=["detection"])


@router.post("", response_model=DetectionResponse)
async def detect_leak(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Upload a suspected leaked image and identify the source.

    Accepts any image format (PNG, JPEG, WEBP). The system:
      1. Saves the leaked image as evidence
      2. Extracts the forensic watermark
      3. Looks up the corresponding recipient
      4. Creates an investigation record
      5. Returns a confidence score and match details

    Returns 200 even if no match is found — check `match_found`.
    """
    if not file.filename:
        raise HTTPException(400, detail="No filename provided.")

    contents = await file.read()

    if len(contents) == 0:
        raise HTTPException(400, detail="File is empty.")

    # Save leaked image as evidence
    EVIDENCE_DIR.mkdir(parents=True, exist_ok=True)
    evidence_filename = f"{uuid.uuid4().hex}.png"
    evidence_path = EVIDENCE_DIR / evidence_filename
    evidence_path.write_bytes(contents)

    # Run detection
    result = detect_svc.analyze(contents, db)

    # Create investigation record
    inv = LeakInvestigation(
        leaked_filename=file.filename or "unknown.png",
        storage_path=evidence_filename,
        detected_watermark_id=(
            result["top_match"]["watermark_id"] if result.get("top_match") else None
        ),
        match_found=result["match_found"],
        confidence=result["confidence"],
        matched_recipient_id=(
            result["top_match"]["recipient_id"] if result.get("top_match") else None
        ),
        matched_image_id=(
            result["top_match"]["image_id"] if result.get("top_match") else None
        ),
        possible_tampering=result["possible_tampering"],
        image_width=result["image_info"]["width"],
        image_height=result["image_info"]["height"],
        file_size=result["image_info"]["file_size"],
        notes=(
            "Possible tampering detected — image may have been cropped or edited"
            if result["possible_tampering"]
            else None
        ),
    )
    db.add(inv)
    db.commit()
    db.refresh(inv)

    result["investigation_id"] = inv.id
    return result
