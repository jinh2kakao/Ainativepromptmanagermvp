
import sys
import os

# Add parent directory to sys.path to allow imports from backend root
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlmodel import Session, select
from database import engine
from models import PromptTemplate, Category

def fix_missing_titles():
    with Session(engine) as session:
        # Find templates where title is null or empty string
        templates = session.exec(select(PromptTemplate)).all()
        
        fixed_count = 0
        for t in templates:
            # Check for empty/null title AND valid name
            if (not t.title or t.title.strip() == "") and t.name:
                new_title = t.name
                
                # If name is generic, try to use Category
                if t.name == "Assistance Template" and t.category_id:
                    cat = session.get(Category, t.category_id)
                    if cat:
                        new_title = f"{cat.value} 템플릿" # Use Korean suffix
                
                print(f"Fixing ID: {t.id} - Setting Title to '{new_title}'")
                t.title = new_title
                session.add(t)
                fixed_count += 1
                
        if fixed_count > 0:
            session.commit()
            print(f"Successfully fixed {fixed_count} templates.")
        else:
            print("No templates needed fixing.")

if __name__ == "__main__":
    fix_missing_titles()
