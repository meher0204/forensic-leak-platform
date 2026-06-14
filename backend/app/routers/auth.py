"""User registration and session-based authentication.

Uses server-side sessions with httpOnly cookies.
Login creates a session row in the DB and sets a cookie.
Logout deletes the session row.
Protected routes check the session cookie against the DB.
"""

import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Response, Request
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User, Session as SessionModel, hash_password
from ..schemas import UserCreate, UserResponse, LoginRequest, LoginResponse

SESSION_DURATION_DAYS = 7
COOKIE_NAME = "session"

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse, status_code=201)
def register(body: UserCreate, db: Session = Depends(get_db)):
    existing = (
        db.query(User)
        .filter((User.username == body.username) | (User.email == body.email))
        .first()
    )
    if existing:
        raise HTTPException(409, detail="Username or email already taken")

    user = User(
        username=body.username,
        email=body.email,
        hashed_password=hash_password(body.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=LoginResponse)
def login(body: LoginRequest, response: Response, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == body.username).first()
    if not user or user.hashed_password != hash_password(body.password):
        raise HTTPException(401, detail="Invalid username or password")
    if not user.is_active:
        raise HTTPException(403, detail="Account is deactivated")

    token = secrets.token_hex(32)
    session = SessionModel(
        user_id=user.id,
        session_token=token,
        expires_at=datetime.now(timezone.utc) + timedelta(days=SESSION_DURATION_DAYS),
    )
    db.add(session)
    db.commit()

    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        samesite="lax",
        max_age=SESSION_DURATION_DAYS * 24 * 3600,
        path="/",
    )

    return LoginResponse(
        user=UserResponse(
            id=user.id,
            username=user.username,
            email=user.email,
            role=user.role,
            is_active=user.is_active,
            created_at=user.created_at,
        ),
        message="Logged in",
    )


@router.post("/logout")
def logout(response: Response, request: Request, db: Session = Depends(get_db)):
    token = request.cookies.get(COOKIE_NAME)
    if token:
        db.query(SessionModel).filter(SessionModel.session_token == token).delete()
        db.commit()
    response.delete_cookie(COOKIE_NAME, path="/")
    return {"message": "Logged out"}


@router.get("/me", response_model=UserResponse | None)
def get_me(request: Request, db: Session = Depends(get_db)):
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        return None
    session = (
        db.query(SessionModel)
        .filter(
            SessionModel.session_token == token,
            SessionModel.expires_at > datetime.now(timezone.utc),
        )
        .first()
    )
    if not session:
        return None
    user = db.query(User).filter(User.id == session.user_id).first()
    if not user:
        return None
    return user
