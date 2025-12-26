import sys
import os
from sqlmodel import Session, select, func
from sqlalchemy import text

# Add the parent directory to sys.path to allow importing from backend
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import engine
from models import PromptTemplate, Category, PromptMode

import uuid

def cleanup_duplicates():
    with Session(engine) as session:
        print("Checking for duplicates...")
        
        # Find categories with multiple Assistance templates
        duplicates = session.exec(text("""
            SELECT category_id, count(*) 
            FROM prompttemplate 
            WHERE mode = 'ASSISTANCE'
            GROUP BY category_id 
            HAVING count(*) > 1
        """)).all()
        
        total_deleted = 0
        
        for cat_id_str, count in duplicates:
            if not cat_id_str:
                continue
            
            # Convert string to UUID
            try:
                cat_id = uuid.UUID(cat_id_str)
            except ValueError:
                print(f"Invalid UUID: {cat_id_str}")
                continue
                
            cat = session.get(Category, cat_id)
            cat_name = cat.name if cat else "Unknown"
            print(f"Processing category: {cat_name} ({count} templates)")
            
            # Get all templates for this category and mode
            templates = session.exec(select(PromptTemplate).where(
                PromptTemplate.category_id == cat_id,
                PromptTemplate.mode == PromptMode.ASSISTANCE
            ).order_by(PromptTemplate.updated_at.desc())).all()
            
            # Keep the first one (most recently updated), delete the rest
            to_keep = templates[0]
            to_delete = templates[1:]
            
            print(f"  Keeping: {to_keep.id} (Updated: {to_keep.updated_at})")
            
            for t in to_delete:
                print(f"  Deleting: {t.id} (Updated: {t.updated_at})")
                session.delete(t)
                total_deleted += 1
                
        session.commit()
        print(f"\nCleanup complete. Total templates deleted: {total_deleted}")

if __name__ == "__main__":
    cleanup_duplicates()
