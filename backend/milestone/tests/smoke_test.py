import requests
import json
import sys

BASE_URL = "http://127.0.0.1:8080/api"

# --- CONFIGURATION ---
# Paste a valid Supabase JWT here to test authenticated routes
JWT_TOKEN = ""
GITHUB_TOKEN = ""

def print_header(msg):
    print(f"\n{'='*50}")
    print(f" {msg}")
    print(f"{'='*50}")

def test_health():
    print_header("Testing Health Check")
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        return response.status_code == 200
    except Exception as e:
        print(f"Failed to connect: {e}")
        return False

def test_dashboard():
    print_header("Testing Dashboard API")
    if not JWT_TOKEN:
        print("Skipping: No JWT_TOKEN provided.")
        return False
        
    headers = {"Authorization": f"Bearer {JWT_TOKEN}"}
    response = requests.get(f"{BASE_URL}/projects/dashboard", headers=headers)
    print(f"Status: {response.status_code}")
    try:
        print(json.dumps(response.json(), indent=2))
    except Exception:
        print(f"Raw Response: {response.text}")
    return response.status_code == 200

def test_sync():
    print_header("Testing User Sync API")
    if not JWT_TOKEN or not GITHUB_TOKEN:
        print("Skipping: Missing JWT or GitHub Token.")
        return False
        
    headers = {"Authorization": f"Bearer {JWT_TOKEN}"}
    payload = {
        "role": "developer",
        "githubAccessToken": GITHUB_TOKEN
    }
    response = requests.post(f"{BASE_URL}/auth/sync", headers=headers, json=payload)
    print(f"Status: {response.status_code}")
    try:
        print(json.dumps(response.json(), indent=2))
    except Exception:
        print(f"Raw Response: {response.text}")
    return response.status_code == 200

def test_link_repo():
    print_header("Testing Link Repository API")
    if not JWT_TOKEN:
        print("Skipping: No JWT_TOKEN provided.")
        return False

    headers = {"Authorization": f"Bearer {JWT_TOKEN}"}
    # Test with your actual repo!
    payload = {
        "repoUrl": "https://github.com/gagan211/Milestone",
        "clientId": None
    }
    
    response = requests.post(f"{BASE_URL}/projects/link", headers=headers, json=payload)
    print(f"Status: {response.status_code}")
    try:
        print(json.dumps(response.json(), indent=2))
    except Exception:
        print(f"Raw Response: {response.text}")
    
    # We expect an error because the repo is private and the token is weak.
    if response.status_code == 403:
        data = response.json()
        if data.get("error") == "INSUFFICIENT_SCOPE":
            print("\n✅ ZERO-FRICTION FLOW DETECTED!")
            print(f"Message: {data.get('message')}")
            print(f"Action Required: {data.get('action')}")
            print(f"URL to grant access: {data.get('redirect_url')}")
            return True
    elif response.status_code == 404:
        print("SUCCESS: Received expected 404 for non-existent repo.")
        return True
    elif response.status_code == 401:
        print("ALERT: Received 401. Your JWT might be expired.")
        return False
        
    return response.status_code == 200

if __name__ == "__main__":
    print("🚀 Starting Milestone Backend Smoke Test")
    
    results = []
    results.append(test_health())
    
    if JWT_TOKEN:
        results.append(test_dashboard())
        results.append(test_sync())
        results.append(test_link_repo())
    else:
        print("\n⚠️  Note: Authed tests skipped. Add a JWT_TOKEN to smoke_test.py to test logic.")

    print_header("Summary")
    print(f"Tests Passed: {sum(results)} / {len(results)}")
    
    if not all(results) and JWT_TOKEN:
        sys.exit(1)
