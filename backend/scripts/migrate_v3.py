
import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv
from sqlmodel import SQLModel

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import models to register metadata for create_all
from models import Team, TeamMember, Project

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set")

def migrate():
    # Use standard sqlalchemy engine for raw SQL execution
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        print("Starting v3.0.0 Migration...")
        
        print("Creating new tables (Team, TeamMember)...")
        SQLModel.metadata.create_all(engine)
        
        print("Altering Project table...")
        
        # Use transacion for safety
        trans = conn.begin()
        try:
            # Quote "user" because it is a reserved keyword in Postgres
            alter_queries = [
                'ALTER TABLE project ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES team(id);',
                'ALTER TABLE project ADD COLUMN IF NOT EXISTS locked_by UUID REFERENCES "user"(id);',
                'ALTER TABLE project ADD COLUMN IF NOT EXISTS locked_at TIMESTAMPTZ;',
            ]
            
            for q in alter_queries:
                conn.execute(text(q))
                print(f"Executed: {q}")
            
            trans.commit()
            print("Migration v3.0.0 Completed Successfully.")
        except Exception as e:
            trans.rollback()
            print(f"Migration Failed: {e}")
            raise e

if __name__ == "__main__":
    migrate()
