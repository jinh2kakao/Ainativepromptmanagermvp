
from sqlmodel import Session, create_engine, text
import sys
import os

# Add parent directory to path to import models
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL not found in environment variables")

engine = create_engine(DATABASE_URL)

def migrate():
    with engine.connect() as conn:
        trans = conn.begin()
        try:
            print("Checking optimizationjob table...")
            # Check if column exists
            check_sql = text("SELECT column_name FROM information_schema.columns WHERE table_name='optimizationjob' AND column_name='optimized_content'")
            result = conn.execute(check_sql).fetchone()
            
            if not result:
                print("Adding missing column 'optimized_content'...")
                conn.execute(text("ALTER TABLE optimizationjob ADD COLUMN optimized_content VARCHAR"))
                print("Column added.")
            else:
                print("Column 'optimized_content' already exists.")
                
            trans.commit()
            print("Migration fix complete!")
        except Exception as e:
            trans.rollback()
            print(f"Migration failed: {e}")

if __name__ == "__main__":
    migrate()
