
import sys
import os

# Add parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlmodel import Session, select, func
from database import engine
from models import PromptTemplate, PromptMode

def count_templates():
    with Session(engine) as session:
        # Count Simple Mode
        simple_count = session.exec(select(func.count(PromptTemplate.id)).where(PromptTemplate.mode == PromptMode.SIMPLE)).one()
        
        # Count Assistance Mode
        assistance_count = session.exec(select(func.count(PromptTemplate.id)).where(PromptTemplate.mode == PromptMode.ASSISTANCE)).one()
        
        print(f"Simple Mode Templates: {simple_count}")
        print(f"Assistance Mode Templates: {assistance_count}")

if __name__ == "__main__":
    count_templates()
