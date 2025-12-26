import requests

def test_prod_api():
    url = "https://api.promptlib.co.kr/api/admin/templates?skip=0&limit=20"
    print(f"Testing {url}...")
    try:
        response = requests.get(url, timeout=10)
        print(f"Status Code: {response.status_code}")
        print("Response Body:")
        print(response.text[:1000])
    except Exception as e:
        print(f"Request Failed: {e}")

if __name__ == "__main__":
    test_prod_api()
