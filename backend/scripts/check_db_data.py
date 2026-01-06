import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from sqlmodel import Session, select
from database import get_session
from models import Category, PromptTemplate

def check_data():
    session = next(get_session())
    
    print("\n--- Categories (Values) ---")
    cats = session.exec(select(Category)).all()
    # Print Hierarchy for debugging
    parents = session.exec(select(Category).where(Category.parent_id == None)).all()
    print("\nParent Categories and Children:")
    for p in parents:
        print(f"- {p.value} ({p.name})")
        for c in p.children:
            print(f"  > {c.value} ({c.name})")
    values = sorted([c.value for c in cats])
    print(values)

    print(f"\nTotal Categories: {len(cats)}")
    # print(f"Total Templates: {session.exec(select(PromptTemplate).count())}")

if __name__ == "__main__":
    check_data()
