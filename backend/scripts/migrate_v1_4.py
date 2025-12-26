import sys
import os
from sqlalchemy import text

# Add parent directory to path to import backend modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import engine, create_db_and_tables
from sqlmodel import SQLModel
from models import PromptTemplate, Project, ProjectNode, ProjectTemplate

def migrate():
    print("Starting migration for v1.4.0...")
    
    with engine.connect() as conn:
        conn = conn.execution_options(isolation_level="AUTOCOMMIT")
        
        # 1. Drop PromptTemplate table to reset schema (it has new columns)
        print("Dropping 'prompttemplate' table...")
        try:
            conn.execute(text("DROP TABLE IF EXISTS prompttemplate CASCADE"))
            print("Dropped 'prompttemplate'.")
        except Exception as e:
            print(f"Error dropping table: {e}")

        # 2. Drop new tables if they exist (to be safe)
        print("Dropping project tables if they exist...")
        try:
            conn.execute(text("DROP TABLE IF EXISTS projectnode CASCADE"))
            conn.execute(text("DROP TABLE IF EXISTS project CASCADE"))
            conn.execute(text("DROP TABLE IF EXISTS projecttemplate CASCADE"))
        except Exception as e:
            print(f"Error dropping project tables: {e}")

    # 3. Create all tables (will create missing ones)
    print("Creating tables...")
    create_db_and_tables()
    print("Tables created.")

    # 4. Run Seed Scripts
    print("Seeding templates...")
    try:
        from scripts.seed_assistance_templates import seed_assistance_templates as seed_assistance
        # We might need to import seed_categories too if they are missing, but we preserved them.
        # But let's run seed_categories just in case (it usually checks existence).
        from scripts.seed_categories import seed_categories
        
        print("Seeding categories...")
        seed_categories()
        
        print("Seeding assistance templates...")
        seed_assistance()
        
        print("Seeding completed.")
    except Exception as e:
        print(f"Error during seeding: {e}")

if __name__ == "__main__":
    migrate()
