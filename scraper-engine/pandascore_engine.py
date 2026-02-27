import os
import requests
from dotenv import load_dotenv

# Load Env
load_dotenv('.env.local')
PANDASCORE_KEY = os.getenv('PANDASCORE_API_KEY', '').strip('"').strip("'")
SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

# Headers
ps_headers = {"Authorization": f"Bearer {PANDASCORE_KEY}", "Accept": "application/json"}
sb_headers = {"apikey": SUPABASE_KEY, "Authorization": f"Bearer {SUPABASE_KEY}", "Content-Type": "application/json", "Prefer": "return=representation"}

GAMES = ['valorant', 'csgo', 'dota-2']

def fetch_and_sync_matches():
    print("Starting PandaScore Engine...")
    
    # 1. Map our database game IDs
    print("Fetching Game IDs from Supabase...")
    res = requests.get(f"{SUPABASE_URL}/rest/v1/games?select=id,slug", headers=sb_headers)
    db_games = {g['slug'].replace('cs2', 'csgo'): g['id'] for g in res.json()}
    print(db_games)

    for game in GAMES:
        if game not in db_games:
            continue
            
        game_id = db_games[game]
        print(f"\n--- Processing {game.upper()} ---")
        
        # Fetch Upcoming Matches
        url = f"https://api.pandascore.co/{game}/matches/upcoming?per_page=10"
        response = requests.get(url, headers=ps_headers)
        
        if response.status_code != 200:
            print(f"❌ Failed to fetch {game} matches: {response.status_code}")
            continue
            
        matches = response.json()
        print(f"Found {len(matches)} upcoming matches.")

        for match in matches:
            # 1. Ensure Tournament exists
            t = match['tournament']
            l = match.get('league') or {}
            
            tourney_data = {
                "name": f"{l.get('name', '')} {t.get('name', '')}".strip() or match.get('name', 'Unknown Tournament'),
                "slug": t.get('slug', str(t.get('id', match['id']))),
                "game_id": game_id,
                "tier": t.get('tier', 'c').capitalize(),
                "prize_pool": 0, # PandaScore free tier doesn't always have this parsed cleanly
                "start_date": t.get('begin_at'),
                "end_date": t.get('end_at'),
                "region": t.get('region', l.get('name', 'Global')),
                "status": "upcoming"
            }
            
            t_res = requests.post(f"{SUPABASE_URL}/rest/v1/tournaments?on_conflict=slug", headers=sb_headers, json=tourney_data)
            t_record = t_res.json() if t_res.text else []
            if not t_record:
                t_res = requests.get(f"{SUPABASE_URL}/rest/v1/tournaments?slug=eq.{tourney_data['slug']}&select=id", headers=sb_headers)
                t_record = t_res.json() if t_res.text else []
                
            if not t_record or (isinstance(t_record, list) and len(t_record) == 0):
                print(f"⚠️ Could not find or create tournament: {tourney_data['name']}")
                continue
                
            tourney_id = t_record[0]['id'] if isinstance(t_record, list) else t_record.get('id')

            # 2. Sync Teams
            opponents = match.get('opponents', [])
            if len(opponents) != 2:
                continue # Skip if not a 1v1 team match yet (TBD)
                
            team_ids = []
            for opp in opponents:
                team = opp['opponent']
                team_data = {
                    "name": team['name'],
                    "slug": team['slug'],
                    "logo_url": team.get('image_url')
                }
                # Upsert team
                requests.post(f"{SUPABASE_URL}/rest/v1/teams?on_conflict=slug", headers=sb_headers, json=team_data)
                
                # Get local team ID
                tm_res = requests.get(f"{SUPABASE_URL}/rest/v1/teams?slug=eq.{team['slug']}&select=id", headers=sb_headers)
                t_json = tm_res.json() if tm_res.text else []
                if t_json and len(t_json) > 0:
                    local_team_id = t_json[0]['id']
                    team_ids.append(local_team_id)
                    
                    # Add team to tournament participants
                    requests.post(f"{SUPABASE_URL}/rest/v1/tournament_teams?on_conflict=tournament_id,team_id", headers=sb_headers, json={"tournament_id": tourney_id, "team_id": local_team_id})
                else:
                    print(f"⚠️ Could not find or create team: {team['name']}")

            if len(team_ids) != 2:
                continue

            # Extract scores safely
            results_list = match.get('results') or []
            score1 = results_list[0].get('score', 0) if len(results_list) > 0 else 0
            score2 = results_list[1].get('score', 0) if len(results_list) > 1 else 0

            # 3. Create/Update Match
            match_data = {
                "tournament_id": tourney_id,
                "team1_id": team_ids[0],
                "team2_id": team_ids[1],
                "score1": score1,
                "score2": score2,
                "round": "Upcoming",
                "match_date": match['begin_at']
            }
            
            # Upsert match (we don't have a great unique key here easily, so we just append for now or match on team1/team2/tourney)
            # In a real scenario you'd add a remote_id column to matches to do true upsert
            requests.post(f"{SUPABASE_URL}/rest/v1/matches", headers=sb_headers, json=match_data)
            print(f"Added Match: {match['name']}")

    print("\nPandaScore Sync Complete!")

if __name__ == "__main__":
    fetch_and_sync_matches()
