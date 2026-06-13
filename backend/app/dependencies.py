from datetime import datetime, timezone

from fastapi import Depends, HTTPException, Request
from sqlalchemy.orm import Session

from .database import get_db
from .models import User, Session as SessionModel

COOKIE_NAME = "session"


def require_auth(request: Request, db: Session = Depends(get_db)) -> User:
    """FastAPI dependency that validates the session cookie.

    Use this on any route that requires authentication:

        @router.get("/protected")
        def protected(user: User = Depends(require_auth)):
            return {"user": user.username}

    The dependency reads the httpOnly "session" cookie, looks up
    the session in the database, and returns the associated User.
    Raises 401 if the cookie is missing, invalid, or expired.
    """
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    session = (
        db.query(SessionModel)
        .filter(
            SessionModel.session_token == token,
            SessionModel.expires_at > datetime.now(timezone.utc),
        )
        .first()
    )
    if not session:
        raise HTTPException(status_code=401, detail="Session expired or invalid")

    user = db.query(User).filter(User.id == session.user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user


def require_admin(user: User = Depends(require_auth)) -> User:
    """FastAPI dependency that requires the session to belong to an admin user.

    Composes on top of require_auth — validates the session first,
    then checks the user's role.  Raises 403 if the user is not an admin.
    """
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user
