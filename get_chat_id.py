import requests
import time
import os
from dotenv import load_dotenv

load_dotenv()

# Telegram Bot Token (.env)
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")

def get_chat_id():
    """Get the Chat ID of a user who sends a message to your bot."""
    if not TELEGRAM_BOT_TOKEN:
        print("❌ TELEGRAM_BOT_TOKEN is missing in .env")
        return None

    print("=" * 60)
    print("📱 TELEGRAM CHAT ID FINDER")
    print("=" * 60)
    print("\n1. Open your bot in Telegram")
    print("2. Send any message to the bot (e.g. 'Hello' or '/start')")
    print("3. After sending, this program will automatically show your Chat ID")
    print("\n⏳ Waiting for a message... (Ctrl+C to exit)\n")
    
    last_update_id = 0
    
    try:
        while True:
            # Get updates from bot
            url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/getUpdates"
            params = {"offset": last_update_id + 1, "timeout": 30}
            
            response = requests.get(url, params=params)
            
            if response.status_code == 200:
                data = response.json()
                
                if data["ok"] and data["result"]:
                    for update in data["result"]:
                        last_update_id = update["update_id"]
                        
                        # If there is a message
                        if "message" in update:
                            chat_id = update["message"]["chat"]["id"]
                            user = update["message"]["from"]
                            username = user.get("username", "N/A")
                            first_name = user.get("first_name", "")
                            last_name = user.get("last_name", "")
                            
                            print("=" * 60)
                            print("✅ CHAT ID FOUND!")
                            print("=" * 60)
                            print(f"\n📋 Chat ID: {chat_id}")
                            print(f"👤 Name: {first_name} {last_name}".strip())
                            print(f"🔗 Username: @{username}")
                            print("\n" + "=" * 60)
                            print("Add this Chat ID to your .env file:")
                            print(f'TELEGRAM_CHAT_ID = "{chat_id}"')
                            print("=" * 60)
                            
                            # Send chat ID back to user
                            send_url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
                            message = f"✅ Connection successful!\n\n📋 Your Chat ID: <code>{chat_id}</code>\n\nYou can add this ID to your code."
                            payload = {
                                "chat_id": chat_id,
                                "text": message,
                                "parse_mode": "HTML"
                            }
                            requests.post(send_url, json=payload)
                            
                            return chat_id
            else:
                print(f"❌ Error: {response.status_code}")
            
            time.sleep(1)
            
    except KeyboardInterrupt:
        print("\n\n⛔ Program stopped")
        return None
    except Exception as e:
        print(f"\n❌ An error occurred: {e}")
        return None

if __name__ == "__main__":
    get_chat_id()
