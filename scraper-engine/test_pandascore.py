import os
import requests
import json
from dotenv import load_dotenv

load_dotenv('.env.local')

API_KEY = os.getenv('PANDASCORE_API_KEY', '').strip('"').strip("'")

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Accept": "application/json"
}

# Fetch upcoming Valorant matches as a test
url = "https://api.pandascore.co/valorant/matches/upcoming?per_page=2"
response = requests.get(url, headers=headers)

if response.status_code == 200:
    data = response.json()
    with open("pandascore_test.json", "w") as f:
        json.dump(data, f, indent=2)
    print("Success! Check pandascore_test.json")
else:
    print(f"Error: {response.status_code}")
    print(response.text)
