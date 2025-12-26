import os.path
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials

# If modifying these scopes, delete the file token.json.
SCOPES = [
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/gmail.readonly"
]

def main():
    creds = None
    # Base dir: backend/
    base_dir = os.path.dirname(os.path.abspath(__file__))
    credentials_path = os.path.join(base_dir, "credentials.json")
    token_path = os.path.join(base_dir, "token.json")

    print(f"Checking for credentials at: {credentials_path}")
    
    if not os.path.exists(credentials_path):
        print("ERROR: credentials.json not found!")
        print("Please download it from Google Cloud Console -> APIs & Services -> Credentials -> OAuth 2.0 Client IDs")
        print("Save it as 'backend/credentials.json'")
        return

    # check existing token
    if os.path.exists(token_path):
        creds = Credentials.from_authorized_user_file(token_path, SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            print("Refreshing expired token...")
            creds.refresh(Request())
        else:
            print("Starting new OAuth flow...")
            flow = InstalledAppFlow.from_client_secrets_file(
                credentials_path, SCOPES
            )
            creds = flow.run_local_server(port=0)
        
        # Save the credentials for the next run
        with open(token_path, "w") as token:
            token.write(creds.to_json())
            print(f"Token saved to {token_path}")

    print("Success! You are now authenticated.")

if __name__ == "__main__":
    main()
