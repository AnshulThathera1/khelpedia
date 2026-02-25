import os
import requests
from dotenv import load_dotenv

load_dotenv('.env.local')

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

# Reliable URLs that explicitly allow hotlinking
games_updates = {
    'valorant': 'https://raw.githubusercontent.com/walkxcode/dashboard-icons/main/png/valorant.png',
    'bgmi': 'https://upload.wikimedia.org/wikipedia/en/thumb/8/80/Battlegrounds_Mobile_India_logo.svg/1024px-Battlegrounds_Mobile_India_logo.svg.png?20210705091726',
    'free-fire': 'https://upload.wikimedia.org/wikipedia/en/thumb/3/30/Free_Fire_logo.svg/1200px-Free_Fire_logo.svg.png?20230225134250',
    'dota-2': 'https://raw.githubusercontent.com/walkxcode/dashboard-icons/main/png/dota2.png',
    'pubg-mobile': 'https://upload.wikimedia.org/wikipedia/en/thumb/2/27/PUBG_Mobile_logo.svg/1200px-PUBG_Mobile_logo.svg.png?20210729153545',
    'cs2': 'https://raw.githubusercontent.com/walkxcode/dashboard-icons/main/png/csgo.png'
}

# Clearbit Logo API - 100% reliable for hotlinking
teams_updates = {
    'team-liquid': 'https://logo.clearbit.com/teamliquid.com',
    'fnatic': 'https://logo.clearbit.com/fnatic.com',
    'sentinels': 'https://logo.clearbit.com/sentinels.gg',
    'loud': 'https://logo.clearbit.com/loud.gg',
    'navi': 'https://logo.clearbit.com/navi.gg',
    'cloud9': 'https://logo.clearbit.com/cloud9.gg',
    'faze-clan': 'https://logo.clearbit.com/fazeclan.com',
    'paper-rex': 'https://logo.clearbit.com/pprx.team',
    'team-spirit': 'https://logo.clearbit.com/teamspirit.ru',
    'og': 'https://logo.clearbit.com/ogs.gg',
    'godlike-esports': 'https://logo.clearbit.com/godlike.in',
    'global-esports': 'https://logo.clearbit.com/globalesports.com'
}

def update_logos():
    print("Updating Game Icons...")
    for slug, url in games_updates.items():
        res = requests.patch(
            f"{SUPABASE_URL}/rest/v1/games?slug=eq.{slug}",
            headers=headers,
            json={"icon_url": url}
        )
        if res.status_code in [200, 204]:
            print(f"✅ Updated game: {slug}")
        else:
            print(f"❌ Failed to update {slug}: {res.text}")

    print("\nUpdating Team Logos...")
    for slug, url in teams_updates.items():
        res = requests.patch(
            f"{SUPABASE_URL}/rest/v1/teams?slug=eq.{slug}",
            headers=headers,
            json={"logo_url": url}
        )
        if res.status_code in [200, 204]:
            print(f"✅ Updated team: {slug}")
        else:
            print(f"❌ Failed to update {slug}: {res.text}")

if __name__ == "__main__":
    update_logos()
