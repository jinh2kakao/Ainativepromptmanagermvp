
import sys
import os

# Add parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlmodel import Session, select
from database import engine
from models import Category

def list_categories():
    with Session(engine) as session:
        categories = session.exec(select(Category)).all()
        print(f"Found {len(categories)} categories:")
        for cat in categories:
            print(f"Name: {cat.name}, Value: {cat.value}")

if __name__ == "__main__":
    list_categories()
