"""
LSB (Least Significant Bit) forensic watermarking engine.

Terminology:
  - LSB: The rightmost bit of a byte. Changing it changes the value by ±1,
          which is invisible to the human eye.
  - Channel: One color component (R, G, or B) of a single pixel. Each channel
             is 8 bits (0-255).
  - Bitstream: A flat sequence of bits extracted from or embedded into pixel LSBs.

How embedding works:
  1. Convert watermark ID (e.g. "WMK-A7F3E2B1") to a bitstream (ASCII → binary)
  2. Flatten the image's RGB pixels into a single channel array
  3. For each bit in the (repeated) watermark bitstream, set the corresponding
     channel's LSB to that bit
  4. Save the modified pixels as a new image

How extraction works:
  1. Open image, flatten pixels to channels, extract LSBs → bitstream
  2. Scan every possible bit-offset within one ID-length window
  3. At each offset, decode 12 bytes back to ASCII
  4. If the decoded string matches "WMK-XXXXXXXX", it's a valid watermark
  5. Return the most frequently found valid ID
"""

import secrets
from pathlib import Path

from PIL import Image


WATERMARK_PREFIX = "WMK-"
ID_BYTES = 4  # 4 random bytes → 8 hex chars
ID_LENGTH = len(WATERMARK_PREFIX) + ID_BYTES * 2  # "WMK-" + 8 hex chars = 12
ID_BITS = ID_LENGTH * 8  # 96 bits
REPETITIONS = 3


def generate_id() -> str:
    """Generate a unique forensic watermark ID.
    
    Format: WMK-XXXXXXXX (e.g. "WMK-A7F3E2B1")
    - WMK  = WaterMarK prefix (identifies our watermark)
    - XXXX = 4 random bytes as 8 hex chars
    Total: 12 ASCII characters = 96 bits in LSB storage.
    """
    hex_part = secrets.token_hex(ID_BYTES).upper()
    return f"{WATERMARK_PREFIX}{hex_part}"


# ── Bit-level conversion helpers ──────────────────────────────────────

def _id_to_bits(watermark_id: str) -> list[int]:
    """Convert a string to a flat bit list (MSB-first per byte).

    Example:
      "A" → ord("A") = 65 → binary 01000001 → bits [0,1,0,0,0,0,0,1]

    We use MSB-first (most significant bit first) because that's how
    ASCII and Unicode are conventionally represented.
    """
    bits: list[int] = []
    for char in watermark_id:
        byte = ord(char)
        # Shift the byte right by 7, 6, ..., 0 and mask the LSB
        for shift in range(7, -1, -1):
            bits.append((byte >> shift) & 1)
    return bits


def _bits_to_id(bits: list[int]) -> str:
    """Convert a flat bit list back to a string (MSB-first per byte).

    Inverse of _id_to_bits. Takes 8 bits at a time, reconstructs the byte,
    then converts to a character.
    """
    chars: list[str] = []
    for i in range(0, len(bits), 8):
        if i + 8 > len(bits):
            break
        byte = 0
        for j in range(8):
            byte = (byte << 1) | bits[i + j]
        chars.append(chr(byte))
    return "".join(chars)


# ── Embedding ─────────────────────────────────────────────────────────

def embed(source_path: Path, dest_dir: Path, watermark_id: str) -> str:
    """Embed a watermark ID into an image using LSB steganography.

    Strategy — distributed placement:
      Instead of packing all repetitions at the start (which a top-left
      crop would destroy entirely), we spread them evenly across the
      image.  Each repetition occupies 96 bits (32 pixels) and is placed
      at a different region of the image:
        rep1 → at 0%  of the pixel array
        rep2 → at 33% of the pixel array
        rep3 → at 66% of the pixel array

      This means any single crop can destroy at most ONE repetition.
      The other two survive as long as they aren't in the cropped region.

    Args:
        source_path: Path to the original image file.
        dest_dir: Directory where the watermarked copy will be saved.
        watermark_id: The ID string to embed (e.g. "WMK-A7F3E2B1").

    Returns:
        The filename (not full path) of the saved watermarked copy.

    Raises:
        ValueError: If the image is too small to hold even one
                    watermark repetition.
    """
    result = _open_image_safe(source_path)
    if result is None:
        raise ValueError(
            f"Cannot open source image at '{source_path}' — "
            "the file may be corrupted or in an unsupported format."
        )
    img, width, height, channels = result

    watermark_bits = _id_to_bits(watermark_id)
    total_channels = len(channels)

    one_rep = len(watermark_bits)
    max_reps = total_channels // one_rep

    if max_reps < 1:
        raise ValueError(
            f"Image too small ({width}×{height}). "
            f"Need at least {one_rep // 3} pixels."
        )

    actual_reps = min(max_reps, REPETITIONS)
    spacing = total_channels // actual_reps

    for rep in range(actual_reps):
        start = rep * spacing
        for i, bit in enumerate(watermark_bits):
            idx = start + i
            if idx >= total_channels:
                break
            channels[idx] = (channels[idx] & 0xFE) | bit

    new_pixels: list[tuple[int, int, int]] = []
    for i in range(0, total_channels, 3):
        new_pixels.append((channels[i], channels[i + 1], channels[i + 2]))

    watermarked = Image.new("RGB", (width, height))
    watermarked.putdata(new_pixels)

    filename = f"{secrets.token_hex(8)}.png"
    watermarked.save(dest_dir / filename)

    return filename


# ── Extraction ────────────────────────────────────────────────────────

# Pre-computed bit pattern for "WMK-" (4 chars = 32 bits).
# Used as a fast pre-filter — only 1 in 4 billion random
# positions will match this pattern.
_WMK_BITS = _id_to_bits("WMK-")


def _scan_bitstream(bits: list[int]) -> dict[str, int]:
    """Scan a bitstream for valid watermark patterns.

    Uses a two-pass approach:
      1. Quick pre-filter: check if the first 32 bits match "WMK-"
      2. Only if matched, do the full 96-bit decode to get the hex ID

    This filters out ~99.9999999% of positions without running the
    expensive full decode.

    Scans every possible offset so cropped images are handled —
    after a crop the watermark bits shift by (pixels_removed × 3) positions,
    but at least one full repetition will start within ID_BITS of some offset.
    """
    candidates: dict[str, int] = {}
    max_offset = len(bits) - ID_BITS + 1

    if max_offset < 1:
        return candidates

    for offset in range(max_offset):
        # Fast pre-filter: check "WMK-" prefix (32 bits)
        match = True
        for j in range(32):
            if bits[offset + j] != _WMK_BITS[j]:
                match = False
                break
        if not match:
            continue

        # Full decode (96 bits → 12 characters)
        chunk = bits[offset : offset + ID_BITS]
        decoded = _bits_to_id(chunk)
        if decoded.startswith(WATERMARK_PREFIX) and len(decoded) == ID_LENGTH:
            candidates[decoded] = candidates.get(decoded, 0) + 1

    return candidates


def _open_image_safe(image_path: Path) -> tuple[Image.Image, int, int, list[int]] | None:
    """Safely open an image and extract channels.

    Handles corrupted files, unsupported modes, and edge cases.
    Returns (img, width, height, channels) or None on failure.
    """
    try:
        img = Image.open(image_path)
        img.verify()
        # Re-open after verify (verify closes the file)
        img = Image.open(image_path)
        img = img.convert("RGB")
        width, height = img.size
        pixels = list(img.getdata())
        channels: list[int] = []
        for r, g, b in pixels:
            channels.extend([r, g, b])
        return img, width, height, channels
    except Exception:
        return None


def extract(image_path: Path) -> str | None:
    """Extract a watermark ID from an image.

    Scans every pixel's LSBs for the "WMK-" watermark pattern,
    which repeats every 96 bits.  Even in a heavily cropped image,
    one repetition survives as long as the cropped region is
    larger than ~32 pixels in each dimension.

    Args:
        image_path: Path to the (possibly leaked) image.

    Returns:
        The extracted watermark ID, or None if no valid watermark found.
    """
    result = _open_image_safe(image_path)
    if result is None:
        return None
    _, _, _, channels = result

    bits = [c & 1 for c in channels]

    if len(bits) < ID_BITS:
        return None

    candidates = _scan_bitstream(bits)

    if not candidates:
        return None

    return max(candidates, key=candidates.get)


def extract_with_analysis(image_path: Path) -> dict:
    """Extract watermark and compute a confidence score.

    Strategy:
      - Scan every pixel's LSB positions for "WMK-" patterns
      - Each valid "WMK-XXXXXXXX" decoding counts as one repetition
      - We expect REPETITIONS (3) matches in a clean, uncropped image
      - Confidence = min(valid_count / REPETITIONS, 1.0)
        (capped at 1.0 — you can't exceed 100% confidence)

    Returns:
        {
            "watermark_id": str | None,
            "confidence": float,        # 0.0 to 1.0
            "repetitions_found": int,   # how many valid decodings
            "details": {
                "offsets_checked": int,
                "valid_matches": int,
                "candidates": {id: count, ...},
            }
        }
    """
    result = _open_image_safe(image_path)
    if result is None:
        return {
            "watermark_id": None,
            "confidence": 0.0,
            "repetitions_found": 0,
            "details": {"error": "Could not open or decode image"},
        }
    _, _, _, channels = result

    bits = [c & 1 for c in channels]

    if len(bits) < ID_BITS:
        return {
            "watermark_id": None,
            "confidence": 0.0,
            "repetitions_found": 0,
            "details": {"error": "Image too small to contain watermark"},
        }

    candidates = _scan_bitstream(bits)
    total_valid = sum(candidates.values())
    max_offset = len(bits) - ID_BITS + 1

    if total_valid == 0:
        return {
            "watermark_id": None,
            "confidence": 0.0,
            "repetitions_found": 0,
            "details": {
                "offsets_checked": max_offset,
                "valid_matches": 0,
            },
        }

    best_id = max(candidates, key=candidates.get)
    confidence = min(total_valid / REPETITIONS, 1.0)

    return {
        "watermark_id": best_id,
        "confidence": round(confidence, 4),
        "repetitions_found": total_valid,
        "details": {
            "offsets_checked": max_offset,
            "valid_matches": total_valid,
            "candidates": candidates,
        },
    }
