import sys
import os
from typing import List

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlmodel import Session, select, func
from database import engine
from models import Category, PromptTemplate, PromptMode

def verify_templates():
    with Session(engine) as session:
        categories = session.exec(select(Category)).all()
        print(f"Total Categories: {len(categories)}")
        
        missing_count = 0
        total_simple_templates = 0
        
        for cat in categories:
            stmt = select(func.count(PromptTemplate.id)).where(PromptTemplate.category_id == cat.id).where(PromptTemplate.mode == PromptMode.SIMPLE)
            count = session.exec(stmt).one()
            total_simple_templates += count
            if count < 3:
                print(f"[FAIL] {cat.name}: Only {count} Simple Templates")
                missing_count += 1
            else:
                # print(f"[OK] {cat.name}: {count}")
                pass
                
        print(f"Total Simple Templates: {total_simple_templates}")
        if missing_count == 0:
            print("SUCCESS: All categories have at least 3 Simple Mode templates.")
        else:
            print(f"FAILURE: {missing_count} categories are missing templates.")

if __name__ == "__main__":
    verify_templates()
