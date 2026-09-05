import os
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import (
    APIKeyCookie,
    HTTPBearer,
    HTTPAuthorizationCredentials,
)
from sqlalchemy.orm import Session

from database import SessionLocal
from models.user import User
from models.trip import Trip
from models.conversation import Conversation

load_dotenv()

JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALG = "HS256"
JWT_EXPIRES_MINUTES = int(os.getenv("JWT_EXPIRES_MINUTES", "1440"))
COOKIE_NAME = "access_token"

# both optional: the token may arrive as a cookie (browser via the Next BFF proxy)
# or as an Authorization: Bearer header (Swagger /docs, curl)
cookie_scheme = APIKeyCookie(name=COOKIE_NAME, auto_error=False)
bearer_scheme = HTTPBearer(auto_error=False)


# --------------------------- password hashing ---------------------------
def hash_password(plain: str) -> str:
    """bcrypt — a fresh random salt is generated and embedded in the hash string."""
    return bcrypt.hashpw(plain.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except ValueError:
        return False


# ------------------------------- JWT -----------------------------------
def create_access_token(user_id: int) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "iat": now,
        "exp": now + timedelta(minutes=JWT_EXPIRES_MINUTES),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


# --------------------------- dependencies ------------------------------
def get_db():
    """Request-scoped DB session — replaces the manual SessionLocal()/db.close()."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    cookie_token: str | None = Depends(cookie_scheme),
    bearer: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Decode the JWT once and bind the requesting User (the `req.user` equivalent)."""
    token = cookie_token or (bearer.credentials if bearer else None)
    if not token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Not authenticated")

    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
        user_id = int(payload["sub"])
    except (jwt.PyJWTError, KeyError, ValueError):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Invalid or expired token")

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "User no longer exists")
    return user


def get_owned_trip(trip_id: int, db: Session, current_user: User) -> Trip:
    """Load a trip and enforce ownership: 404 if missing, 403 if it's someone else's."""
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if trip is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"Trip with id {trip_id} not found")
    if trip.user_id != current_user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "This trip belongs to another user")
    return trip


def get_owned_conversation(conversation_id: int, db: Session, current_user: User) -> Conversation:
    """Load a conversation and enforce ownership: 404 if missing, 403 if it's someone else's."""
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if conversation is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, f"Conversation with id {conversation_id} not found")
    if conversation.user_id != current_user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "This conversation belongs to another user")
    return conversation
