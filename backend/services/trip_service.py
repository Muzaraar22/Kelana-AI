def calculate_daily_budget(budget: float, days: int) -> float:
    return budget / days


# kurs perkiraan ke USD (1 unit mata uang asal = sekian USD)
USD_EXCHANGE_RATES = {
    "USD": 1,
    "IDR": 1 / 15800,
    "EUR": 1.08,
    "GBP": 1.27,
    "JPY": 1 / 150,
    "SGD": 1 / 1.34,
    "MYR": 1 / 4.7,
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