
from sqlmodel import SQLModel, create_engine
import sys
import os

# Add parent directory to path to import models
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models import Notice, FAQ, Inquiry, InquiryComment, AiAgent
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL not found in environment variables")

engine = create_engine(DATABASE_URL)

def migrate():
    print("Starting v3.3.0 Migration (Community Features)...")
    
    # helper for table creation
    try:
        print("Creating tables: Notice, FAQ, Inquiry, InquiryComment...")
        SQLModel.metadata.create_all(engine)
        print("Tables created successfully.")
        
        # Verify creation (optional logic could go here)
        
    except Exception as e:
        print(f"Error creating tables: {e}")
        raise e

    print("Migration v3.3.0 complete!")

if __name__ == "__main__":
    migrate()
