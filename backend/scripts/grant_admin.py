import sys
import os
import uuid
from sqlmodel import Session, select

# Add the parent directory to sys.path to allow importing from backend
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import engine
from models import User, UserRole

def grant_admin(user_id_str):
    try:
        user_id = uuid.UUID(user_id_str)
    except ValueError:
        print(f"Invalid UUID: {user_id_str}")
        return

    with Session(engine) as session:
        user = session.get(User, user_id)
        if user:
            user.role = UserRole.ADMIN
            session.add(user)
            session.commit()
            session.refresh(user)
            print(f"Successfully granted ADMIN role to user: {user.email} ({user.id})")
            print(f"Current Role: {user.role}")
        else:
            print(f"User not found with ID: {user_id}")

if __name__ == "__main__":
    target_user_id = "4d25d813-e4ab-4c6f-9533-55a48421a377"
    grant_admin(target_user_id)
