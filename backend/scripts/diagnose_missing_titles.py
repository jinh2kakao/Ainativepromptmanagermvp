
import sys
import os

# Add parent directory to sys.path to allow imports from backend root
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlmodel import Session, select
from database import engine
from models import PromptTemplate

def find_missing_titles():
    with Session(engine) as session:
        # Find templates where title is null or empty string
        templates = session.exec(select(PromptTemplate)).all()
        
        missing_count = 0
        for t in templates:
            # Check for empty/null title
            if not t.title or t.title.strip() == "":
                print(f"ID: {t.id}, Name: '{t.name}', Title: '{t.title}', Default: {t.is_default}")
                missing_count += 1
                
        print(f"Total templates with missing titles: {missing_count}")

if __name__ == "__main__":
    find_missing_titles()
