from database import get_session
from models import User
from sqlmodel import select

def check_user(email):
    session = next(get_session())
    user = session.exec(select(User).where(User.email == email)).first()
    if user:
        print(f"User found: {user.email}, Provider: {user.auth_provider}")
    else:
        print("User not found")

if __name__ == "__main__":
    check_user("jinh2@kakao.com")
