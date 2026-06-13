import hashlib
from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from .database import Base


# ── Helper ────────────────────────────────────────────────────────────

def _utcnow():
    return datetime.now(timezone.utc)


def hash_password(password: str) -> str:
    """One-way hash of a password using SHA-256.

    For a learning project this is acceptable; production systems
    should use bcrypt/argon2 with a salt.
    """
    return hashlib.sha256(password.encode()).hexdigest()


# ── Session (login sessions) ─────────────────────────────────────────

class Session(Base):
    """Server-side session for cookie-based auth.

    When a user logs in, a random token is generated and stored here.
    The token is set as an httpOnly cookie on the client.  Every
    protected route checks this table to validate the session.

    This approach means logout is instant — just delete the row.
    No need for JWT blacklists, refresh tokens, or key rotation.
    """
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    session_token = Column(String(64), unique=True, nullable=False, index=True)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=_utcnow)

    user = relationship("User")


# ── User ──────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default="investigator")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=_utcnow)
    updated_at = Column(DateTime, default=_utcnow, onupdate=_utcnow)


# ── Images ────────────────────────────────────────────────────────────

class Image(Base):
    __tablename__ = "images"

    id = Column(Integer, primary_key=True, index=True)
    original_filename = Column(String, nullable=False)
    storage_path = Column(String, nullable=False)
    mime_type = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=_utcnow)

    copies = relationship("WatermarkedCopy", back_populates="image", cascade="all, delete-orphan")


# ── Recipients ────────────────────────────────────────────────────────

class Recipient(Base):
    __tablename__ = "recipients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, default=_utcnow)
    updated_at = Column(DateTime, default=_utcnow, onupdate=_utcnow)

    copies = relationship("WatermarkedCopy", back_populates="recipient")


# ── Watermarked Copies ────────────────────────────────────────────────

class WatermarkedCopy(Base):
    __tablename__ = "watermarked_copies"

    id = Column(Integer, primary_key=True, index=True)
    image_id = Column(Integer, ForeignKey("images.id"), nullable=False)
    recipient_id = Column(Integer, ForeignKey("recipients.id"), nullable=False)
    storage_path = Column(String, nullable=False)
    watermark_id = Column(String, nullable=False)
    created_at = Column(DateTime, default=_utcnow)

    image = relationship("Image", back_populates="copies")
    recipient = relationship("Recipient", back_populates="copies")


# ── Watermark Records (audit log) ─────────────────────────────────────

class WatermarkRecord(Base):
    """Audit log entry for every watermark generation operation.

    Created each time watermarked copies are generated.
    Records what was done, to whom, how long it took,
    and whether it succeeded.
    """
    __tablename__ = "watermark_records"

    id = Column(Integer, primary_key=True, index=True)
    image_id = Column(Integer, ForeignKey("images.id"), nullable=False)
    recipient_id = Column(Integer, ForeignKey("recipients.id"), nullable=False)
    watermark_id = Column(String, nullable=False)
    algorithm = Column(String(20), nullable=False, default="lsb")
    status = Column(String(20), nullable=False, default="success")
    error_message = Column(String, nullable=True)
    duration_ms = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=_utcnow)


# ── Leak Investigations ───────────────────────────────────────────────

class LeakInvestigation(Base):
    """Record of a single leak detection analysis.

    Every time someone uploads a suspected leaked image and runs
    detection, a row is created here.  It stores the result,
    confidence score, and which recipient (if any) was matched.
    """
    __tablename__ = "leak_investigations"

    id = Column(Integer, primary_key=True, index=True)
    leaked_filename = Column(String, nullable=False)
    storage_path = Column(String, nullable=True)
    detected_watermark_id = Column(String, nullable=True)
    match_found = Column(Boolean, default=False)
    confidence = Column(Float, default=0.0)
    matched_recipient_id = Column(Integer, ForeignKey("recipients.id"), nullable=True)
    matched_image_id = Column(Integer, ForeignKey("images.id"), nullable=True)
    possible_tampering = Column(Boolean, default=False)
    image_width = Column(Integer, nullable=True)
    image_height = Column(Integer, nullable=True)
    file_size = Column(Integer, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=_utcnow)
