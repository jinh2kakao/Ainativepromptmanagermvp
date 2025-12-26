import sys
import os
from pathlib import Path

# Add backend directory to path to allow imports
backend_dir = Path(__file__).resolve().parent.parent
sys.path.append(str(backend_dir))

from sqlmodel import Session, select
from database import engine
from models import User, UserRole
import uuid

def update_user_role(user_id_str: str, role: UserRole):
    try:
        user_id = uuid.UUID(user_id_str)
    except ValueError:
        print(f"Invalid UUID format: {user_id_str}")
        return

    with Session(engine) as session:
        user = session.exec(select(User).where(User.id == user_id)).first()
        
        if not user:
            print(f"User with ID {user_id} not found.")
            return

        print(f"Found user: {user.email} (Current Role: {user.role})")
        
        user.role = role
        session.add(user)
        session.commit()
        session.refresh(user)
        
        print(f"Successfully updated user {user.email} role to {user.role}")

if __name__ == "__main__":
    target_user_id = "0ccf15f6-94b6-44fe-b845-f338f9cb3414"
    update_user_role(target_user_id, UserRole.ADMIN)
