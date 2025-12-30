import os.path
import shutil
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
    token_temp_path = os.path.join(base_dir, "token_new.json")

    print(f"Checking for credentials at: {credentials_path}")
    
    if not os.path.exists(credentials_path):
        print("ERROR: credentials.json not found!")
        print("Please download it from Google Cloud Console -> APIs & Services -> Credentials -> OAuth 2.0 Client IDs")
        print("Save it as 'backend/credentials.json'")
        return

    # check existing token (also try alternative location)
    if os.path.exists(token_path):
        creds = Credentials.from_authorized_user_file(token_path, SCOPES)
    elif os.path.exists(token_temp_path):
        print("Found token at alternative path, using that...")
        creds = Credentials.from_authorized_user_file(token_temp_path, SCOPES)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            print("Refreshing expired token...")
            try:
                creds.refresh(Request())
            except Exception as e:
                print(f"Token refresh failed: {e}")
                print("Falling back to new authentication flow...")
                creds = None # Reset creds to force new login

        if not creds: # Check again if creds were reset
            print("Starting new OAuth flow...")
            flow = InstalledAppFlow.from_client_secrets_file(
                credentials_path, SCOPES
            )
            creds = flow.run_local_server(port=0)
        
        # Try to save the credentials - first to temp path, then try main path
        try:
            with open(token_temp_path, "w") as token:
                token.write(creds.to_json())
                print(f"Token saved to {token_temp_path}")
            
            # Try to copy to main path if possible
            try:
                shutil.copy(token_temp_path, token_path)
                print(f"Token copied to {token_path}")
            except Exception:
                print(f"Could not copy to {token_path}, but {token_temp_path} is available")
                
        except Exception as e:
            print(f"ERROR saving token: {e}")
            print("Please manually close any programs that might be locking the file.")
            return

    print("Success! You are now authenticated.")

if __name__ == "__main__":
    main()
