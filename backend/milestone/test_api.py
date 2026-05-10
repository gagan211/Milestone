import urllib.request
import json
import sys

def test_health():
    url = "http://127.0.0.1:8080/health"
    print(f"📡 Testing {url} ...")
    try:
        response = urllib.request.urlopen(url, timeout=5)
        status_code = response.getcode()
        body = response.read().decode('utf-8')
        
        if status_code == 200 and body == "database connected backend ready":
            print("\n" + "="*50)
            print("🎉 SUCCESS: Milestone Backend is Healthy and Connected! 🎉")
            print(f"Status Code: {status_code}")
            print(f"Response: {body}")
            print("="*50 + "\n")
            return True
        else:
            print(f"❌ FAILED: Unexpected response (Code: {status_code}, Body: {body})")
            return False
    except Exception as e:
        print(f"❌ FAILED: Could not connect to the server. Is it running?")
        print(f"Error: {e}")
        return False

if __name__ == "__main__":
    success = test_health()
    sys.exit(0 if success else 1)
