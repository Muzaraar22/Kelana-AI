import sys
import time
from services.trip_service import (
    get_trip_category,
    get_transportation_recommendation,
    get_travel_season,
    get_recommended_places,
    calculate_daily_budget
)

def print_trip_summary(
        destination: str, days: int, budget: float, 
        currency: str, travel_month: str) -> None:
    print("="*30)
    print("KelanaAI")
    print("="*30)
    print(f"Destination     : {destination}")
    print(f"Days            : {days}")
    print(f"Budget          : {budget} {currency}")
    print(f"Category        : {get_trip_category(budget)}")
    print(f"Daily Budget    : {calculate_daily_budget(budget, days)} {currency}")
    print(f"Transportation Recommendation: {get_transportation_recommendation(get_trip_category(budget))}")
    print(f"Travel Month    : {travel_month}")
    print(f"Travel Season   : {get_travel_season(travel_month)}")
    print(f"\nRecommended Places: ")
    for dest in destination.split(","): # enaknya digabung terus jadiin set dulu sih
        for place in get_recommended_places(dest.strip()):
            print(f"  - {place}")

def get_input() -> list:
    print("="*40)
    print("Masukkan Rencana Destinasimu - KelanaAI")
    print("="*40)

    hasil_input = []

    for input_req, input_type in input_list.items():
        while True:
            try:
                user_input = input_type(input(input_req))
                hasil_input.append(user_input)
                break  

            except ValueError:
                print(f"Input tidak valid. Harap masukkan {input_type.__name__}.")
                time.sleep(1)
                sys.stdout.write("\033[A\033[K\033[A\033[K") 
                sys.stdout.flush()

    print("\n"*2)

    hasil_input[0] = ", ".join([dest.strip() for dest in hasil_input[0].split(",")])
    return hasil_input

def main():
    destination, days, budget, currency, travel_month = get_input()
    print_trip_summary(destination, days, budget, currency, travel_month)

input_list = {
    "Destination (use ',' for multiple destinations): ": str,
    "Days:          ": int,
    "Budget:        ": float,
    "Currency:      ": str,
    "Travel Month:  ": str
}

main()