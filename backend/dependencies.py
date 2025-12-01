# [수정] Optional 임포트 추가
from typing import Annotated, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from sqlmodel import Session, select
from database import get_session
from models import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token", auto_error=False)

def get_current_user(
    # [수정] str | None 대신 Optional[str] 사용 (Python 3.9 호환)
    token: Annotated[Optional[str], Depends(oauth2_scheme)], 
    session: Session = Depends(get_session)
):
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Error: Header has no token (Authorization header missing)",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        payload = jwt.decode(token, options={"verify_signature": False})
        email: str = payload.get("email")
        
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, 
                detail="Error: Token payload has no 'email' field"
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token Validation Failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = session.exec(select(User).where(User.email == email)).first()
    if not user:
        try:
            user = User(email=email, name=email.split("@")[0], id=None)
            session.add(user)
            session.commit()
            session.refresh(user)
        except Exception as e:
             raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"DB Error: {str(e)}"
            )
        
    return user