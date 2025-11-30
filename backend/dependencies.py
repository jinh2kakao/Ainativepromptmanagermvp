import os
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import Session, select
from dotenv import load_dotenv
from .database import get_session
from .models import User, UserType
import uuid

load_dotenv()

SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
ALGORITHM = "HS256"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_current_user(token: str = Depends(oauth2_scheme), session: Session = Depends(get_session)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Verify JWT
        # Note: In production, you might want to verify 'aud' as well.
        # Supabase JWTs usually have 'aud' set to 'authenticated'.
        payload = jwt.decode(token, SUPABASE_SERVICE_KEY, algorithms=[ALGORITHM], options={"verify_aud": False})
        user_id: str = payload.get("sub")
        email: str = payload.get("email")
        
        if user_id is None:
            raise credentials_exception
            
    except jwt.PyJWTError:
        raise credentials_exception

    # Check if user exists in DB
    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise credentials_exception

    statement = select(User).where(User.id == user_uuid)
    user = session.exec(statement).first()

    if not user:
        # Upsert (Create) User
        # We assume email is present in the token.
        if not email:
             # Fallback or error if email is missing? 
             # For now, let's assume it's there or handle gracefully.
             # Supabase tokens usually have email.
             pass

        user = User(
            id=user_uuid,
            email=email if email else f"{user_id}@placeholder.com", # Fallback
            user_type=UserType.FREE
        )
        session.add(user)
        session.commit()
        session.refresh(user)
    
    return user
