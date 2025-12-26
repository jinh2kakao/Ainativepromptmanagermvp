#!/usr/bin/env python3
"""Show all category values that contain '리서치' or 'Research'"""

import sys
sys.path.insert(0, '/Users/jinh/Ainativepromptmanagermvp/backend')

from sqlmodel import Session
from database import engine
from models import Category
from sqlmodel import select

def main():
    with Session(engine) as session:
        print("=== All Categories (name and value) ===")
        categories = session.exec(select(Category)).all()
        
        for cat in sorted(categories, key=lambda c: (str(c.parent_id) if c.parent_id else '', c.name)):
            indent = "  " if cat.parent_id else ""
            print(f"{indent}{cat.name}")
            if cat.name != cat.value:
                print(f"{indent}  -> value: '{cat.value}'")
            print()

if __name__ == "__main__":
    main()
