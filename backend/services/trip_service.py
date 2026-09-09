def calculate_daily_budget(budget: float, days: int) -> float:
    return budget / days


# kurs perkiraan ke USD (1 unit mata uang asal = sekian USD)
# angka perkiraan, bukan kurs real-time — cukup untuk menentukan kategori trip
USD_EXCHANGE_RATES = {
    "IDR": 1 / 15800,
    "USD": 1,
    "EUR": 1.08,
    "GBP": 1.27,
    "SGD": 1 / 1.34,
    "MYR": 1 / 4.7,
    "THB": 1 / 35,
    "PHP": 1 / 57,
    "VND": 1 / 25000,
    "JPY": 1 / 150,
    "CNY": 1 / 7.2,
    "KRW": 1 / 1350,
    "HKD": 1 / 7.8,
    "INR": 1 / 83,
    "AUD": 1 / 1.52,
    "CAD": 1 / 1.36,
    "CHF": 1.12,
    "AED": 1 / 3.6725,
}


def convert_to_usd(amount: float, currency: str) -> float:
    rate = USD_EXCHANGE_RATES.get(currency.upper(), 1)
    return amount * rate


def get_trip_category(budget: float, currency: str = "USD") -> str:
    budget_usd = convert_to_usd(budget, currency)
    if budget_usd < 1000:
        return "Backpacker"
    elif budget_usd <= 3000:
        return "Standard"
    else:
        return "Luxury"


def get_transportation_recommendation(category: str) -> str:
    if category == "Backpacker":
        return "Bus"
    elif category == "Standard":
        return "Train"
    else:
        return "Flight"


def get_travel_season(month: str) -> str:
    if month.lower() == "december":
        return "Peak Season"
    elif month.lower() == "june":
        return "Holiday Season"
    else:
        return "Regular Season"


recommendations = {
    "japan": [
        "Tokyo Tower",
        "Akihabara",
        "Ogikubo"
    ],
    "france": [
        "Eiffel Tower",
        "Louvre Museum",
        "Palace of Versailles"
    ],
    "italy": [
        "Colosseum",
        "Venice Canals",
        "Leaning Tower of Pisa"
    ],
    "switzerland": [
        "Matterhorn",
        "Lake Geneva",
        "Jungfraujoch"
    ],
    "netherlands": [
        "Rijksmuseum",
        "Keukenhof Gardens",
        "Anne Frank House"
    ]
}

def get_recommended_places(destination: str) -> list:
    return recommendations.get(
        destination.lower(),
        [
            "Main Train Station",
            "Historic Old Town", 
            "City Public Square"
        ]
    )