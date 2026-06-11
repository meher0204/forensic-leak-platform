from pathlib import Path

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Image, Recipient, WatermarkedCopy, WatermarkRecord
from ..schemas import ImageResponse, WatermarkRequest, WatermarkedCopyResponse
from ..storage import file_manager
from ..services import watermark as wm

router = APIRouter(prefix="/api/images", tags=["images"])

WATERMARKED_DIR = (
    Path(__file__).resolve().parent.parent.parent.parent / "uploads" / "watermarked"
)


# ── Upload ────────────────────────────────────────────────────────────

@router.post("/upload", response_model=ImageResponse, status_code=201)
async def upload_image(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename:
        raise HTTPException(400, detail="No filename provided.")

    mime = file.content_type or "application/octet-stream"
    contents = await file.read()

    # Layer 1: MIME type + size + magic byte check
    try:
        file_manager.validate(mime, len(contents), contents)
    except ValueError as e:
        raise HTTPException(400, detail=str(e))

    # Layer 2: Verify Pillow can decode the image
    try:
        file_manager.validate_can_open(contents)
    except ValueError as e:
        raise HTTPException(400, detail=str(e))

    filename = file_manager.save(contents, file.filename)

    image = Image(
        original_filename=file.filename,
        storage_path=filename,
        mime_type=mime,
        file_size=len(contents),
    )
    db.add(image)
    db.commit()
    db.refresh(image)

    return image


# ── List / Get ────────────────────────────────────────────────────────

@router.get("", response_model=list[ImageResponse])
def list_images(db: Session = Depends(get_db)):
    return db.query(Image).order_by(Image.created_at.desc()).all()


@router.get("/{image_id}", response_model=ImageResponse)
def get_image(image_id: int, db: Session = Depends(get_db)):
    image = db.query(Image).filter(Image.id == image_id).first()
    if not image:
        raise HTTPException(404, detail="Image not found")
    return image


# ── Watermark generation ──────────────────────────────────────────────

@router.post("/{image_id}/watermark", response_model=list[WatermarkedCopyResponse])
def generate_watermarks(
    image_id: int,
    body: WatermarkRequest,
    db: Session = Depends(get_db),
):
    original = db.query(Image).filter(Image.id == image_id).first()
    if not original:
        raise HTTPException(404, detail="Image not found")

    if not body.recipient_ids:
        raise HTTPException(400, detail="At least one recipient_id is required")

    recipients = (
        db.query(Recipient)
        .filter(Recipient.id.in_(body.recipient_ids))
        .all()
    )
    if len(recipients) != len(body.recipient_ids):
        raise HTTPException(400, detail="One or more recipient IDs are invalid")

    file_manager.ensure_dir()
    WATERMARKED_DIR.mkdir(parents=True, exist_ok=True)

    source = file_manager.get_path(original.storage_path)
    if not source.exists():
        raise HTTPException(404, detail="Original image file not found on disk")

    results: list[WatermarkedCopy] = []

    for recipient in recipients:
        watermark_id = wm.generate_id()

        try:
            filename = wm.embed(
                source_path=source,
                dest_dir=WATERMARKED_DIR,
                watermark_id=watermark_id,
            )
        except ValueError as e:
            raise HTTPException(400, detail=str(e))
        except FileNotFoundError:
            raise HTTPException(404, detail="Original image file not found on disk")
        except Exception as e:
            raise HTTPException(500, detail=f"Watermark embedding failed: {e}")

        copy = WatermarkedCopy(
            image_id=image_id,
            recipient_id=recipient.id,
            storage_path=filename,
            watermark_id=watermark_id,
        )
        db.add(copy)

        record = WatermarkRecord(
            image_id=image_id,
            recipient_id=recipient.id,
            watermark_id=watermark_id,
            algorithm="lsb",
            status="success",
        )
        db.add(record)

        results.append(copy)

    db.commit()

    for r in results:
        db.refresh(r)

    # Enrich with recipient names for the response
    name_map = {r.id: r.name for r in recipients}
    return [
        WatermarkedCopyResponse(
            id=c.id,
            image_id=c.image_id,
            recipient_id=c.recipient_id,
            recipient_name=name_map[c.recipient_id],
            watermark_id=c.watermark_id,
            created_at=c.created_at,
        )
        for c in results
    ]


@router.get("/{image_id}/copies", response_model=list[WatermarkedCopyResponse])
def list_copies(image_id: int, db: Session = Depends(get_db)):
    image = db.query(Image).filter(Image.id == image_id).first()
    if not image:
        raise HTTPException(404, detail="Image not found")

    copies = (
        db.query(WatermarkedCopy)
        .filter(WatermarkedCopy.image_id == image_id)
        .all()
    )

    recipient_ids = [c.recipient_id for c in copies]
    recipients = (
        db.query(Recipient)
        .filter(Recipient.id.in_(recipient_ids))
        .all()
    )
    name_map = {r.id: r.name for r in recipients}

    return [
        WatermarkedCopyResponse(
            id=c.id,
            image_id=c.image_id,
            recipient_id=c.recipient_id,
            recipient_name=name_map.get(c.recipient_id, ""),
            watermark_id=c.watermark_id,
            created_at=c.created_at,
        )
        for c in copies
    ]


# ── Download ──────────────────────────────────────────────────────────

@router.get("/copies/{copy_id}/download")
def download_copy(copy_id: int, db: Session = Depends(get_db)):
    copy = db.query(WatermarkedCopy).filter(WatermarkedCopy.id == copy_id).first()
    if not copy:
        raise HTTPException(404, detail="Copy not found")

    path = WATERMARKED_DIR / copy.storage_path
    if not path.exists():
        raise HTTPException(404, detail="File not found on disk")

    original = db.query(Image).filter(Image.id == copy.image_id).first()
    download_name = f"watermarked_{copy.recipient_id}_{original.original_filename}"

    return FileResponse(
        path=path,
        filename=download_name,
        media_type="image/png",
    )
