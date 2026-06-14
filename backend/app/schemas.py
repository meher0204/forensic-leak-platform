from datetime import datetime
from pydantic import BaseModel, Field


# ── Error ──────────────────────────────────────────────────────────────

class UserRoleUpdate(BaseModel):
    role: str = Field(pattern="^(admin|investigator)$", min_length=1)


class AdminOverviewResponse(BaseModel):
    total_users: int
    total_images: int
    total_recipients: int
    total_watermarked_copies: int
    total_investigations: int
    total_leaks_matched: int


class UserStatusUpdate(BaseModel):
    is_active: bool


class AdminUserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UserActivityResponse(BaseModel):
    images_count: int
    recipients_count: int
    copies_count: int
    investigations_count: int
    recent_items: list[str]


class ErrorDetail(BaseModel):
    detail: str
    type: str | None = None
    status: int | None = None


# ── User ──────────────────────────────────────────────────────────────

class UserCreate(BaseModel):
    username: str = Field(min_length=3)
    email: str = Field(min_length=5)
    password: str = Field(min_length=8)


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    role: str = "investigator"
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Auth ──────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    user: UserResponse
    message: str = "Logged in"


# ── Image ─────────────────────────────────────────────────────────────

class ImageResponse(BaseModel):
    id: int
    original_filename: str
    mime_type: str
    file_size: int
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Recipient ─────────────────────────────────────────────────────────

class RecipientCreate(BaseModel):
    name: str = Field(min_length=1)
    email: str = Field(min_length=5)
    notes: str | None = None


class RecipientUpdate(BaseModel):
    name: str | None = None
    email: str | None = None
    notes: str | None = None


class RecipientResponse(BaseModel):
    id: int
    name: str
    email: str
    notes: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ── Watermarked Copy ─────────────────────────────────────────────────

class WatermarkRequest(BaseModel):
    recipient_ids: list[int] = Field(min_length=1)


class WatermarkedCopyResponse(BaseModel):
    id: int
    image_id: int
    recipient_id: int
    recipient_name: str = ""
    watermark_id: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Watermark Record (audit log) ─────────────────────────────────────

class WatermarkRecordResponse(BaseModel):
    id: int
    image_id: int
    recipient_id: int
    watermark_id: str
    algorithm: str
    status: str
    error_message: str | None
    duration_ms: int | None
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Leak Investigation ────────────────────────────────────────────────

class InvestigationResponse(BaseModel):
    id: int
    case_id: str | None = None
    leaked_filename: str
    detected_watermark_id: str | None
    match_found: bool
    confidence: float
    matched_recipient_id: int | None
    matched_image_id: int | None
    possible_tampering: bool
    image_width: int | None
    image_height: int | None
    file_size: int | None
    notes: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Detection ─────────────────────────────────────────────────────────

class MatchResult(BaseModel):
    recipient_id: int
    recipient_name: str
    confidence: float
    watermark_id: str
    image_id: int
    created_at: str


class ImageInfo(BaseModel):
    width: int
    height: int
    file_size: int
    format: str


class DetectionResponse(BaseModel):
    match_found: bool
    confidence: float
    top_match: MatchResult | None
    all_matches: list[MatchResult]
    possible_tampering: bool
    image_info: ImageInfo
    investigation_id: int | None = None


class InvestigationDetailResponse(InvestigationResponse):
    recipient_name: str | None = None
    recipient_email: str | None = None
    image_filename: str | None = None
    image_created_at: datetime | None = None
    watermark_created_at: datetime | None = None
    evidence_url: str | None = None
    investigator: str | None = None


class WatermarkedCopyDetailResponse(BaseModel):
    id: int
    image_id: int
    image_filename: str
    recipient_id: int
    recipient_name: str
    recipient_email: str
    watermark_id: str
    created_at: datetime


# ── Search ────────────────────────────────────────────────────────────

class SearchResultItem(BaseModel):
    type: str
    id: int
    label: str
    subtitle: str
    url: str


class SearchResponse(BaseModel):
    results: list[SearchResultItem]


# ── System ────────────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    status: str
