import praw
import os
import datetime
import requests
from dotenv import load_dotenv

# Load environment variables from a .env file
load_dotenv()

# ==========================================
# CONFIGURATION
# ==========================================
# Make sure to set these in your .env file
REDDIT_CLIENT_ID = os.getenv('REDDIT_CLIENT_ID')
REDDIT_CLIENT_SECRET = os.getenv('REDDIT_CLIENT_SECRET')
REDDIT_USERNAME = os.getenv('REDDIT_USERNAME')
REDDIT_PASSWORD = os.getenv('REDDIT_PASSWORD')
REDDIT_USER_AGENT = 'KhelPediA_Bot:v1.0 (by u/YourRedditUsername)'

# Target Subreddits (comma separated in .env, e.g., 'esports,IndianGaming')
SUBREDDITS = os.getenv('TARGET_SUBREDDITS', 'IndianGaming').split(',')

# Your Website URL
WEBSITE_URL = 'https://khelpedia.com'


def get_weekly_data():
    """
    Simulates fetching weekly data for the recap.
    You can later replace this to fetch data directly from your Next.js API or Database.
    """
    # Example: Fetching from your own API (when you build one)
    # response = requests.get(f"{WEBSITE_URL}/api/global-stats")
    # data = response.json()
    
    # For now, we will return some mock data to show the format
    return {
        "top_agent": "Jett",
        "top_agent_winrate": "52.4%",
        "most_played_map": "Ascent",
        "matches_tracked": "15,240"
    }


def format_post_content(data):
    """
    Creates a well-formatted Reddit Markdown post using the data.
    """
    today = datetime.datetime.now().strftime('%Y-%m-%d')
    
    title = f"Weekly Valorant Meta Recap & Stats [{today}]"
    
    body = f"""
Hey everyone, here is a quick look at the Valorant competitive meta over the past week based on data tracked from thousands of matches!

### 📊 Weekly Meta Stats

*   **Most Picked Agent:** {data['top_agent']}
*   **Top Agent Win Rate:** {data['top_agent_winrate']}
*   **Most Played Map:** {data['most_played_map']}
*   **Total Matches Tracked This Week:** {data['matches_tracked']}

---

*This data is automatically compiled by [KhelPediA]({WEBSITE_URL}), a project I built to help players track their esports stats and tournaments.* 

Let me know if you guys find this data interesting, and I can start including more advanced metrics (like ADR and First Blood Success Rates) next week!
    """
    
    return title, body


def main():
    print("Starting KhelPediA Reddit Bot...")
    
    # 1. Initialize PRAW (Reddit API)
    try:
        reddit = praw.Reddit(
            client_id=REDDIT_CLIENT_ID,
            client_secret=REDDIT_CLIENT_SECRET,
            username=REDDIT_USERNAME,
            password=REDDIT_PASSWORD,
            user_agent=REDDIT_USER_AGENT
        )
        # Check if login was successful
        user = reddit.user.me()
        print(f"Successfully logged in as: u/{user.name}")
    except Exception as e:
        print(f"Failed to log into Reddit. Check your credentials. Error: {e}")
        return

    # 2. Fetch the Data & Format the Post
    data = get_weekly_data()
    title, body = format_post_content(data)
    
    # 3. Post to the subreddits
    for sub_name in SUBREDDITS:
        sub_name = sub_name.strip()
        print(f"Preparing to post to r/{sub_name}...")
        
        try:
            subreddit = reddit.subreddit(sub_name)
            
            # UNCOMMENT THE LINE BELOW TO ACTUALLY SUBMIT THE POST
            # submission = subreddit.submit(title=title, selftext=body)
            # print(f"Successfully posted to r/{sub_name}! URL: {submission.url}")
            
            # For testing, we just print the content
            print(f"--- TEST MODE: Post for r/{sub_name} ---")
            print(f"Title: {title}")
            print(body)
            print("-----------------------------------------")
            
        except Exception as e:
            print(f"Failed to post to r/{sub_name}. Error: {e}")

if __name__ == "__main__":
    main()
