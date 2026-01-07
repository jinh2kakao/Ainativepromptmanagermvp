
import requests
import json
import sys

# Assume we can access without auth for testing if we modify backend or just check if it prompts 401
# But admin router requires auth. 
# Let's try to hit it. If 401, server is UP.
# If we want to test 200, we need a token.
# Let's check root endpoint first.

try:
    print("Testing Root...")
    r = requests.get("http://localhost:8000/docs", timeout=5)
    print(f"Docs Status: {r.status_code}")

    print("Testing Categories Endpoint...")
    r = requests.get("http://localhost:8000/api/admin/categories", timeout=10)
    print(f"Categories Status: {r.status_code}")
    if r.status_code == 200:
        print("Success! Data:")
        print(json.dumps(r.json()[:2], indent=2))
    elif r.status_code == 401:
        print("Got 401 Unauthorized - Backend IS reachable.")
    else:
        print(f"Error: {r.status_code} - {r.text}")
except Exception as e:
    print(f"Exception: {e}")
