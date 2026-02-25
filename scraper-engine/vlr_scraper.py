import os
import json
import time
import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv

# Load environment variables
load_dotenv(dotenv_path="../.env.local")

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

# VLR.gg Headers to mimic a real browser
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
}

def supabase_request(method, endpoint, payload=None):
    """Helper to interact with Supabase REST API directly to avoid Python SDK proxy bugs"""
    if not SUPABASE_URL or not SUPABASE_KEY:
        return None
        
    url = f"{SUPABASE_URL}/rest/v1/{endpoint}"
    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }
    
    try:
        if method == "GET":
            response = requests.get(url, headers=headers)
        elif method == "POST":
            response = requests.post(url, headers=headers, json=payload)
        elif method == "UPSERT":
            headers["Prefer"] = "return=representation,resolution=merge-duplicates"
            response = requests.post(url, headers=headers, json=payload)
        
        if response.status_code >= 400:
            print(f"Supabase Error: {response.text}")
            return None
            
        return response.json()
    except Exception as e:
        print(f"Request Error: {e}")
        return None

def get_valorant_game_id():
    """Fetches the Valorant game ID"""
    data = supabase_request("GET", "games?slug=eq.valorant&select=id")
    if data and len(data) > 0:
        return data[0]['id']
    return None

def generate_slug(name):
    """Generates a simple text slug"""
    import re
    slug = name.lower()
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    return slug.strip('-')

def fetch_vlr_matches():
    """Scrapes upcoming and live matches from VLR.gg"""
    print("🔍 Fetching matches from VLR.gg...")
    url = "https://www.vlr.gg/matches"
    
    try:
        response = requests.get(url, headers=HEADERS)
        if response.status_code != 200:
            print(f"❌ Failed to fetch VLR.gg. Status: {response.status_code}")
            return []
    except Exception as e:
        print(f"❌ Connection error: {e}")
        return []
        
    soup = BeautifulSoup(response.text, "html.parser")
    match_cards = soup.find_all("a", class_="match-item")
    
    matches_data = []
    
    count = 0
    for card in match_cards:
        if count >= 6:  # Let's just process 6 matches for testing
            break
            
        try:
            # 1. Teams
            teams = card.find_all("div", class_="match-item-vs-team-name")
            team1 = teams[0].text.strip() if len(teams) > 0 else "TBD"
            team2 = teams[1].text.strip() if len(teams) > 1 else "TBD"
            
            if team1 == "TBD" and team2 == "TBD":
                continue
                
            # 2. Tournament / Event
            event_elem = card.find("div", class_="match-item-event")
            event_name = event_elem.text.strip().split("\n")[0].strip() if event_elem else "Unknown Event"
            
            # 3. Status (Live, Upcoming)
            status_elem = card.find("div", class_="ml-status")
            status_text = status_elem.text.strip().lower() if status_elem else ""
            status = "live" if "live" in status_text else "upcoming"
            
            # 4. ETA / Time
            time_elem = card.find("div", class_="match-item-time")
            match_time = time_elem.text.strip() if time_elem else ""
            
            matches_data.append({
                "team1": team1,
                "team2": team2,
                "event": event_name,
                "status": status,
                "time": match_time
            })
            count += 1
            
        except Exception as e:
            continue
            
    return matches_data

def sync_to_supabase(matches):
    """Pushes scraped match data to Supabase using REST API"""
    if not matches:
        print("No matches to sync.")
        return
        
    print(f"✅ Found {len(matches)} matches. Syncing to Supabase via REST...")
    
    val_id = get_valorant_game_id()
    if not val_id:
        print("⚠️ Warning: Valorant game not found in DB. Are you sure you ran seed.sql?")
        return
        
    # Process each match
    for match in matches:
        print(f"🔄 Processing: {match['team1']} vs {match['team2']} ({match['event']})")
        
        # 1. Upsert Tournament
        tourney_slug = generate_slug(match['event'])
        tourney_payload = {
            "game_id": val_id,
            "name": match['event'],
            "slug": tourney_slug,
            "status": match['status']
        }
        tourney_res = supabase_request("UPSERT", "tournaments", [tourney_payload])
        if not tourney_res: continue
        tourney_id = tourney_res[0]['id']
        
        # 2. Upsert Teams
        team1_slug = generate_slug(match['team1'])
        team2_slug = generate_slug(match['team2'])
        
        team1_res = supabase_request("UPSERT", "teams", [{"name": match['team1'], "slug": team1_slug}])
        team2_res = supabase_request("UPSERT", "teams", [{"name": match['team2'], "slug": team2_slug}])
        
        if not team1_res or not team2_res: continue
        team1_id = team1_res[0]['id']
        team2_id = team2_res[0]['id']
        
        # 3. Insert Match Record
        match_payload = {
            "tournament_id": tourney_id,
            "team1_id": team1_id,
            "team2_id": team2_id,
            "round": "Scraped Match",
        }
        
        # Supabase doesn't have a unique constraint on matches by default, 
        # so we'll just insert it as a proof of concept.
        supabase_request("POST", "matches", [match_payload])
        
    print("\n✅ Sync Complete! Data successfully inserted via REST.")

if __name__ == "__main__":
    print("🚀 Starting VLR.gg Scraper Pipeline (REST API version)...")
    matches = fetch_vlr_matches()
    sync_to_supabase(matches)
    print("🏁 Pipeline run finished.")
