import io
import uuid
from pathlib import Path

from PIL import Image

UPLOAD_DIR = (
    Path(__file__).resolve().parent.parent.parent.parent / "uploads" / "originals"
)
ALLOWED_MIME = {"image/jpeg", "image/png", "image/webp"}
MAX_SIZE = 50 * 1024 * 1024

# Magic bytes signature for each supported format.
# Keyed by MIME type — each entry is a list of (offset, bytes_prefix) pairs.
MAGIC_SIGNATURES: dict[str, list[tuple[int, bytes]]] = {
    "image/png": [(0, b"\x89PNG\r\n\x1a\n")],
    "image/jpeg": [
        (0, b"\xff\xd8\xff\xe0"),
        (0, b"\xff\xd8\xff\xe1"),
        (0, b"\xff\xd8\xff\xe2"),
    ],
    "image/webp": [(8, b"WEBP")],
}


def _verify_magic(file_bytes: bytes, mime: str) -> bool:
    """Verify the file's magic bytes match the declared MIME type.

    Checks the first 12 bytes of the file against known signatures.
    This prevents MIME-type spoofing (e.g. uploading a .exe with
    content-type image/png).
    """
    signatures = MAGIC_SIGNATURES.get(mime)
    if not signatures:
        return False
    return any(
        file_bytes[offset : offset + len(magic)] == magic
        for offset, magic in signatures
    )


def ensure_dir() -> None:
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def validate(mime: str, size: int, file_bytes: bytes | None = None) -> None:
    """Validate file MIME type, size, and (optionally) magic bytes."""
    if mime not in ALLOWED_MIME:
        raise ValueError(f"Unsupported type '{mime}'. Use JPEG, PNG, or WEBP.")
    if size > MAX_SIZE:
        raise ValueError(f"File too large ({size // 1024 // 1024} MB). Max 50 MB.")
    if size == 0:
        raise ValueError("File is empty.")

    if file_bytes is not None and not _verify_magic(file_bytes, mime):
        raise ValueError(
            f"File content does not match declared type '{mime}'. "
            "The file may be corrupted or improperly renamed."
        )


def validate_can_open(file_bytes: bytes) -> None:
    """Attempt to open the image with Pillow to confirm it's decodable.

    This catches corrupted or truncated images that pass magic-byte
    checks but fail to decode.  """
    try:
        img = Image.open(io.BytesIO(file_bytes))
        img.verify()
    except Exception as e:
        raise ValueError(f"File cannot be opened as an image: {e}")


def save(file_bytes: bytes, original_name: str) -> str:
    ensure_dir()
    ext = Path(original_name).suffix or ".png"
    unique_name = f"{uuid.uuid4().hex}{ext}"
    path = UPLOAD_DIR / unique_name
    path.write_bytes(file_bytes)
    return unique_name


def get_path(filename: str) -> Path:
    return UPLOAD_DIR / filename
