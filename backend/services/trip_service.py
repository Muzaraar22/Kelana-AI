def calculate_daily_budget(budget: float, days: int) -> float:
    return budget / days


def get_trip_category(budget: float) -> str:
    if budget < 1000:
        return "Backpacker"
    elif budget <= 3000:
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


def get_recommended_places(destination: str) -> list:
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

    return recommendations.get(
        destination.lower(),
        [
            "Main Train Station",
            "Historic Old Town", 
            "City Public Square"
        ]
    )