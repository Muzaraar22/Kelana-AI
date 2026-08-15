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


# def print_trip_summary(
#         destination: str, days: int, budget: float, 
#         currency: str, travel_month: str) -> None:
#     print("="*30)
#     print("KelanaAI")
#     print("="*30)
#     print(f"Destination     : {destination}")
#     print(f"Days            : {days}")
#     print(f"Budget          : {budget} {currency}")
#     print(f"Category        : {get_trip_category(budget)}")
#     print(f"Daily Budget    : {calculate_daily_budget(budget, days)} {currency}")
#     print(f"Transportation Recommendation: {get_transportation_recommendation(get_trip_category(budget))}")
#     print(f"Travel Month    : {travel_month}")
#     print(f"Travel Season   : {get_travel_season(travel_month)}")
#     print(f"\nRecommended Places: ")
#     for dest in destination.split(","): # enaknya digabung terus jadiin set dulu sih
#         for place in get_recommended_places(dest.strip()):
#             print(f"  - {place}")

# def get_input() -> list:
#     print("="*40)
#     print("Masukkan Rencana Destinasimu - KelanaAI")
#     print("="*40)

#     hasil_input = []

#     for input_req, input_type in input_list.items():
#         while True:
#             try:
#                 user_input = input_type(input(input_req))
#                 hasil_input.append(user_input)
#                 break  

#             except ValueError:
#                 print(f"Input tidak valid. Harap masukkan {input_type.__name__}.")
#                 time.sleep(1)
#                 sys.stdout.write("\033[A\033[K\033[A\033[K") 
#                 sys.stdout.flush()

#     print("\n"*2)

#     hasil_input[0] = ", ".join([dest.strip() for dest in hasil_input[0].split(",")])
#     return hasil_input

# def main():
#     destination, days, budget, currency, travel_month = get_input()
#     print_trip_summary(destination, days, budget, currency, travel_month)

# input_list = {
#     "Destination (use ',' for multiple destinations): ": str,
#     "Days:          ": int,
#     "Budget:        ": float,
#     "Currency:      ": str,
#     "Travel Month:  ": str
# }

# main()