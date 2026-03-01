import os
import re
import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
# Look for .env.local in the current directory or parent
if os.path.exists(".env.local"):
    load_dotenv(dotenv_path=".env.local")
elif os.path.exists("../.env.local"):
    load_dotenv(dotenv_path="../.env.local")
else:
    load_dotenv() # Fallback to standard

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
}

def supabase_request(method, endpoint, payload=None):
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

def generate_slug(name):
    slug = name.lower()
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    return slug.strip('-')

def parse_dates(date_str):
    """
    Parses dates like 'Feb 25—Mar 2' or 'Mar 14—16'
    Returns (start_date, end_date) in YYYY-MM-DD
    """
    current_year = 2026 # Contextually assumed from user input
    try:
        # Example: Feb 25—Mar 2
        if "—" in date_str:
            parts = date_str.split("—")
            start_part = parts[0].strip()
            end_part = parts[1].strip()

            # Case: Mar 14—16
            if len(end_part) <= 2:
                # Extract month from start_part
                month = start_part.split(" ")[0]
                end_date_str = f"{month} {end_part} {current_year}"
            else:
                end_date_str = f"{end_part} {current_year}"
            
            start_date_str = f"{start_part} {current_year}"
            
            start_dt = datetime.strptime(start_date_str, "%b %d %Y")
            end_dt = datetime.strptime(end_date_str, "%b %d %Y")
            
            return start_dt.strftime("%Y-%m-%d"), end_dt.strftime("%Y-%m-%d")
        else:
            # Single date case?
            dt = datetime.strptime(f"{date_str} {current_year}", "%b %d %Y")
            return dt.strftime("%Y-%m-%d"), dt.strftime("%Y-%m-%d")
    except Exception as e:
        print(f"Date Parse Error ({date_str}): {e}")
        return None, None

def scrape_vlr_tournaments(tier="all", region="all"):
    print(f"🔍 Scraping VLR.gg Tournaments (tier={tier}, region={region})...")
    url = f"https://www.vlr.gg/events/?tier={tier}&region={region}"
    
    try:
        response = requests.get(url, headers=HEADERS)
        if response.status_code != 200:
            print(f"❌ Failed to fetch VLR.gg. Status: {response.status_code}")
            return []
    except Exception as e:
        print(f"❌ Connection error: {e}")
        return []
        
    soup = BeautifulSoup(response.text, "html.parser")
    event_cards = soup.find_all("a", class_="event-item")
    
    tournaments = []
    
    for card in event_cards:
        try:
            title = card.find("div", class_="event-item-title").text.strip()
            
            status_elem = card.find("span", class_="event-item-desc-item-status")
            status = status_elem.text.strip().lower() if status_elem else "upcoming"
            
            prize_elem = card.find("div", class_="mod-prize")
            prize_text = prize_elem.contents[0].strip() if prize_elem else "0"
            # Clean prize (e.g. $4,089 -> 4089)
            prize_pool = int(re.sub(r'[^0-9]', '', prize_text)) if any(char.isdigit() for char in prize_text) else 0
            
            date_elem = card.find("div", class_="mod-dates")
            date_text = date_elem.contents[0].strip() if date_elem else ""
            start_date, end_date = parse_dates(date_text)
            
            region_elem = card.find("div", class_="mod-location")
            # Region is usually a flag class like mod-fr, mod-un
            flag_elem = region_elem.find("i", class_="flag") if region_elem else None
            region_code = flag_elem['class'][1].replace("mod-", "").upper() if flag_elem else "GLOBAL"

            thumb_elem = card.find("div", class_="event-item-thumb")
            img_elem = thumb_elem.find("img") if thumb_elem else None
            logo_url = img_elem['src'] if img_elem else None
            if logo_url and logo_url.startswith("//"):
                logo_url = "https:" + logo_url

            tournaments.append({
                "name": title,
                "status": status,
                "prize_pool": prize_pool,
                "start_date": start_date,
                "end_date": end_date,
                "region": region_code,
                "logo_url": logo_url,
                "tier_code": tier
            })
        except Exception as e:
            print(f"Error parsing card: {e}")
            continue
            
    return tournaments

def sync_tournaments():
    # 1. Get Valorant Game ID
    val_res = supabase_request("GET", "games?slug=eq.valorant&select=id")
    if not val_res:
        print("❌ Valorant game not found in DB.")
        return
    game_id = val_res[0]['id']

    # 2. Scrape main tiers
    tiers = ["60", "61", "62", "63"] # VCT, VCL, T3, GC
    all_tournaments = []
    for t in tiers:
        tourneys = scrape_vlr_tournaments(tier=t)
        all_tournaments.extend(tourneys)

    print(f"✅ Scraped {len(all_tournaments)} tournaments total.")

    for t in all_tournaments:
        slug = generate_slug(t['name'])
        
        # 3. Check if tournament is manually locked
        existing = supabase_request("GET", f"tournaments?slug=eq.{slug}&select=id,is_custom")
        if existing and len(existing) > 0 and existing[0].get('is_custom'):
            print(f"⏩ Skipping {t['name']} (Manually Locked)")
            continue

        # Map VLR tiers to local tier letters
        tier_map = {"60": "S", "61": "A", "62": "B", "63": "C"}
        local_tier = tier_map.get(t['tier_code'], "B")

        payload = {
            "game_id": game_id,
            "name": t['name'],
            "slug": slug,
            "region": t['region'],
            "status": t['status'],
            "prize_pool": t['prize_pool'],
            "start_date": t['start_date'],
            "end_date": t['end_date'],
            "tier": local_tier,
            "logo_url": t['logo_url'],
            "currency": "USD"
        }
        
        print(f"🔄 Syncing: {t['name']} ({local_tier})")
        supabase_request("UPSERT", "tournaments", [payload])

if __name__ == "__main__":
    sync_tournaments()
