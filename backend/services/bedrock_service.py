import os
import boto3
from dotenv import load_dotenv

load_dotenv()


AWS_BEARER_TOKEN_BEDROCK: str | None = os.getenv("AWS_BEARER_TOKEN_BEDROCK")
MODEL_ID: str = os.getenv("MODEL_ID", "amazon.nova-lite-v1:0")

TRAVEL_PLANNER_PROMPT = (
    """
    [ROLE]
    You are KelanaAI, an expert local travel planner. Your expertise lies in designing realistic, highly detailed, and logically sequenced daily travel itineraries tailored to a traveler's budget and style.

    [CONTEXT]
    The traveler needs a comprehensive itinerary based on these parameters:
    - Destination: {destination}
    - Duration: {duration} days
    - Total Budget: {budget} {currency}
    - Daily Budget: {daily_budget} {currency}
    - Travel Category/Style: {category}
    - Traveler Type: {travel_style}

    [INSTRUCTIONS]
    Design a day-by-day structured daily plan for the entire {duration}-day trip. For EVERY single day, you must break down the schedule into exactly three periods, adhering strictly to these requirements:

    1. Morning Activities:
       - Provide EXACTLY 2 to 3 specific activities to kickstart the day.
       - Focus on breakfast spots, morning walks, or early-access attractions that match the {category} vibe.
    
    2. Afternoon Activities:
       - You MUST include specific cultural sites (e.g., museums, historical landmarks, temples, or heritage neighborhoods).
       - Blend these sites with engaging, authentic local experiences (e.g., local markets, workshops, or traditional street exploration).
    
    3. Evening Activities:
       - Provide actionable dinner spots (name specific restaurants, street food hubs, or local dining districts).
       - Include nightlife or evening entertainment (e.g., night markets, live music, theater, or relaxed evening strolls) appropriate for the {category} budget.

    [CONSTRAINTS]
    - Geography: Ensure activities on the same day are geographically close. Minimize transit time.
    - Budget: Do not recommend luxury experiences if the budget is "backpacker/budget", and vice versa. Keep daily expenses near the {daily_budget} {currency} limit.
    - Traveler Type: Tailor activity choices to a {travel_style} traveler (e.g., kid-friendly pacing for Family, romantic settings for Couple, flexible/social spots for Solo).
    - Specificity: NO generic advice (e.g., "visit a museum"). Name the actual museum, restaurant, or landmark (e.g., "Visit the Uffizi Gallery").

    [FORMAT]
    You must return the itinerary strictly using the markdown format below. Do not add introductory or concluding conversational text.

    Day 1: [Insert Catchy Daily Theme]
    Morning:
    - [Specific Activity 1: Name and brief detail]
    - [Specific Activity 2: Name and brief detail]
    - [Optional Specific Activity 3]

    Afternoon:
    - [Cultural Site: Name and why to visit]
    - [Local Experience: Name and what to do]

    Evening:
    - [Dinner Spot: Specific name and cuisine]
    - [Nightlife/Entertainment: Specific name or activity]

    [Repeat this exact structure for Day 2 to Day {duration}]
    """
)

def get_bedrock_client():
    """
    Build and return a boto3 Bedrock Runtime client.

    Authentication uses the inline Bedrock API key stored in
    AWS_BEARER_TOKEN_BEDROCK. boto3 accepts this through the
    "aws_bearer_token'' token provider introduced in botocore 1.35+.
    """

    if not AWS_BEARER_TOKEN_BEDROCK:
        raise ValueError(
            "AWS_BEARER_TOKEN_BEDROCK is not set. "
            "Check your .env file."
        )

    client = boto3.client(
        service_name="bedrock-runtime",
        region_name=os.getenv("AWS_REGION"),
    )
    return client

def generate_ai_recommendation(trip):
    prompt = TRAVEL_PLANNER_PROMPT.format(
        destination=trip.destination,
        duration=trip.days,
        budget=trip.budget,
        currency=trip.currency,
        category=trip.category,
        daily_budget=trip.daily_budget,
        travel_style=trip.travel_style or "Solo"
    )

    client = get_bedrock_client()

    response = client.converse(
        modelId=os.getenv("MODEL_ID"),
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "text": prompt
                    }
                ]
            }
        ]
    )

    ai_response = response["output"]["message"]["content"][0]["text"]
    return ai_response
