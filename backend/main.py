from pydantic import BaseModel
from fastapi import FastAPI
from services.trip_service import (
    get_trip_category,
    get_transportation_recommendation,
    get_travel_season,
    get_recommended_places,
    calculate_daily_budget,
    recommendations
)

app = FastAPI()
class TripRequest(BaseModel):
    destination: str
    days: int
    budget: float
    currency: str
    travel_month: str

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

@app.get("api/v1/trip-categories")
def get_trip_categories():
    return {"categories": ["Backpacker", "Standard", "Luxury"]}

@app.post("/api/v1/trips")
def create_trip(trip_request: TripRequest):
    trip_summary = {
        "destination": trip_request.destination,
        "days": trip_request.days,
        "budget": trip_request.budget,
        "currency": trip_request.currency,
        "category": get_trip_category(trip_request.budget),
        "daily_budget": calculate_daily_budget(trip_request.budget, trip_request.days),
        "transportation_recommendation": get_transportation_recommendation(get_trip_category(trip_request.budget)),
        "travel_month": trip_request.travel_month,
        "travel_season": get_travel_season(trip_request.travel_month),
        "recommended_places": []
    }

    for dest in trip_request.destination.split(","):
        for place in get_recommended_places(dest.strip()):
            trip_summary["recommended_places"].append(place)

    return trip_summary
