import re
import traceback
from datetime import datetime

from pydantic import BaseModel, Field
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy.sql import func
from services.kb_service import ask_knowledge_base

from database import init_db
from models.user import User
from models.trip import Trip
from models.conversation import Conversation
from models.message import Message
from auth import (
    get_db,
    get_current_user,
    get_owned_trip,
    get_owned_conversation,
    hash_password,
    verify_password,
    create_access_token,
)
from services.bedrock_service import generate_ai_recommendation
from services.trip_service import (
    get_trip_category,
    get_transportation_recommendation,
    get_travel_season,
    get_recommended_places,
    calculate_daily_budget,
    recommendations
)

app = FastAPI()
init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class TripRequest(BaseModel):
    destination: str
    days: int
    budget: float
    currency: str
    travel_month: str
    travel_style: str = "Solo"

class UpdateTripRequest(BaseModel):
    budget: float


# ------------------------------ auth schemas ------------------------------
_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# setelah baca ppt 2 dan 3, note: mohon maaf ini materi banyak contradict nya
# kalau mau REUSE dari session 2, transport recommendation BUKAN dari travel_style
# tetapi dari BUDGET penentunya, transport -> trip categories -> budget (-> adalah depends)


@app.get("/")
def home():
    return {"message": "Welcome to KelanaAI! Use the /api/v1/trips endpoint to plan your trip."}

@app.get("/health")
def health_check():
    return {"status": "OK"}

@app.get("/api/v1/recommendations")
def get_recommendations():
    all_recommendations = []
    for val in recommendations.values():
        all_recommendations.extend(val)
    return {"recommendations": all_recommendations}

@app.get("/api/v1/transportation")
def get_transportations():
    return {"transportations": ["Bus", "Train", "Flight"]}

@app.get("/api/v1/trip-categories")
def get_trip_categories():
    return {"categories": ["Backpacker", "Standard", "Luxury"]}


# ------------------------------- auth ---------------------------------
@app.post("/api/v1/auth/register", response_model=AuthResponse, status_code=201)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    name = body.name.strip()
    email = body.email.strip().lower()

    if len(name) < 2:
        raise HTTPException(422, "Name must be at least 2 characters")
    if not _EMAIL_RE.match(email):
        raise HTTPException(422, "Invalid email address")
    if not (8 <= len(body.password) <= 72):
        raise HTTPException(422, "Password must be 8-72 characters")
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(409, "Email already registered")

    user = User(name=name, email=email, password_hash=hash_password(body.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return AuthResponse(access_token=create_access_token(user.id), user=user)

@app.post("/api/v1/auth/login", response_model=AuthResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    email = body.email.strip().lower()
    user = db.query(User).filter(User.email == email).first()
    if user is None or not verify_password(body.password, user.password_hash):
        raise HTTPException(401, "Invalid email or password")
    return AuthResponse(access_token=create_access_token(user.id), user=user)

@app.get("/api/v1/auth/me", response_model=UserOut)
def me(current_user: User = Depends(get_current_user)):
    return current_user

@app.get("/api/v1/trips")
def list_trips(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Trip)
        .filter(Trip.user_id == current_user.id)
        .order_by(Trip.created_at.desc())
        .all()
    )

@app.get("/api/v1/trips/{trip_id}")
def get_trip(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return get_owned_trip(trip_id, db, current_user)


#--------------------------- POST -----------------------------------
@app.post("/api/v1/trips")
def create_trip(
    trip_request: TripRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    recommended_places = []
    for dest in trip_request.destination.split(","):
            for place in get_recommended_places(dest.strip()):
                recommended_places.append(place)

    category = get_trip_category(trip_request.budget, trip_request.currency)
    trip = Trip (
        user_id=current_user.id,
        destination=trip_request.destination,
        days=trip_request.days,
        budget=trip_request.budget,
        currency=trip_request.currency,
        category=category,
        daily_budget=calculate_daily_budget(trip_request.budget, trip_request.days),
        transportation_recommendation=get_transportation_recommendation(category),
        travel_month=trip_request.travel_month,
        travel_season=get_travel_season(trip_request.travel_month),
        recommended_places=recommended_places,
        ai_recommendation=None,
        travel_style=trip_request.travel_style
    )
    ai_recommendation = generate_ai_recommendation(trip)
    trip.ai_recommendation = ai_recommendation

    db.add(trip)
    db.commit()
    db.refresh(trip)

    return trip

@app.post("/api/v1/trips/{id}/generate")
def generate_trip_recommendation(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    trip = get_owned_trip(id, db, current_user)

    recommendation = generate_ai_recommendation(trip)
    trip.ai_recommendation = recommendation

    db.commit()
    db.refresh(trip)

    return {
        "trip_id": trip.id,
        "destination": trip.destination,
        "ai_recommendation": recommendation
    }

@app.delete("/api/v1/trips/{trip_id}/")
@app.delete("/api/v1/trips/{trip_id}")  # /bff proxy strips the trailing slash
def delete_trip(
    trip_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    trip = get_owned_trip(trip_id, db, current_user)
    db.delete(trip)
    db.commit()
    return {"message": f"Trip with id {trip_id} has been deleted."}

@app.put("/api/v1/trips/{trip_id}/") #only recalculate budget (dan yang depends ke sini)
@app.put("/api/v1/trips/{trip_id}")  # /bff proxy strips the trailing slash
def update_trip(
    trip_id: int,
    trip_request: UpdateTripRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    trip = get_owned_trip(trip_id, db, current_user)

    trip.budget = trip_request.budget
    trip.category = get_trip_category(trip_request.budget, trip.currency)
    trip.daily_budget = calculate_daily_budget(trip_request.budget, trip.days)
    trip.transportation_recommendation = get_transportation_recommendation(trip.category)

    db.commit()
    db.refresh(trip)

    return trip

class QuestionRequest(BaseModel):
    question: str = Field(min_length=3, max_length=500)
    conversation_id: int | None = None

class RenameConversationRequest(BaseModel):
    title: str = Field(min_length=1, max_length=120)

# how many prior messages get replayed into the Bedrock prompt as context —
# simple trimming (no summarization/token counting), per session's teaching scope
CHAT_HISTORY_LIMIT = 20
CONVERSATION_TITLE_MAX_LENGTH = 60


def _build_history(conversation_id: int, db: Session) -> list[dict]:
    """Last CHAT_HISTORY_LIMIT messages, oldest first, as {"role", "content"} dicts.

    Bedrock's converse API requires strict user/assistant alternation starting
    with "user". A failed generation can leave an orphaned trailing user message
    with no reply (see ask_assistant's commit ordering) — if the window happens
    to end on one, drop it: it has no answer yet, so it isn't useful context.
    """
    recent = (
        db.query(Message)
        .filter(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.desc())
        .limit(CHAT_HISTORY_LIMIT)
        .all()
    )
    recent.reverse()
    if recent and recent[-1].role == "user":
        recent = recent[:-1]
    return [{"role": m.role, "content": m.content} for m in recent]


# ----------------------------- conversations ---------------------------
@app.get("/api/v1/conversations")
def list_conversations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Conversation)
        .filter(Conversation.user_id == current_user.id)
        .order_by(Conversation.updated_at.desc())
        .all()
    )

@app.get("/api/v1/conversations/{conversation_id}")
def get_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conversation = get_owned_conversation(conversation_id, db, current_user)
    messages = (
        db.query(Message)
        .filter(Message.conversation_id == conversation.id)
        .order_by(Message.created_at.asc())
        .all()
    )
    return {
        "id": conversation.id,
        "title": conversation.title,
        "created_at": conversation.created_at,
        "updated_at": conversation.updated_at,
        "messages": messages,
    }

@app.patch("/api/v1/conversations/{conversation_id}")
def rename_conversation(
    conversation_id: int,
    body: RenameConversationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conversation = get_owned_conversation(conversation_id, db, current_user)
    conversation.title = body.title.strip()
    db.commit()
    db.refresh(conversation)
    return conversation

@app.delete("/api/v1/conversations/{conversation_id}/")
@app.delete("/api/v1/conversations/{conversation_id}")  # /bff proxy strips the trailing slash
def delete_conversation(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conversation = get_owned_conversation(conversation_id, db, current_user)
    db.delete(conversation)  # ON DELETE CASCADE removes its messages too
    db.commit()
    return {"message": f"Conversation with id {conversation_id} has been deleted."}


@app.post("/api/v1/ask")
def ask_assistant(
    request: QuestionRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Answer a travel question grounded in the knowledge base, with persisted,
    multi-turn conversation history.

    If `conversation_id` is omitted a new conversation is created (titled from
    the first question) and its id comes back in the response so the frontend
    adopts it for subsequent turns. Every turn is stored as two Message rows
    (user + assistant); `conversation.updated_at` is bumped so the sidebar can
    sort by recent activity. Context sent to Bedrock is the last
    CHAT_HISTORY_LIMIT messages only — simple trimming, no summarization.
    Every call is a real, billed AWS request (a KB Retrieve plus a Bedrock
    converse).
    """
    question = request.question.strip()

    if request.conversation_id is None:
        title = question[:CONVERSATION_TITLE_MAX_LENGTH]
        if len(question) > CONVERSATION_TITLE_MAX_LENGTH:
            title += "…"
        conversation = Conversation(user_id=user.id, title=title)
        db.add(conversation)
        db.commit()
        db.refresh(conversation)
    else:
        conversation = get_owned_conversation(request.conversation_id, db, user)

    # snapshot history BEFORE inserting the current question, so it never
    # appears twice and the alternation check above has a clean prior window
    history = _build_history(conversation.id, db)

    # persisted immediately so the question is never lost even if generation
    # below fails (network blip, throttling, bad KB config, ...)
    user_message = Message(conversation_id=conversation.id, role="user", content=question)
    db.add(user_message)
    db.commit()
    db.refresh(user_message)

    try:
        result = ask_knowledge_base(question, history)
    except RuntimeError as exc:
        # missing KNOWLEDGE_BASE_ID / config problem
        raise HTTPException(500, str(exc))
    except Exception as exc:
        # print the real cause to the uvicorn console...
        traceback.print_exc()
        # ...and echo it back so it shows up in the frontend error bubble too.
        # (tighten this to a generic message before going to production)
        raise HTTPException(502, f"{type(exc).__name__}: {exc}")

    assistant_message = Message(
        conversation_id=conversation.id,
        role="assistant",
        content=result["answer"],
        sources=result["sources"],
    )
    db.add(assistant_message)
    conversation.updated_at = func.now()
    db.commit()
    # this commit expires every object the session was tracking, including
    # user_message from the earlier commit — FastAPI's schema-less ORM
    # serialization reads __dict__ directly rather than through the ORM
    # descriptors, so an expired object would otherwise encode as "{}"
    db.refresh(user_message)
    db.refresh(assistant_message)

    return {
        "conversation_id": conversation.id,
        "conversation_title": conversation.title,
        "user_message": user_message,
        "assistant_message": assistant_message,
    }