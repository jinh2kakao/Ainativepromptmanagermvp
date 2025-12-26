import sys
import os

# Add parent directory to sys.path to allow imports from backend root
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlmodel import Session, select
from database import engine
from models import PromptTemplate

def sync_names():
    with Session(engine) as session:
        templates = session.exec(select(PromptTemplate)).all()
        count = 0
        for t in templates:
            # If title exists and differs from name, update name to match title
            # This ensures Admin Console (using name) matches User UI (using title)
            if t.title and t.name != t.title:
                print(f"Updating ID {t.id}: Name '{t.name}' -> '{t.title}'")
                t.name = t.title
                session.add(t)
                count += 1
        
        if count > 0:
            session.commit()
            print(f"Successfully synchronized {count} templates.")
        else:
            print("No templates needed synchronization.")

if __name__ == "__main__":
    sync_names()
