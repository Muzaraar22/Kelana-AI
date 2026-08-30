from pydantic import BaseModel
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from database import init_db, SessionLocal
from models.trip import Trip
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

@app.get ("/api/v1/trips")
def list_trips():
    db = SessionLocal()
    trips = db. query (Trip) .all ()
    db.close ()
    return trips

@app.get ("/api/v1/trips/{trip_id}")
def get_trip(trip_id: int):
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id).first ()
    db.close ()
    if trip is None:
        raise HTTPException (status_code=404, detail=f"Trip with id {trip_id} not found")
    return trip



#--------------------------- POST -----------------------------------
@app.post("/api/v1/trips")
def create_trip(trip_request: TripRequest):
    recommended_places = []
    for dest in trip_request.destination.split(","):
            for place in get_recommended_places(dest.strip()):
                recommended_places.append(place)

    category = get_trip_category(trip_request.budget, trip_request.currency)
    trip = Trip (
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

    db = SessionLocal()
    db.add(trip)
    db.commit()
    db.refresh(trip)
    db.close()

    return trip

@app.post("/api/v1/trips/{id}/generate")
def generate_trip_recommendation(id: int):
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == id).first()

    if trip is None:
        raise HTTPException (status_code=404, detail=f"Trip with id {id} not found")
    
    recommendation = generate_ai_recommendation(trip)
    trip.ai_recommendation = recommendation

    db.commit()
    db.refresh(trip)
    db.close()

    return {
        "trip_id": trip.id,
        "destination": trip.destination,
        "ai_recommendation": recommendation
    }

@app.delete("/api/v1/trips/{trip_id}/")
def delete_trip(trip_id: int):
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if trip is None:
        db.close()
        raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")
    db.delete(trip)
    db.commit()
    db.close()
    return {"message": f"Trip with id {trip_id} has been deleted."}

@app.put("/api/v1/trips/{trip_id}/") #only recalculate budget (dan yang depends ke sini)
def update_trip(trip_id: int, trip_request: UpdateTripRequest):
    db = SessionLocal()
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if trip is None:
        db.close()
        raise HTTPException(status_code=404, detail=f"Trip with id {trip_id} not found")

    trip.budget = trip_request.budget
    trip.category = get_trip_category(trip_request.budget, trip.currency)
    trip.daily_budget = calculate_daily_budget(trip_request.budget, trip.days)
    trip.transportation_recommendation = get_transportation_recommendation(trip.category)

    db.commit()
    db.refresh(trip)
    db.close()

    return trip