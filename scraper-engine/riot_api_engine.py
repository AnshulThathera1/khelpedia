import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv(dotenv_path="../.env.local")

RIOT_API_KEY = os.getenv("RIOT_API_KEY")

class RiotAPI:
    def __init__(self, api_key=None, default_region="ap"):
        self.api_key = api_key or RIOT_API_KEY
        self.default_region = default_region
        self.headers = {
            "User-Agent": "KhelPediA-Riot-Engine",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept-Charset": "application/x-www-form-urlencoded; charset=UTF-8",
            "X-Riot-Token": self.api_key
        }
        
    def _get_cluster_for_account(self, region):
        # account-v1 is only available onamericas, asia, europe, esports
        mapping = {
            "na": "americas",
            "latam": "americas",
            "br": "americas",
            "eu": "europe",
            "ap": "asia",
            "kr": "asia",
            "esports": "esports"
        }
        return mapping.get(region, "asia")

    def get_puuid_by_riot_id(self, game_name, tag_line, region="ap"):
        """
        Account-V1: Get PUUID by Riot ID
        GET /riot/account/v1/accounts/by-riot-id/{gameName}/{tagLine}
        """
        if not self.api_key:
            print("❌ RIOT_API_KEY is not set.")
            return None
            
        cluster = self._get_cluster_for_account(region)
        url = f"https://{cluster}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/{game_name}/{tag_line}"
        
        response = requests.get(url, headers=self.headers)
        if response.status_code == 200:
            return response.json()
        else:
            print(f"❌ Failed to get PUUID: {response.status_code} - {response.text}")
            return None

    def get_match_history(self, puuid, region="ap"):
        """
        Val-Match-V1: Get match history by PUUID
        GET /val/match/v1/matchlists/by-puuid/{puuid}
        """
        url = f"https://{region}.api.riotgames.com/val/match/v1/matchlists/by-puuid/{puuid}"
        response = requests.get(url, headers=self.headers)
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"❌ Failed to get match history: {response.status_code} - {response.text}")
            return None

    def get_match_details(self, match_id, region="ap"):
        """
        Val-Match-V1: Get match details
        GET /val/match/v1/matches/{matchId}
        """
        url = f"https://{region}.api.riotgames.com/val/match/v1/matches/{match_id}"
        response = requests.get(url, headers=self.headers)
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"❌ Failed to get match details: {response.status_code} - {response.text}")
            return None

    def get_leaderboard(self, act_id, region="ap"):
        """
        Val-Ranked-V1: Get leaderboard for a specific act
        GET /val/ranked/v1/leaderboards/by-act/{actId}
        """
        url = f"https://{region}.api.riotgames.com/val/ranked/v1/leaderboards/by-act/{act_id}?size=100"
        response = requests.get(url, headers=self.headers)
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"❌ Failed to get leaderboard: {response.status_code} - {response.text}")
            return None

if __name__ == "__main__":
    print("Testing Riot API Engine...")
    api = RiotAPI()
    
    # You can test this by providing a known Riot ID
    # result = api.get_puuid_by_riot_id("YourName", "Tag")
    # print(result)
