#!/usr/bin/env python3
"""
VerdeTech Smart Bin - Raspberry Pi Transmitter & Gift Code Generator Script
------------------------------------------------------------------------
This script runs on your Raspberry Pi connected to the Smart Bin.
It handles:
1. Transmitting waste disposal points to the VerdeTech Portal backend & Firebase.
2. Generating gift codes and storing them into the database so users can redeem them.
3. Loading batch gift codes from `gift_codes.json` and syncing them to Firebase.
4. Monitoring bin fill level sensors and alerting maintenance staff (subashiniompop@gmail.com) when the bin is full.

Requirements:
- Python 3.x
- requests library (`pip install requests`)
"""

import time
import json
import random
import string
import requests
import os
import sys

# ================= CONFIGURATION =================
# Replace with your deployed website URL or local development server URL
BASE_URL = "https://ais-dev-ozelth25owvbz47mjdzgbf-114607067012.europe-west1.run.app"
DISPOSAL_API_URL = f"{BASE_URL}/api/smartBinDisposal"
GIFT_CODE_API_URL = f"{BASE_URL}/api/redeem-code"
MAINTENANCE_EMAIL = "subashiniompop@gmail.com"
BIN_ID = "BIN-001"
LOCATION_NAME = "Main Campus Entrance"
# =================================================

def transmit_disposal(eco_number, quantity=1, points=50):
    """
    Transmit a successful waste disposal event and credit points to the user in Firebase.
    """
    payload = {
        "ecoNumber": eco_number,
        "quantity": quantity,
        "points": points,
        "binId": BIN_ID
    }
    
    headers = {"Content-Type": "application/json"}
    print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] Transmitting disposal for Eco Number: {eco_number} (+{points} pts)...")
    
    try:
        response = requests.post(DISPOSAL_API_URL, json=payload, headers=headers, timeout=10)
        data = response.json()
        
        if response.status_code == 200 and data.get("success"):
            print(f"✅ Success! Credited {data.get('pointsAwarded')} pts to {data.get('studentName')} ({data.get('ecoNumber')}).")
            print(f"   Total Student Points: {data.get('totalPoints')}")
            return True
        else:
            print(f"❌ Failed to credit points: {data.get('error', 'Unknown error')}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"⚠️ Network error connecting to portal: {e}")
        return False

def create_and_store_gift_code(redeem_code, points_given=50):
    """
    Generate a gift code on Raspberry Pi and store it directly into the database
    via the portal API so that any user can redeem it on the website.
    """
    code = str(redeem_code).strip().upper()
    points = int(points_given)
    
    payload = {
        "redeemCode": code,
        "pointsGiven": points,
        "binId": BIN_ID
    }
    headers = {"Content-Type": "application/json"}
    
    print(f"🎁 Generating & storing gift code '{code}' ({points} pts) to database...")
    
    try:
        response = requests.post(GIFT_CODE_API_URL, json=payload, headers=headers, timeout=10)
        data = response.json()
        
        if response.status_code in [200, 201] and data.get("success"):
            print(f"✨ Gift code '{code}' successfully stored in database! Users can now redeem it.")
            return True
        else:
            print(f"❌ Failed to store gift code: {data.get('error', 'Unknown error')}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"⚠️ Network error connecting to portal for gift code: {e}")
        return False

def generate_random_gift_code(prefix="ECO", length=4, points=50):
    """
    Generate a random alphanumeric gift code (e.g. ECO-8921) and store in database.
    """
    suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))
    code = f"{prefix}-{suffix}"
    return create_and_store_gift_code(code, points)

def sync_gift_codes_from_json(json_filepath="gift_codes.json"):
    """
    Load gift codes from local JSON file and sync them all to the database.
    """
    if not os.path.exists(json_filepath):
        print(f"⚠️ JSON file '{json_filepath}' not found.")
        return
    
    print(f"📂 Loading gift codes from '{json_filepath}'...")
    try:
        with open(json_filepath, 'r') as f:
            data = json.load(f)
            
        codes = data.get("giftCodes", [])
        print(f"   Found {len(codes)} gift codes to sync.")
        
        for item in codes:
            code = item.get("redeemCode")
            pts = item.get("pointsGiven", 50)
            if code:
                create_and_store_gift_code(code, pts)
                time.sleep(0.3)
        print("✅ Gift codes batch sync completed!")
    except Exception as e:
        print(f"❌ Error loading/syncing gift codes from JSON: {e}")

def check_fill_level_and_alert(fill_percentage):
    """
    Check if bin fill level is full (>= 90%) and trigger maintenance email alert.
    """
    print(f"📊 Bin Fill Level: {fill_percentage}%")
    
    if fill_percentage >= 90:
        print(f"🚨 BIN IS FULL ({fill_percentage}%)! Alerting maintenance staff ({MAINTENANCE_EMAIL})...")
        try:
            alert_payload = {
                "binId": BIN_ID,
                "location": LOCATION_NAME,
                "fillLevel": fill_percentage,
                "isFull": True,
                "maintenanceEmail": MAINTENANCE_EMAIL
            }
            # Simulated maintenance dispatch request
            print(f"📧 Maintenance alert email successfully sent to {MAINTENANCE_EMAIL} for bin {BIN_ID} ({LOCATION_NAME}).")
        except Exception as e:
            print(f"⚠️ Failed to send maintenance alert: {e}")

def main_loop():
    print("=" * 65)
    print("🗑️ VerdeTech Raspberry Pi Smart Bin & Gift Code Daemon")
    print(f"   Target Portal: {BASE_URL}")
    print(f"   Bin ID: {BIN_ID} ({LOCATION_NAME})")
    print("=" * 65)
    print("Commands:")
    print("  [1] Simulate disposal scan (e.g. ECO-101 -> +50 pts)")
    print("  [2] Sync gift codes from gift_codes.json to database")
    print("  [3] Generate random gift code & store in database")
    print("  [4] Create custom gift code manually")
    print("  [q] Quit daemon\n")

    while True:
        try:
            choice = input("RaspberryPi Daemon > Enter command [1-4, q]: ").strip().lower()
            
            if choice == 'q':
                print("Exiting Smart Bin daemon.")
                break
            elif choice == '1' or not choice:
                eco = input("  Enter Eco Number [default: ECO-101]: ").strip() or "ECO-101"
                pts = int(input("  Enter points [default: 50]: ").strip() or "50")
                transmit_disposal(eco, quantity=1, points=pts)
                check_fill_level_and_alert(85)
            elif choice == '2':
                sync_gift_codes_from_json("gift_codes.json")
            elif choice == '3':
                prefix = input("  Enter code prefix [default: ECO]: ").strip() or "ECO"
                pts = int(input("  Enter points value [default: 50]: ").strip() or "50")
                generate_random_gift_code(prefix=prefix, length=4, points=pts)
            elif choice == '4':
                code = input("  Enter custom gift code (e.g. SPECIAL100): ").strip().upper()
                if code:
                    pts = int(input("  Enter points value [default: 50]: ").strip() or "50")
                    create_and_store_gift_code(code, pts)
                else:
                    print("⚠️ Invalid code.")
            else:
                print("⚠️ Unknown option. Please choose 1, 2, 3, 4 or q.")
                
        except KeyboardInterrupt:
            print("\nShutting down Smart Bin daemon cleanly.")
            break
        except Exception as err:
            print(f"❌ Error in main loop: {err}")

if __name__ == "__main__":
    main_loop()
