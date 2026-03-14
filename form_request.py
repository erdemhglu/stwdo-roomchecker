import requests
from urllib.parse import urljoin
import time
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

# Base URL
BASE_URL = "https://www.stwdo.de/"

# Telegram Bot settings (.env)
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID", "")

# Check interval (in seconds)
CHECK_INTERVAL = int(os.getenv("CHECK_INTERVAL", "300"))  # Default: 5 minutes

# Form action URL
form_action = "/wohnen/aktuelle-wohnangebote"

# Full URL
url = urljoin(BASE_URL, form_action)

# Form data (basic filtering parameters only)
form_data = {
    "tx_openimmo_list[city]": "",  # Example: "Dortmund"
    "tx_openimmo_list[residentialComplex]": "",  # Example: "520"
}

# Headers (to mimic a browser)
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Content-Type": "application/x-www-form-urlencoded",
    "Referer": urljoin(BASE_URL, "/wohnen/aktuelle-wohnangebote"),
}

# Use a session to keep cookies
session = requests.Session()


def send_telegram_message(message):
    """Send a Telegram notification."""
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        print("⚠ Telegram credentials are missing in .env. Skipping notification.")
        return

    try:
        telegram_url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
        payload = {
            "chat_id": TELEGRAM_CHAT_ID,
            "text": message,
            "parse_mode": "HTML"
        }
        response = requests.post(telegram_url, json=payload)
        if response.status_code == 200:
            print("✓ Telegram notification sent")
        else:
            print(f"✗ Failed to send Telegram notification: {response.status_code}")
    except Exception as e:
        print(f"✗ Telegram error: {e}")


def check_rooms():
    """Check room availability."""
    try:
        # Send POST request
        response = session.post(url, data=form_data, headers=headers, allow_redirects=True)
        
        current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"\n[{current_time}] Checking...")
        print(f"Status Code: {response.status_code}")
        
        # Save response to file
        with open("response.html", "w", encoding="utf-8") as f:
            f.write(response.text)
        
        # Specific check: search for no-offer messages
        if "keine freien Plätze zu vermieten" in response.text or '"notification__header">Keine Angebote' in response.text:
            print("⚠️  No available room at the moment")
            return False
        else:
            print("✅ AVAILABLE ROOM FOUND!")
            message = f"🎉 <b>AVAILABLE ROOM FOUND!</b>\n\n"
            message += f"⏰ Time: {current_time}\n"
            message += f"🔗 Link: {url}\n\n"
            message += f"Check it now!"
            send_telegram_message(message)
            return True
        
    except requests.exceptions.RequestException as e:
        print(f"An error occurred: {e}")
        return False


# Example usage scenarios:

def search_by_city(city_name):
    """Search in a specific city."""
    form_data_copy = form_data.copy()
    form_data_copy["tx_openimmo_list[city]"] = city_name
    response = session.post(url, data=form_data_copy, headers=headers)
    return response


def search_by_complex(complex_id):
    """Search in a specific residential complex."""
    form_data_copy = form_data.copy()
    form_data_copy["tx_openimmo_list[residentialComplex]"] = complex_id
    response = session.post(url, data=form_data_copy, headers=headers)
    return response


def search_both(city_name, complex_id):
    """Search by both city and residential complex."""
    form_data_copy = form_data.copy()
    form_data_copy["tx_openimmo_list[city]"] = city_name
    form_data_copy["tx_openimmo_list[residentialComplex]"] = complex_id
    response = session.post(url, data=form_data_copy, headers=headers)
    return response


# Usage examples (uncomment to test):
# response = search_by_city("Dortmund")
# response = search_by_complex("520")
# response = search_both("Dortmund", "520")


if __name__ == "__main__":
    print("=" * 60)
    print("🏠 ROOM CHECKER STARTED")
    print("=" * 60)
    print(f"Check interval: {CHECK_INTERVAL} seconds ({CHECK_INTERVAL / 60} minutes)")
    print(f"Target URL: {url}")
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    print("\nPress Ctrl+C to stop\n")

    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        print("⚠ Telegram credentials are not set. Add TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID to .env")
    
    # Initial check
    check_rooms()
    
    try:
        while True:
            print(f"\n💤 Waiting {CHECK_INTERVAL} seconds...")
            time.sleep(CHECK_INTERVAL)
            check_rooms()
            
    except KeyboardInterrupt:
        print("\n\n" + "=" * 60)
        print("⛔ Program stopped")
        print("=" * 60)
