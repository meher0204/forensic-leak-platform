import os
import traceback
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Depends, FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from PIL import UnidentifiedImageError
from sqlalchemy.exc import SQLAlchemyError

load_dotenv()

from app.database import engine, Base
from app.dependencies import require_auth, require_admin
from app.routers import images, recipients, detection, auth, watermark_records, investigations, admin, copies, search
from app.schemas import HealthResponse

from sqlalchemy import text as sa_text

Base.metadata.create_all(bind=engine)

# ── Startup migration: add role column if missing ─────────────────────
with engine.connect() as conn:
    result = conn.execute(sa_text("PRAGMA table_info(users)")).fetchall()
    columns = [row[1] for row in result]
    if "role" not in columns:
        conn.execute(sa_text("ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'investigator'"))
        conn.commit()
    conn.execute(sa_text("UPDATE users SET role = 'investigator' WHERE role IS NULL"))
    conn.commit()

    # Add owner_id columns if missing
    owner_tables = ["images", "recipients", "watermarked_copies", "leak_investigations", "watermark_records"]
    for tbl in owner_tables:
        cols = conn.execute(sa_text(f"PRAGMA table_info({tbl})")).fetchall()
        if "owner_id" not in [c[1] for c in cols]:
            conn.execute(sa_text(f"ALTER TABLE {tbl} ADD COLUMN owner_id INTEGER REFERENCES users(id)"))
    conn.commit()

    # Assign existing ownerless records to first admin
    admin_row = conn.execute(sa_text("SELECT id FROM users WHERE role = 'admin' LIMIT 1")).fetchone()
    if admin_row:
        admin_id = admin_row[0]
        for tbl in owner_tables:
            conn.execute(sa_text(f"UPDATE {tbl} SET owner_id = {admin_id} WHERE owner_id IS NULL"))
        conn.commit()

    # Add case_id column to leak_investigations if missing
    # NOTE: SQLite ALTER TABLE ADD COLUMN does NOT support UNIQUE.
    # We add the column and create a unique index separately.
    li_cols = conn.execute(sa_text("PRAGMA table_info(leak_investigations)")).fetchall()
    if "case_id" not in [c[1] for c in li_cols]:
        conn.execute(sa_text("ALTER TABLE leak_investigations ADD COLUMN case_id VARCHAR(20)"))
        conn.commit()
        # Populate case_id for existing rows
        existing = conn.execute(sa_text("SELECT id FROM leak_investigations ORDER BY id")).fetchall()
        for row in existing:
            conn.execute(sa_text(f"UPDATE leak_investigations SET case_id = 'CASE-{row[0]:04d}' WHERE id = {row[0]}"))
        conn.commit()
        # Create a unique index (the UNIQUE constraint SQLite refused)
        conn.execute(sa_text("CREATE UNIQUE INDEX IF NOT EXISTS ix_leak_investigations_case_id ON leak_investigations(case_id)"))
        conn.commit()

app = FastAPI(title="Forensic Leak Platform")

FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "").strip()
origins = [
    "http://localhost:5173",
    "http://localhost:5174",
]
if FRONTEND_ORIGIN and FRONTEND_ORIGIN not in origins:
    origins.append(FRONTEND_ORIGIN)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Global exception handler ───────────────────────────────────────────

@app.exception_handler(HTTPException)
async def http_exception_handler(_request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "type": "validation_error", "status": exc.status_code},
    )


@app.exception_handler(UnidentifiedImageError)
async def image_error_handler(_request: Request, _exc: UnidentifiedImageError):
    return JSONResponse(
        status_code=400,
        content={
            "detail": "The file is not a valid image or is corrupted.",
            "type": "invalid_image",
            "status": 400,
        },
    )


@app.exception_handler(SQLAlchemyError)
async def db_error_handler(_request: Request, exc: SQLAlchemyError):
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={
            "detail": "A database error occurred. Please try again.",
            "type": "database_error",
            "status": 500,
        },
    )


@app.exception_handler(Exception)
async def general_error_handler(_request: Request, exc: Exception):
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={
            "detail": "An unexpected internal error occurred.",
            "type": "internal_error",
            "status": 500,
        },
    )


# ── Routers ────────────────────────────────────────────────────────────

# All routers except auth require a valid session cookie.
app.include_router(auth.router)  # public: register, login, logout, me
app.include_router(images.router, dependencies=[Depends(require_auth)])
app.include_router(recipients.router, dependencies=[Depends(require_auth)])
app.include_router(detection.router, dependencies=[Depends(require_auth)])
app.include_router(watermark_records.router, dependencies=[Depends(require_auth)])
app.include_router(investigations.router, dependencies=[Depends(require_auth)])
app.include_router(copies.router, dependencies=[Depends(require_auth)])
app.include_router(search.router, dependencies=[Depends(require_auth)])
app.include_router(admin.router, dependencies=[Depends(require_admin)])


@app.get("/api/health", response_model=HealthResponse)
def health_check():
    return {"status": "ok"}
