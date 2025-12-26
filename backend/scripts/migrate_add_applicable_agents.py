import sys
import os
from sqlmodel import Session, select
from sqlalchemy import text

# Add the parent directory to sys.path to allow importing from backend
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import engine

def migrate_applicable_agents():
    with Session(engine) as session:
        try:
            # Check if column exists
            try:
                # Try to select the column. If it fails, it doesn't exist.
                session.exec(text("SELECT applicable_agents FROM prompttemplate LIMIT 1"))
                print("Column 'applicable_agents' already exists.")
            except Exception:
                session.rollback()
                print("Column 'applicable_agents' does not exist. Adding it...")
                try:
                    # using JSON type which is standard for SQLModel's sa_column=Column(JSON)
                    session.exec(text("ALTER TABLE prompttemplate ADD COLUMN applicable_agents JSON"))
                    session.commit()
                    print("Successfully added 'applicable_agents' column.")
                except Exception as e:
                    print(f"Failed to execute ALTER TABLE: {e}")
                    session.rollback()
        except Exception as e:
            print(f"An error occurred: {e}")
            session.rollback()

if __name__ == "__main__":
    migrate_applicable_agents()
