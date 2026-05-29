import os
import sys
import time
import subprocess
from datetime import datetime

# Set output encoding to UTF-8 to handle emojis in Windows PowerShell/CMD
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# Scraper configurations
# intervals in seconds
SCRAPERS = {
    "live_matches": {
        "script": "vlr_scraper.py",
        "interval": 120,       # 2 minutes
        "last_run": 0
    },
    "tournaments": {
        "script": "vlr_tournament_scraper.py",
        "interval": 1800,      # 30 minutes
        "last_run": 0
    },
    "pandascore": {
        "script": "pandascore_engine.py",
        "interval": 3600,      # 60 minutes
        "last_run": 0
    },
    "liquipedia": {
        "script": "liquipedia_scraper.py",
        "interval": 3600,      # 60 minutes
        "last_run": 0
    }
}

# Get current script directory to resolve paths correctly
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def log(level, message):
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] [{level.upper()}] {message}")

def run_scraper(name, config):
    script_path = os.path.join(BASE_DIR, config["script"])
    log("INFO", f"🚀 Starting {name} ({config['script']})...")
    
    # Run scraper in a subprocess
    try:
        # Use active python executable from the virtual environment if running inside one
        python_exe = sys.executable
        
        # Configure env variables (e.g. force UTF-8 output inside Python processes)
        process_env = os.environ.copy()
        process_env["PYTHONIOENCODING"] = "utf-8"
        
        # Start subprocess
        result = subprocess.run(
            [python_exe, script_path],
            cwd=BASE_DIR,
            env=process_env,
            capture_output=True,
            encoding="utf-8"
        )
        
        if result.returncode == 0:
            log("SUCCESS", f"✅ Finished {name} successfully.")
            # Print a snippet of the latest output logs
            if result.stdout:
                stdout_lines = [line.strip() for line in result.stdout.strip().split('\n') if line.strip()]
                last_lines = "\n    ".join(stdout_lines[-3:])
                print(f"    [OUTPUT LOGS]:\n    {last_lines}")
        else:
            log("ERROR", f"❌ {name} failed with exit code {result.returncode}.")
            if result.stderr:
                print(f"    [STDERR]: {result.stderr.strip()}")
                
    except Exception as e:
        log("CRITICAL", f"💥 Failed to execute {name}: {e}")

def main():
    log("SYSTEM", "👾 KhelPediA Scraper Scheduler Daemon Active.")
    log("SYSTEM", f"Base directory: {BASE_DIR}")
    log("SYSTEM", "Press Ctrl+C to stop.")
    
    # Run everything once on startup
    log("SYSTEM", "Running initial sync for all active engines...")
    for name, config in SCRAPERS.items():
        run_scraper(name, config)
        config["last_run"] = time.time()
        
    while True:
        try:
            current_time = time.time()
            for name, config in SCRAPERS.items():
                elapsed = current_time - config["last_run"]
                if elapsed >= config["interval"]:
                    run_scraper(name, config)
                    config["last_run"] = time.time()
            
            # Sleep for 5 seconds between checks to minimize CPU usage
            time.sleep(5)
            
        except KeyboardInterrupt:
            log("SYSTEM", "👋 Scheduler shutting down gracefully. Bye!")
            break
        except Exception as e:
            log("SYSTEM", f"⚠️ Error in scheduling loop: {e}")
            time.sleep(10)

if __name__ == "__main__":
    main()
