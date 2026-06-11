import traceback
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Depends, FastAPI, Request, HTTPException
from fastapi.responses import JSONResponse
from PIL import UnidentifiedImageError
from sqlalchemy.exc import SQLAlchemyError

from app.database import engine, Base
from app.dependencies import require_auth
from app.routers import images, recipients, detection, auth, watermark_records, investigations, admin
from app.schemas import HealthResponse

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Forensic Leak Platform")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
    ],
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
app.include_router(admin.router, dependencies=[Depends(require_auth)])


@app.get("/api/health", response_model=HealthResponse)
def health_check():
    return {"status": "ok"}
