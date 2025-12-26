from fastapi import APIRouter, HTTPException, status, Depends, Body
from pydantic import BaseModel, EmailStr
from typing import Optional
import random
import string
# import smtplib (removed)
# from email.message import EmailMessage (removed)
import os
import time

from services.email.gmail import GmailService
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os

# Explicitly load from backend/.env
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')
load_dotenv(dotenv_path=env_path, override=True)

# Load config at module level
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")

# Debug print
print(f"Loading .env from: {env_path}", flush=True)
print(f"SMTP_USER loaded: {SMTP_USER}", flush=True)
print(f"SMTP_PASSWORD loaded: {'Yes' if SMTP_PASSWORD else 'No'}", flush=True)

import logging

# Configure logger
logger = logging.getLogger("uvicorn")

# Simple in-memory storage for verification codes (for MVP)
# In production, use Redis.
verification_codes = {}

router = APIRouter(
    prefix="/api/verification",
    tags=["verification"],
    responses={404: {"description": "Not found"}},
)

class EmailRequest(BaseModel):
    email: EmailStr

class VerifyRequest(BaseModel):
    email: EmailStr
    code: str

def generate_code(length=6):
    return ''.join(random.choices(string.digits, k=length))

def send_email_smtp(to_email: str, code: str):
    # Use module level variables
    global SMTP_SERVER, SMTP_PORT, SMTP_USER, SMTP_PASSWORD
    
    # Just in case module-level load failed, try loading again if missing (though unlikely if restart works)
    # Removing re-load logic for hardcoded test
    
    print(f"[DEBUG Function] SMTP_USER: {SMTP_USER}, SMTP_PASSWORD Length: {len(SMTP_PASSWORD) if SMTP_PASSWORD else 0}", flush=True)

    if not SMTP_USER or not SMTP_PASSWORD:
        log_msg = f"[MOCK EMAIL] To: {to_email}, Code: {code}"
        print(log_msg, flush=True)
        # also log to file just in case
        with open("mock_email.log", "a") as f:
            f.write(f"{datetime.utcnow()} - {log_msg}\n")
        return

    msg = EmailMessage()
    msg.set_content(f"Your verification code is: {code}\n\nThis code expires in 5 minutes.")
    msg['Subject'] = "Your Verification Code"
    msg['From'] = SMTP_USER
    msg['To'] = to_email

    try:
        if SMTP_PORT == 465:
            with smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT) as server:
                server.set_debuglevel(1) # Enable verbose debug output
                server.login(SMTP_USER, SMTP_PASSWORD)
                server.send_message(msg)
        else:
            with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
                server.set_debuglevel(1) # Enable verbose debug output
                server.starttls()
                server.login(SMTP_USER, SMTP_PASSWORD)
                server.send_message(msg)
    except Exception as e:
        print(f"Failed to send email: {e}")
        raise HTTPException(status_code=500, detail="Failed to send verification email")

@router.post("/send-code")
def send_verification_code(request: EmailRequest):
    email = request.email
    code = generate_code()
    
    # Store code with expiration (5 mins)
    expiration = datetime.utcnow() + timedelta(minutes=5)
    verification_codes[email] = {
        "code": code,
        "expires_at": expiration
    }
    
    # Send email
    try:
        service = GmailService()
        service.send_email(
            to_email=email,
            subject="Your Verification Code",
            content=f"Your verification code is: {code}\n\nThis code expires in 5 minutes."
        )
    except Exception as e:
        logger.error(f"Failed to send email via Gmail API: {e}")
        # In production, might want to re-raise or handle gracefully
        raise HTTPException(status_code=500, detail="Failed to send verification email")
    
    return {"message": "Verification code sent"}

@router.post("/verify-code")
def verify_code(request: VerifyRequest):
    email = request.email
    code = request.code
    
    record = verification_codes.get(email)
    
    if not record:
        raise HTTPException(status_code=400, detail="No verification code found for this email")
        
    if datetime.utcnow() > record["expires_at"]:
        del verification_codes[email]
        raise HTTPException(status_code=400, detail="Verification code expired")
        
    if record["code"] != code:
        raise HTTPException(status_code=400, detail="Invalid verification code")
        
    # Verification success
    # Remove code to prevent reuse
    del verification_codes[email]
    
    return {"message": "Verification successful", "verified": True}
