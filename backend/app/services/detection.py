"""
Leak detection service.

Orchestrates the full detection pipeline:
  1. Save leaked image bytes to a temporary file
  2. Extract watermark with confidence analysis
  3. Look up the watermark ID in the database
  4. Join with recipients to get names
  5. Return a ranked result with confidence scores
"""

import tempfile
import uuid
from pathlib import Path

from PIL import Image as PILImage
from sqlalchemy.orm import Session

from . import watermark as wm
from ..models import WatermarkedCopy, Recipient


def analyze(image_bytes: bytes, db: Session) -> dict:
    """Analyze leaked image bytes and identify the likely source.

    Steps:
      1. Write bytes to a temp file (so Pillow can open it)
      2. Run watermark extraction with confidence analysis
      3. If a watermark ID is found, query the database for the
         corresponding recipient
      4. Build the response with match details and image metadata

    Args:
        image_bytes: Raw bytes of the leaked image (PNG/JPEG).
        db: SQLAlchemy database session.

    Returns:
        {
            "match_found": bool,
            "confidence": float,
            "top_match": { recipient_id, recipient_name,
                           confidence, watermark_id } | None,
            "all_matches": [ same shape, sorted by confidence ],
            "possible_tampering": bool,
            "image_info": { width, height, file_size, format },
        }
    """
    tmp_dir = Path(tempfile.gettempdir()) / "forensic_detection"
    tmp_dir.mkdir(parents=True, exist_ok=True)
    tmp_path = tmp_dir / f"{uuid.uuid4().hex}.png"
    tmp_path.write_bytes(image_bytes)

    try:
        try:
            analysis = wm.extract_with_analysis(tmp_path)
        except Exception:
            return {
                "match_found": False,
                "confidence": 0.0,
                "top_match": None,
                "all_matches": [],
                "possible_tampering": False,
                "image_info": {
                    "width": 0,
                    "height": 0,
                    "file_size": len(image_bytes),
                    "format": "unknown",
                },
            }

        watermark_id: str | None = analysis["watermark_id"]
        confidence: float = analysis["confidence"]

        match_found = False
        top_match = None
        all_matches: list[dict] = []

        if watermark_id:
            copy: WatermarkedCopy | None = (
                db.query(WatermarkedCopy)
                .filter(WatermarkedCopy.watermark_id == watermark_id)
                .first()
            )

            if copy:
                recipient: Recipient | None = (
                    db.query(Recipient)
                    .filter(Recipient.id == copy.recipient_id)
                    .first()
                )

                if recipient:
                    match_found = True
                    match = {
                        "recipient_id": recipient.id,
                        "recipient_name": recipient.name,
                        "confidence": confidence,
                        "watermark_id": watermark_id,
                        "image_id": copy.image_id,
                        "created_at": copy.created_at.isoformat(),
                    }
                    top_match = match
                    all_matches.append(match)

        # If the top match didn't pan out, also check secondary candidates
        # from the analysis (e.g. if multiple IDs were found due to noise)
        if not match_found:
            candidates = analysis.get("details", {}).get("candidates", {})
            for cid in candidates:
                if cid == watermark_id:
                    continue
                ccopy = (
                    db.query(WatermarkedCopy)
                    .filter(WatermarkedCopy.watermark_id == cid)
                    .first()
                )
                if ccopy:
                    crecipient = (
                        db.query(Recipient)
                        .filter(Recipient.id == ccopy.recipient_id)
                        .first()
                    )
                    if crecipient:
                        all_matches.append({
                            "recipient_id": crecipient.id,
                            "recipient_name": crecipient.name,
                            "confidence": 0.0,
                            "watermark_id": cid,
                            "image_id": ccopy.image_id,
                            "created_at": ccopy.created_at.isoformat(),
                        })

        all_matches.sort(key=lambda m: m["confidence"], reverse=True)

        # Get image metadata (read before close)
        try:
            pil_img = PILImage.open(tmp_path)
            iw, ih = pil_img.size
            ifmt = pil_img.format or "PNG"
            pil_img.close()
        except Exception:
            iw, ih, ifmt = 0, 0, "unknown"

        return {
            "match_found": match_found,
            "confidence": confidence,
            "top_match": top_match,
            "all_matches": all_matches[:10],
            "possible_tampering": match_found and confidence < 1.0,
            "image_info": {
                "width": iw,
                "height": ih,
                "file_size": len(image_bytes),
                "format": ifmt,
            },
        }

    finally:
        if tmp_path.exists():
            tmp_path.unlink()