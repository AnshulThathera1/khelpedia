import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env.local')

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

# Updates to apply
games_updates = {
    'valorant': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Valorant_logo_-_pink_color_version.svg/1024px-Valorant_logo_-_pink_color_version.svg.png',
    'bgmi': 'https://static.wikia.nocookie.net/bgmi/images/3/36/BGMI_Logo.png',
    'free-fire': 'https://upload.wikimedia.org/wikipedia/en/thumb/3/30/Free_Fire_logo.svg/1200px-Free_Fire_logo.svg.png',
    'dota-2': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Dota_2_icon.svg/1200px-Dota_2_icon.svg.png',
    'pubg-mobile': 'https://upload.wikimedia.org/wikipedia/en/thumb/2/27/PUBG_Mobile_logo.svg/1200px-PUBG_Mobile_logo.svg.png'
}

teams_updates = {
    'team-liquid': 'https://upload.wikimedia.org/wikipedia/en/thumb/f/fd/Team_Liquid_logo.svg/1200px-Team_Liquid_logo.svg.png',
    'fnatic': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/43/Fnatic_Logo.svg/1200px-Fnatic_Logo.svg.png',
    'sentinels': 'https://upload.wikimedia.org/wikipedia/en/thumb/6/6c/Sentinels_logo.svg/1200px-Sentinels_logo.svg.png',
    'loud': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/LOUD_logo.svg/1200px-LOUD_logo.svg.png',
    'navi': 'https://upload.wikimedia.org/wikipedia/en/thumb/a/ac/NaVi_logo.svg/1200px-NaVi_logo.svg.png',
    'cloud9': 'https://upload.wikimedia.org/wikipedia/en/thumb/8/88/Cloud9_logo.svg/1200px-Cloud9_logo.svg.png',
    'faze-clan': 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5b/FaZe_Clan_logo.svg/1200px-FaZe_Clan_logo.svg.png',
    'paper-rex': 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a0/Paper_Rex_logo.svg/1200px-Paper_Rex_logo.svg.png',
    'team-spirit': 'https://upload.wikimedia.org/wikipedia/en/thumb/7/7e/Team_Spirit_logo.svg/1200px-Team_Spirit_logo.svg.png',
    'og': 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e8/OG_logo.svg/1200px-OG_logo.svg.png'
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
