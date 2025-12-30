import os.path
import base64
from email.message import EmailMessage
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from .base import EmailService
import logging

# Module-level logger
logger = logging.getLogger("uvicorn")

SCOPES = ["https://www.googleapis.com/auth/gmail.send"]

class GmailService(EmailService):
    def __init__(self, credentials_path: str = "credentials.json", token_path: str = "token.json"):
        # Paths are relative to the backend root if running from there
        # but better to handle absolute paths or relative to this file?
        # For simplicity, assuming backend root for now or passed from config.
        
        # Adjust paths to be absolute relative to backend root
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        self.credentials_path = os.path.join(base_dir, credentials_path)
        self.token_path = os.path.join(base_dir, token_path)
        self.service = None
        self._authenticate()

    def _authenticate(self):
        creds = None
        # The file token.json stores the user's access and refresh tokens, and is
        # created automatically when the authorization flow completes for the first time.
        # Also check alternative path token_new.json in case main token is locked
        token_alt_path = os.path.join(os.path.dirname(self.token_path), "token_new.json")
        
        if os.path.exists(self.token_path):
            creds = Credentials.from_authorized_user_file(self.token_path, SCOPES)
        elif os.path.exists(token_alt_path):
            logger.info("Using alternative token path: token_new.json")
            creds = Credentials.from_authorized_user_file(token_alt_path, SCOPES)
        
        # If there are no (valid) credentials available, let the user log in.
        if not creds or not creds.valid:
            if creds and creds.expired and creds.refresh_token:
                try:
                    creds.refresh(Request())
                except Exception as e:
                     logger.error(f"Error refreshing token: {e}")
                     # If refresh fails, we might need re-auth, but in headless env this is tricky.
                     # For now, just log.
                     pass
            else:
                # We cannot do interactive login here freely if it's running in background.
                # The auth_gmail.py script handles the initial login.
                logger.warning("No valid token.json found. Please run auth_gmail.py first.")
                pass
                
        self.creds = creds
        if creds and creds.valid:
             self.service = build("gmail", "v1", credentials=creds)

    def send_email(self, to_email: str, subject: str, content: str):
        if not self.service:
            logger.error("Gmail Service not initialized. Check credentials/token.")
            # Fallback or error? For now, try to re-authenticate or fail.
            self._authenticate()
            if not self.service:
                raise Exception("Gmail service authentication failed. Valid token not found.")

        try:
            message = EmailMessage()
            message.set_content(content)
            message["To"] = to_email
            message["Subject"] = subject
            # 'From' is determined by the authenticated account
            
            # Encoded message
            encoded_message = base64.urlsafe_b64encode(message.as_bytes()).decode()

            create_message = {"raw": encoded_message}
            
            send_message = (
                self.service.users()
                .messages()
                .send(userId="me", body=create_message)
                .execute()
            )
            
            logger.info(f"Message Id: {send_message['id']}")
            return send_message

        except HttpError as error:
            logger.error(f"An error occurred: {error}")
            raise error
