import sys
import os
from sqlalchemy import text
from sqlmodel import Session

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import engine

def migrate_add_title():
    with Session(engine) as session:
        try:
            # Check if column exists
            session.exec(text("SELECT title FROM prompttemplate LIMIT 1"))
            print("Column 'title' already exists.")
        except Exception:
            print("Column 'title' does not exist. Adding it...")
            session.rollback() # Rollback the failed transaction
            try:
                session.exec(text("ALTER TABLE prompttemplate ADD COLUMN title VARCHAR"))
                session.commit()
                print("Successfully added 'title' column.")
            except Exception as e:
                print(f"Failed to add column: {e}")
                session.rollback()

if __name__ == "__main__":
    migrate_add_title()
