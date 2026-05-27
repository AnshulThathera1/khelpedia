import os
import re
import time
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
    load_dotenv()  # Fallback to standard

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("NEXT_PUBLIC_SUPABASE_ANON_KEY")

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
}

# How many tournaments to drill into for detail scraping per run
MAX_DETAIL_SCRAPE = 25


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
    Parses dates like 'Feb 25-Mar 2' or 'Mar 14-16'
    Returns (start_date, end_date) in YYYY-MM-DD
    """
    current_year = datetime.now().year
    try:
        # Normalize dashes
        date_str = date_str.replace("\u2014", "-").replace("\u2013", "-")
        if "-" in date_str:
            parts = date_str.split("-")
            start_part = parts[0].strip()
            end_part = parts[1].strip()

            # Case: Mar 14-16
            if len(end_part) <= 2:
                month = start_part.split(" ")[0]
                end_date_str = f"{month} {end_part} {current_year}"
            else:
                end_date_str = f"{end_part} {current_year}"

            start_date_str = f"{start_part} {current_year}"

            start_dt = datetime.strptime(start_date_str, "%b %d %Y")
            end_dt = datetime.strptime(end_date_str, "%b %d %Y")

            return start_dt.strftime("%Y-%m-%d"), end_dt.strftime("%Y-%m-%d")
        else:
            dt = datetime.strptime(f"{date_str} {current_year}", "%b %d %Y")
            return dt.strftime("%Y-%m-%d"), dt.strftime("%Y-%m-%d")
    except Exception as e:
        print(f"Date Parse Error ({date_str}): {e}")
        return None, None


# ============================================================
# PHASE 1: Scrape tournament listing (basic metadata + URLs)
# ============================================================
def scrape_vlr_tournaments(tier="all", region="all"):
    print(f"  Scraping VLR.gg Tournaments (tier={tier}, region={region})...")
    url = f"https://www.vlr.gg/events/?tier={tier}&region={region}"

    try:
        response = requests.get(url, headers=HEADERS)
        if response.status_code != 200:
            print(f"  Failed to fetch VLR.gg. Status: {response.status_code}")
            return []
    except Exception as e:
        print(f"  Connection error: {e}")
        return []

    soup = BeautifulSoup(response.text, "html.parser")
    event_cards = soup.find_all("a", class_="event-item")

    tournaments = []

    for card in event_cards:
        try:
            title = card.find("div", class_="event-item-title").text.strip()

            # Extract the VLR event URL
            event_href = card.get("href", "")
            event_url = f"https://www.vlr.gg{event_href}" if event_href else None

            status_elem = card.find("span", class_="event-item-desc-item-status")
            status = status_elem.text.strip().lower() if status_elem else "upcoming"

            prize_elem = card.find("div", class_="mod-prize")
            prize_text = prize_elem.contents[0].strip() if prize_elem else "0"
            prize_pool = int(re.sub(r'[^0-9]', '', prize_text)) if any(char.isdigit() for char in prize_text) else 0

            date_elem = card.find("div", class_="mod-dates")
            date_text = date_elem.contents[0].strip() if date_elem else ""
            start_date, end_date = parse_dates(date_text)

            region_elem = card.find("div", class_="mod-location")
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
                "tier_code": tier,
                "vlr_url": event_url
            })
        except Exception as e:
            print(f"Error parsing card: {e}")
            continue

    return tournaments


# ============================================================
# PHASE 2: Scrape tournament detail page (teams + matches)
# ============================================================
def scrape_tournament_detail(event_url):
    """
    Drills into a VLR.gg tournament detail page and extracts:
    1. Participating teams with placements and prize won
    2. Match results from bracket items with scores
    """
    result = {"teams": [], "matches": []}

    try:
        response = requests.get(event_url, headers=HEADERS)
        if response.status_code != 200:
            print(f"    Failed to fetch detail page. Status: {response.status_code}")
            return result
    except Exception as e:
        print(f"    Connection error for detail page: {e}")
        return result

    soup = BeautifulSoup(response.text, "html.parser")

    # --- Extract Teams from Prize Distribution / Standings Table ---
    standings_table = soup.find("div", class_="wf-ptable--standings")
    if standings_table:
        rows = standings_table.find_all("div", class_="row", role="row")
        for row in rows:
            cells = row.find_all("div", class_="cell", role="cell")
            if len(cells) < 3:
                continue

            # Placement (e.g. "1st", "2nd", "3rd-4th")
            place_text = cells[0].get_text(strip=True)
            placement = None
            place_match = re.search(r'(\d+)', place_text)
            if place_match:
                placement = int(place_match.group(1))

            # Prize won (e.g. "8,000 BRL" or "-")
            prize_text = cells[1].get_text(strip=True)
            prize_won = 0
            if prize_text and prize_text != "-":
                prize_digits = re.sub(r'[^0-9]', '', prize_text)
                prize_won = int(prize_digits) if prize_digits else 0

            # Team name and link
            team_cell = cells[2]
            team_link = team_cell.find("a")
            if team_link:
                team_name_div = team_link.find("div", class_="text-of")
                team_name = team_name_div.get_text(strip=True).split("\n")[0].strip() if team_name_div else ""
                if not team_name:
                    span = team_link.find("span")
                    team_name = span.get_text(strip=True) if span else ""

                if team_name:
                    # Try to get team region from sub-div
                    region_div = team_name_div.find("div", class_="ge-text-light") if team_name_div else None
                    team_region = region_div.get_text(strip=True) if region_div else ""
                    # Clean team name if region is appended
                    if team_region and team_name.endswith(team_region):
                        team_name = team_name[:-len(team_region)].strip()

                    result["teams"].append({
                        "name": team_name,
                        "placement": placement,
                        "prize_won": prize_won,
                        "region": team_region
                    })

    # --- Extract Matches from Bracket Items ---
    bracket_items = soup.find_all("a", class_="bracket-item")
    for item in bracket_items:
        try:
            team_divs = item.find_all("div", class_="bracket-item-team")
            if len(team_divs) < 2:
                continue

            team1_div = team_divs[0]
            team2_div = team_divs[1]

            team1_name_span = team1_div.find("span")
            team2_name_span = team2_div.find("span")
            team1_name = team1_name_span.get_text(strip=True) if team1_name_span else "TBD"
            team2_name = team2_name_span.get_text(strip=True) if team2_name_span else "TBD"

            if team1_name == "TBD" and team2_name == "TBD":
                continue

            # Scores
            score1_div = team1_div.find("div", class_="bracket-item-team-score")
            score2_div = team2_div.find("div", class_="bracket-item-team-score")
            score1 = int(score1_div.get_text(strip=True)) if score1_div and score1_div.get_text(strip=True).isdigit() else 0
            score2 = int(score2_div.get_text(strip=True)) if score2_div and score2_div.get_text(strip=True).isdigit() else 0

            # Winner
            is_team1_winner = "mod-winner" in " ".join(team1_div.get("class", []))
            is_team2_winner = "mod-winner" in " ".join(team2_div.get("class", []))

            # Match date from timestamp
            status_div = item.find("div", class_="bracket-item-status")
            match_timestamp = None
            if status_div:
                utc_ts = status_div.get("data-utc-ts")
                if utc_ts:
                    try:
                        match_timestamp = datetime.utcfromtimestamp(int(utc_ts)).strftime("%Y-%m-%dT%H:%M:%SZ")
                    except:
                        pass

            # Determine round from parent bracket column label
            round_name = "Bracket"
            parent_col = item.find_parent("div", class_=re.compile(r"bracket-col"))
            if parent_col:
                label = parent_col.find("div", class_="bracket-col-label")
                if label:
                    round_name = label.get_text(strip=True)

            result["matches"].append({
                "team1": team1_name,
                "team2": team2_name,
                "score1": score1,
                "score2": score2,
                "winner": team1_name if is_team1_winner else (team2_name if is_team2_winner else None),
                "round": round_name,
                "played_at": match_timestamp
            })
        except Exception as e:
            continue

    # --- Also try to extract matches from match-item cards (non-bracket view) ---
    match_items = soup.find_all("a", class_="match-item")
    for item in match_items:
        try:
            teams = item.find_all("div", class_="match-item-vs-team-name")
            if len(teams) < 2:
                continue
            team1 = teams[0].get_text(strip=True)
            team2 = teams[1].get_text(strip=True)
            if team1 == "TBD" and team2 == "TBD":
                continue

            scores = item.find_all("div", class_="match-item-vs-team-score")
            score1 = int(scores[0].get_text(strip=True)) if len(scores) > 0 and scores[0].get_text(strip=True).isdigit() else 0
            score2 = int(scores[1].get_text(strip=True)) if len(scores) > 1 and scores[1].get_text(strip=True).isdigit() else 0

            eta_elem = item.find("div", class_="match-item-event")
            round_text = "Match"

            # Check if already captured via bracket
            already_exists = any(
                m["team1"] == team1 and m["team2"] == team2 for m in result["matches"]
            )
            if not already_exists:
                result["matches"].append({
                    "team1": team1,
                    "team2": team2,
                    "score1": score1,
                    "score2": score2,
                    "winner": team1 if score1 > score2 else (team2 if score2 > score1 else None),
                    "round": round_text,
                    "played_at": None
                })
        except:
            continue

    return result


# ============================================================
# PHASE 3: Sync everything to Supabase
# ============================================================
def sync_tournaments():
    # 1. Get Valorant Game ID
    val_res = supabase_request("GET", "games?slug=eq.valorant&select=id")
    if not val_res:
        print("Valorant game not found in DB.")
        return
    game_id = val_res[0]['id']

    # 2. Scrape main tiers
    tiers = ["60", "61", "62", "63"]  # VCT, VCL, T3, GC
    all_tournaments = []
    for t in tiers:
        tourneys = scrape_vlr_tournaments(tier=t)
        all_tournaments.extend(tourneys)

    print(f"Scraped {len(all_tournaments)} tournaments total.")

    detail_count = 0

    for t in all_tournaments:
        slug = generate_slug(t['name'])

        # 3. Check if tournament is manually locked
        existing = supabase_request("GET", f"tournaments?slug=eq.{slug}&select=id,is_custom")
        if existing and len(existing) > 0 and existing[0].get('is_custom'):
            print(f"  Skipping {t['name']} (Manually Locked)")
            continue

        # Map VLR tiers to local tier letters
        tier_map = {"60": "S", "61": "A", "62": "B", "63": "C"}
        local_tier = tier_map.get(t['tier_code'], "B")

        # Normalize status for DB constraint
        status = t['status']
        if status not in ('live', 'upcoming', 'completed'):
            status = 'upcoming'

        payload = {
            "game_id": game_id,
            "name": t['name'],
            "slug": slug,
            "region": t['region'],
            "status": status,
            "prize_pool": t['prize_pool'],
            "start_date": t['start_date'],
            "end_date": t['end_date'],
            "tier": local_tier,
            "logo_url": t['logo_url'],
            "currency": "USD"
        }

        print(f"  Syncing tournament: {t['name']} ({local_tier})")
        tourney_res = supabase_request("UPSERT", "tournaments", [payload])

        # Get tournament ID for detail syncing
        tourney_id = None
        if tourney_res and len(tourney_res) > 0:
            tourney_id = tourney_res[0].get('id')
        else:
            # Fetch existing tournament ID
            existing_t = supabase_request("GET", f"tournaments?slug=eq.{slug}&select=id")
            if existing_t and len(existing_t) > 0:
                tourney_id = existing_t[0]['id']

        # ---- PHASE 2: Drill into detail page ----
        if tourney_id and t.get('vlr_url') and detail_count < MAX_DETAIL_SCRAPE:
            detail_count += 1
            print(f"    Drilling into detail page: {t['vlr_url']}")
            detail = scrape_tournament_detail(t['vlr_url'])

            # Sync teams
            for team_data in detail["teams"]:
                team_slug = generate_slug(team_data['name'])
                # Upsert team
                team_payload = {"name": team_data['name'], "slug": team_slug}
                if team_data.get('region'):
                    team_payload["region"] = team_data['region']
                team_res = supabase_request("UPSERT", "teams", [team_payload])

                team_id = None
                if team_res and len(team_res) > 0:
                    team_id = team_res[0].get('id')
                else:
                    existing_team = supabase_request("GET", f"teams?slug=eq.{team_slug}&select=id")
                    if existing_team and len(existing_team) > 0:
                        team_id = existing_team[0]['id']

                if team_id:
                    tt_payload = {
                        "tournament_id": tourney_id,
                        "team_id": team_id,
                        "placement": team_data.get('placement'),
                        "prize_won": team_data.get('prize_won', 0)
                    }
                    supabase_request("UPSERT", "tournament_teams", [tt_payload])
                    print(f"      Team: {team_data['name']} (#{team_data.get('placement', '?')})")

            # Sync matches
            for match_data in detail["matches"]:
                team1_slug = generate_slug(match_data['team1'])
                team2_slug = generate_slug(match_data['team2'])

                # Resolve team IDs
                t1_res = supabase_request("GET", f"teams?slug=eq.{team1_slug}&select=id")
                t2_res = supabase_request("GET", f"teams?slug=eq.{team2_slug}&select=id")

                team1_id = t1_res[0]['id'] if t1_res and len(t1_res) > 0 else None
                team2_id = t2_res[0]['id'] if t2_res and len(t2_res) > 0 else None

                if not team1_id or not team2_id:
                    continue

                # Resolve winner ID
                winner_id = None
                if match_data.get('winner'):
                    winner_slug = generate_slug(match_data['winner'])
                    w_res = supabase_request("GET", f"teams?slug=eq.{winner_slug}&select=id")
                    if w_res and len(w_res) > 0:
                        winner_id = w_res[0]['id']

                match_payload = {
                    "tournament_id": tourney_id,
                    "team1_id": team1_id,
                    "team2_id": team2_id,
                    "score1": match_data.get('score1', 0),
                    "score2": match_data.get('score2', 0),
                    "winner_id": winner_id,
                    "round": match_data.get('round', 'Bracket'),
                    "played_at": match_data.get('played_at')
                }
                supabase_request("POST", "matches", [match_payload])
                print(f"      Match: {match_data['team1']} {match_data['score1']}-{match_data['score2']} {match_data['team2']} ({match_data['round']})")

            # Rate limit: wait between tournament detail requests
            time.sleep(1)

    print(f"\nSync Complete! Processed {detail_count} tournament detail pages.")


if __name__ == "__main__":
    sync_tournaments()
