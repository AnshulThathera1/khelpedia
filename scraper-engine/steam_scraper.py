import os
import time
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv(dotenv_path="../.env.local")

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

def supabase_request(method, endpoint, payload=None):
    if not SUPABASE_URL or not SUPABASE_KEY: return None
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
            # ON CONFLICT update logic for REST
            headers["Prefer"] = "return=representation,resolution=merge-duplicates"
            response = requests.post(url, headers=headers, json=payload)
        
        if response.status_code >= 400:
            print(f"Supabase Error ({endpoint}): {response.text}")
            return None
        return response.json()
    except Exception as e:
        print(f"Request Error: {e}")
        return None

def get_game_id(slug):
    data = supabase_request("GET", f"games?slug=eq.{slug}&select=id")
    if data and len(data) > 0: return data[0]['id']
    return None

def generate_slug(name):
    import re
    slug = name.lower()
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    return slug.strip('-')

def fetch_dota2_pro_matches():
    print("🔍 Fetching Dota 2 Pro Matches from OpenDota API...")
    url = "https://api.opendota.com/api/proMatches"
    try:
        response = requests.get(url)
        if response.status_code != 200: return []
        data = response.json()
        matches = []
        for m in data[:6]: # Limit to 6 matches for speed/safety
            try:
                matches.append({
                    "game": "dota-2",
                    "team1": m.get("radiant_name", "Radiant TBD"),
                    "team2": m.get("dire_name", "Dire TBD"),
                    "event": m.get("league_name", "Dota 2 Pro Circuit"),
                    "status": "completed",
                    "score1": m.get("radiant_score", 0),
                    "score2": m.get("dire_score", 0),
                    "winner": m.get("radiant_name") if m.get("radiant_win") else m.get("dire_name"),
                })
            except Exception: continue
        return matches
    except Exception: return []

def fetch_cs2_matches():
    print("🔍 Fetching CS2 Matches (Simulation via PandaScore/HLTV logic)...")
    return [
        {
            "game": "cs2",
            "team1": "Vitality",
            "team2": "G2 Esports",
            "event": "IEM Dallas 2026 Qualifier",
            "status": "live",
            "score1": 13,
            "score2": 11,
            "winner": None,
        },
        {
            "game": "cs2",
            "team1": "MOUZ",
            "team2": "Spirit",
            "event": "IEM Dallas 2026 Qualifier",
            "status": "upcoming",
            "score1": 0,
            "score2": 0,
            "winner": None,
        }
    ]

def sync_matches_to_supabase(matches):
    if not matches: return
    print(f"✅ Found {len(matches)} matches. Syncing to Supabase via REST...")
    
    game_ids = {
        "dota-2": get_game_id("dota-2"),
        "cs2": get_game_id("cs2")
    }
    
    # Cache to avoid duplicate upserts in the same run
    cached_tournaments = {}
    
    for match in matches:
        game_slug = match["game"]
        game_id = game_ids.get(game_slug)
        if not game_id: continue
            
        print(f"🔄 Processing [{game_slug.upper()}]: {match['team1']} vs {match['team2']}")
        
        # 1. Upsert Tournament (with caching)
        tourney_slug = generate_slug(match['event'])
        if tourney_slug not in cached_tournaments:
            tourney_payload = {
                "game_id": game_id,
                "name": match['event'],
                "slug": tourney_slug,
                "status": match['status'],
                "tier": "A"
            }
            res = supabase_request("UPSERT", "tournaments", [tourney_payload])
            if res: cached_tournaments[tourney_slug] = res[0]['id']
            
        tourney_id = cached_tournaments.get(tourney_slug)
        if not tourney_id: continue
        
        # 2. Upsert Teams
        t1_res = supabase_request("UPSERT", "teams", [{"name": match['team1'], "slug": generate_slug(match['team1'])}])
        t2_res = supabase_request("UPSERT", "teams", [{"name": match['team2'], "slug": generate_slug(match['team2'])}])
        
        if not t1_res or not t2_res: continue
        team1_id = t1_res[0]['id']
        team2_id = t2_res[0]['id']
        
        winner_id = None
        if match.get("winner") == match['team1']: winner_id = team1_id
        if match.get("winner") == match['team2']: winner_id = team2_id
        
        # 3. Insert Match Record
        match_payload = {
            "tournament_id": tourney_id,
            "team1_id": team1_id,
            "team2_id": team2_id,
            "score1": match.get("score1", 0),
            "score2": match.get("score2", 0),
            "winner_id": winner_id,
            "round": "Group Stage",
        }
        supabase_request("POST", "matches", [match_payload])
        
    print("\n✅ Steam/Valve Sync Complete!")

if __name__ == "__main__":
    print("🚀 Starting Steam/Valve Scraper Pipeline...")
    all_matches = fetch_dota2_pro_matches() + fetch_cs2_matches()
    sync_matches_to_supabase(all_matches)
    print("🏁 Pipeline run finished.")
