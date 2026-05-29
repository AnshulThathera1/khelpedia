import os
import re
import time
import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
if os.path.exists(".env.local"):
    load_dotenv(dotenv_path=".env.local")
elif os.path.exists("../.env.local"):
    load_dotenv(dotenv_path="../.env.local")
else:
    load_dotenv()

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

HEADERS = {
    "User-Agent": "KhelPediA-Bot/1.0 (https://khelpedia.com; contact@khelpedia.com)",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "application/json",
}

# Liquipedia rate limit: 2.5s between requests
LIQUIPEDIA_DELAY = 2.5

# Configuration for Wikis and Pages to scrape
LIQUIPEDIA_SOURCES = [
    {
        "game_name": "BGMI",
        "game_slug": "bgmi",
        "game_genre": "Battle Royale",
        "wiki": "pubgmobile",
        "pages": ["Battlegrounds_Mobile_India"]
    },
    {
        "game_name": "PUBG Mobile",
        "game_slug": "pubg-mobile",
        "game_genre": "Battle Royale",
        "wiki": "pubgmobile",
        "pages": ["S-Tier_Tournaments", "A-Tier_Tournaments"]
    },
    {
        "game_name": "PUBG PC",
        "game_slug": "pubg-pc",
        "game_genre": "Battle Royale",
        "wiki": "pubg",
        "pages": ["S-Tier_Tournaments", "A-Tier_Tournaments"]
    }
]


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
            # We ignore 409 Conflict spam if it's handled gracefully
            if response.status_code != 409 and response.status_code != 403:
                print(f"  Supabase Error ({response.status_code}): {response.text}")
            return None
        return response.json()
    except Exception as e:
        print(f"  Request Error: {e}")
        return None


def generate_slug(name):
    slug = name.lower()
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    return slug.strip('-')


def parse_liquipedia_date(date_str):
    if not date_str:
        return None, None

    # Clean up unicode dashes and whitespace
    date_str = date_str.replace('\u2013', '-').replace('\u2014', '-').replace('\u00a0', ' ').strip()
    
    # Remove things like "Cancelled", "Postponed"
    if "Cancelled" in date_str or "Postponed" in date_str:
        return None, None

    try:
        # Case: "Aug - Oct, 2026" (month-only range)
        month_range = re.match(r'^([A-Z][a-z]+)\s*-\s*([A-Z][a-z]+),?\s*(\d{4})$', date_str)
        if month_range:
            start_month, end_month, year = month_range.groups()
            start_dt = datetime.strptime(f"{start_month} 01 {year}", "%b %d %Y")
            end_dt = datetime.strptime(f"{end_month} 28 {year}", "%b %d %Y")
            return start_dt.strftime("%Y-%m-%d"), end_dt.strftime("%Y-%m-%d")

        # Case: "Oct, 2026" (single month)
        single_month = re.match(r'^([A-Z][a-z]+),?\s*(\d{4})$', date_str)
        if single_month:
            month, year = single_month.groups()
            dt = datetime.strptime(f"{month} 01 {year}", "%b %d %Y")
            return dt.strftime("%Y-%m-%d"), dt.strftime("%Y-%m-%d")

        # Case: "Oct 31 - Nov 02, 2025" (cross-month range)
        cross_month = re.match(r'^([A-Z][a-z]+)\s+(\d{1,2})\s*-\s*([A-Z][a-z]+)\s+(\d{1,2}),?\s*(\d{4})$', date_str)
        if cross_month:
            sm, sd, em, ed, year = cross_month.groups()
            start_dt = datetime.strptime(f"{sm} {sd} {year}", "%b %d %Y")
            end_dt = datetime.strptime(f"{em} {ed} {year}", "%b %d %Y")
            return start_dt.strftime("%Y-%m-%d"), end_dt.strftime("%Y-%m-%d")

        # Case: "Mar 12-29, 2026" or "Jun 09-21, 2026" (same-month range)
        same_month = re.match(r'^([A-Z][a-z]+)\s+(\d{1,2})\s*-\s*(\d{1,2}),?\s*(\d{4})$', date_str)
        if same_month:
            month, sd, ed, year = same_month.groups()
            start_dt = datetime.strptime(f"{month} {sd} {year}", "%b %d %Y")
            end_dt = datetime.strptime(f"{month} {ed} {year}", "%b %d %Y")
            return start_dt.strftime("%Y-%m-%d"), end_dt.strftime("%Y-%m-%d")

    except Exception as e:
        # Ignore unparseable dates silently
        pass

    return None, None


def parse_prize_pool(text):
    if not text:
        return 0
    digits = re.sub(r'[^0-9]', '', text)
    return int(digits) if digits else 0


def scrape_liquipedia_page(wiki, page_name):
    """
    Fetches a Liquipedia page via MediaWiki API and parses
    all `.tournaments-listing` tables.
    """
    print(f"  Fetching Liquipedia {wiki} / {page_name}...")
    api_url = f"https://liquipedia.net/{wiki}/api.php"
    params = {
        "action": "parse",
        "page": page_name,
        "prop": "text",
        "format": "json"
    }

    try:
        response = requests.get(api_url, headers=HEADERS, params=params)
        time.sleep(LIQUIPEDIA_DELAY)
        
        if response.status_code != 200:
            print(f"  Failed to fetch Liquipedia. Status: {response.status_code}")
            return []
    except Exception as e:
        print(f"  Connection error: {e}")
        return []

    data = response.json()
    html_content = data.get("parse", {}).get("text", {}).get("*", "")

    if not html_content:
        print(f"  No HTML content received for {page_name}.")
        return []

    soup = BeautifulSoup(html_content, "html.parser")
    tournament_tables = soup.find_all("div", class_="tournaments-listing")
    
    all_tournaments = []

    for table_div in tournament_tables:
        table = table_div.find("table")
        if not table:
            continue

        rows = table.find_all("tr", class_=re.compile(r"table2__row--body"))

        for row in rows:
            try:
                cells = row.find_all("td")
                if len(cells) < 7:
                    continue

                # 1. Tier
                tier_cell = cells[0]
                tier_text = tier_cell.get_text(strip=True)
                tier_map = {
                    "S-Tier": "S", "A-Tier": "A", "B-Tier": "B", "C-Tier": "C",
                    "S": "S", "A": "A", "B": "B", "C": "C"
                }
                tier = tier_map.get(tier_text, "B")

                # 2. Tournament name
                name_cell = row.find("td", class_="column__tournament")
                if not name_cell:
                    name_cell = cells[2] if len(cells) > 2 else None
                if not name_cell:
                    continue

                tournament_name = name_cell.get_text(strip=True)
                if not tournament_name:
                    continue

                detail_link = name_cell.find("a")
                detail_url = None
                if detail_link and detail_link.get("href"):
                    detail_url = f"https://liquipedia.net{detail_link['href']}"

                # 3. Date
                date_cell = cells[3] if len(cells) > 3 else None
                date_text = date_cell.get_text(strip=True) if date_cell else ""
                start_date, end_date = parse_liquipedia_date(date_text)

                # 4. Prize Pool
                prize_cell = cells[4] if len(cells) > 4 else None
                prize_text = prize_cell.get_text(strip=True) if prize_cell else ""
                prize_pool = parse_prize_pool(prize_text)

                # 5. Location
                location_cell = cells[5] if len(cells) > 5 else None
                location = location_cell.get_text(strip=True) if location_cell else "Global"

                # 6. Participants count
                participants_cell = cells[6] if len(cells) > 6 else None
                participants_text = participants_cell.get_text(strip=True) if participants_cell else ""
                participants = int(participants_text) if participants_text.isdigit() else 0

                # 7. Winner / Runner-up
                placement_cells = row.find_all("td", class_="column__placement")
                winner_name = None
                runner_up_name = None

                if len(placement_cells) >= 1:
                    winner_span = placement_cells[0].find("span", class_="name")
                    if winner_span:
                        winner_link = winner_span.find("a")
                        winner_name = (winner_link or winner_span).get_text(strip=True)
                        if winner_name == "TBD": winner_name = None

                if len(placement_cells) >= 2:
                    runner_span = placement_cells[1].find("span", class_="name")
                    if runner_span:
                        runner_link = runner_span.find("a")
                        runner_up_name = (runner_link or runner_span).get_text(strip=True)
                        if runner_up_name == "TBD": runner_up_name = None

                status = "upcoming"
                today = datetime.now().strftime("%Y-%m-%d")
                if end_date and end_date < today:
                    status = "completed"
                elif start_date and start_date <= today and (not end_date or end_date >= today):
                    status = "live"

                tournament_data = {
                    "name": tournament_name,
                    "tier": tier,
                    "start_date": start_date,
                    "end_date": end_date,
                    "prize_pool": prize_pool,
                    "region": location,
                    "status": status,
                    "participants": participants,
                    "winner": winner_name,
                    "runner_up": runner_up_name,
                    "detail_url": detail_url
                }

                all_tournaments.append(tournament_data)

            except Exception as e:
                continue

    print(f"  -> Scraped {len(all_tournaments)} tournaments.")
    return all_tournaments


def sync_liquipedia():
    """Main sync function for all configured Liquipedia sources."""
    print("=" * 60)
    print("  LIQUIPEDIA SCRAPER - BGMI, PUBG Mobile, PUBG PC")
    print("=" * 60)

    for source in LIQUIPEDIA_SOURCES:
        game_name = source["game_name"]
        game_slug = source["game_slug"]
        print(f"\nProcessing {game_name}...")

        # 1. Ensure game exists
        game_payload = {
            "name": game_name,
            "slug": game_slug,
            "genre": source["game_genre"],
            "description": f"{game_name} esports tournaments from Liquipedia."
        }
        
        # We try to use ?on_conflict to avoid spamming errors if slug exists
        game_res = supabase_request("UPSERT", "games?on_conflict=slug", [game_payload])
        
        game_id = None
        if game_res and len(game_res) > 0:
            game_id = game_res[0].get("id")
        else:
            existing = supabase_request("GET", f"games?slug=eq.{game_slug}&select=id")
            if existing and len(existing) > 0:
                game_id = existing[0]["id"]

        if not game_id:
            print(f"  Failed to find/create {game_name}. Skipping.")
            continue

        # 2. Scrape all pages for this game
        all_tournaments = []
        for page_name in source["pages"]:
            tournaments = scrape_liquipedia_page(source["wiki"], page_name)
            all_tournaments.extend(tournaments)

        # 3. Sync to Supabase
        synced_count = 0
        for t in all_tournaments:
            slug = generate_slug(t["name"])

            existing = supabase_request("GET", f"tournaments?slug=eq.{slug}&select=id,is_custom")
            if existing and len(existing) > 0 and existing[0].get("is_custom"):
                continue

            payload = {
                "game_id": game_id,
                "name": t["name"],
                "slug": slug,
                "region": t["region"],
                "status": t["status"],
                "prize_pool": t["prize_pool"],
                "start_date": t["start_date"],
                "end_date": t["end_date"],
                "tier": t["tier"],
                "currency": "USD"
            }

            tourney_res = supabase_request("UPSERT", "tournaments?on_conflict=slug", [payload])
            tourney_id = None
            if tourney_res and len(tourney_res) > 0:
                tourney_id = tourney_res[0].get("id")
            else:
                existing_t = supabase_request("GET", f"tournaments?slug=eq.{slug}&select=id")
                if existing_t and len(existing_t) > 0:
                    tourney_id = existing_t[0]["id"]

            if not tourney_id:
                continue

            synced_count += 1

            if t.get("winner"):
                _sync_team_placement(tourney_id, t["winner"], 1)
            if t.get("runner_up"):
                _sync_team_placement(tourney_id, t["runner_up"], 2)

        print(f"  -> Synced {synced_count} {game_name} tournaments.")


def _sync_team_placement(tourney_id, team_name, placement):
    team_slug = generate_slug(team_name)
    team_payload = {"name": team_name, "slug": team_slug, "region": "Global"}
    
    team_res = supabase_request("UPSERT", "teams?on_conflict=slug", [team_payload])
    team_id = None
    if team_res and len(team_res) > 0:
        team_id = team_res[0].get("id")
    else:
        existing = supabase_request("GET", f"teams?slug=eq.{team_slug}&select=id")
        if existing and len(existing) > 0:
            team_id = existing[0]["id"]

    if team_id:
        tt_payload = {
            "tournament_id": tourney_id,
            "team_id": team_id,
            "placement": placement,
        }
        # Ignore error here since RLS might block inserts for teams if they exist
        supabase_request("UPSERT", "tournament_teams?on_conflict=tournament_id,team_id", [tt_payload])


if __name__ == "__main__":
    sync_liquipedia()
