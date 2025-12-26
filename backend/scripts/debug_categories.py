import sys
import os
from typing import List, Dict, Any

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlmodel import Session, select, func
from database import engine
from models import Category, PromptTemplate, PromptMode

def list_categories():
    with Session(engine) as session:
        categories = session.exec(select(Category)).all()
        print(f"Total Categories: {len(categories)}")
        
        for cat in categories:
            # Count templates
            stmt = select(func.count(PromptTemplate.id)).where(PromptTemplate.category_id == cat.id).where(PromptTemplate.mode == PromptMode.SIMPLE)
            count = session.exec(stmt).one()
            print(f"- {cat.name} (ID: {cat.id}): {count} Simple Templates")

if __name__ == "__main__":
    list_categories()
