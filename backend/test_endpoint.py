from fastapi.testclient import TestClient
from main import app
import os
from dotenv import load_dotenv

# Ensure env is loaded
load_dotenv()

client = TestClient(app)

print("Sending POST request to /api/auth/reset-password-request...")
try:
    response = client.post(
        "/api/auth/reset-password-request",
        json={
            "email": "sjjh1001@naver.com",
            "redirect_to": "http://localhost:3000/auth/update-password"
        }
    )
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")
