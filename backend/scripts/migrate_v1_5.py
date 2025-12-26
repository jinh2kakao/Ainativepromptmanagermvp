import sys
import os

# Add backend directory to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from sqlmodel import Session, text
from database import engine

def add_data_column_to_project():
    with Session(engine) as session:
        try:
            # Check if column exists
            session.exec(text("SELECT data FROM project LIMIT 1"))
            print("Column 'data' already exists in 'project' table.")
        except Exception:
            session.rollback() # Rollback the failed transaction
            print("Adding 'data' column to 'project' table...")
            session.exec(text("ALTER TABLE project ADD COLUMN data JSON"))
            session.commit()
            print("Column added successfully.")

if __name__ == "__main__":
    add_data_column_to_project()
