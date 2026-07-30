"""Test fixtures for Brevita integration tests."""

SAMPLE_POLICIES = [
    {
        "event_type": "drought",
        "location": "California Central Valley",
        "condition": "D3 drought level for 4+ consecutive weeks",
        "sources": ["https://droughtmonitor.unl.edu", "https://weather.com"],
        "payout": 5000,
    },
    {
        "event_type": "hurricane",
        "location": "Miami-Dade County, Florida",
        "condition": "Category 4+ hurricane making landfall",
        "sources": ["https://nhc.noaa.gov", "https://weather.com"],
        "payout": 10000,
    },
    {
        "event_type": "flood",
        "location": "Venice, Italy",
        "condition": "Acqua alta exceeding 140cm",
        "sources": ["https://water.weather.gov", "https://news.reuters.com"],
        "payout": 3000,
    },
    {
        "event_type": "wildfire",
        "location": "Sonoma County, California",
        "condition": "Wildfire burning more than 10,000 acres within 50km",
        "sources": ["https://fire.weather.gov", "https://calfire.ca.gov"],
        "payout": 7500,
    },
    {
        "event_type": "earthquake",
        "location": "San Francisco Bay Area",
        "condition": "Magnitude 6+ earthquake within 100km",
        "sources": ["https://earthquake.usgs.gov", "https://news.reuters.com"],
        "payout": 15000,
    },
]
