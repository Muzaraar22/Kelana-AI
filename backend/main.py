import sys
import time

def print_trip_summary(
        destination: str, country: str, days: int, 
        budget: float, currency: str, travel_month: str) -> None:
    print("="*30)
    print("KelanaAI")
    print("="*30)
    print(f"Destination: {destination}")
    print(f"Country: {country}")
    print(f"Days: {days}")
    print(f"Budget: {budget} {currency}")
    print(f"Travel Month: {travel_month}")

def get_input() -> any:
    print("="*30)
    print("Masukkan Rencana Destinasimu - KelanaAI")
    print("="*30)

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
    return hasil_input

def main():
    destination, country, days, budget, currency, travel_month = get_input()
    print_trip_summary(destination, country, days, budget, currency, travel_month)

input_list = {
    "Destination:   ": str,
    "Country:       ": str,
    "Days:          ": int,
    "Budget:        ": float,
    "Currency:      ": str,
    "Travel Month:  ": str
}

main()