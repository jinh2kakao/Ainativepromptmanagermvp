from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set")

# Fix for Supabase transaction pooler (if needed in future, but standard connection string usually works)
# If using transaction pooler (port 6543), might need to disable prepared statements
# connect_args = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}

from sqlalchemy.pool import NullPool

engine = create_engine(DATABASE_URL, echo=True, poolclass=NullPool)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
    
    # Auto-migration for applicable_agents
    try:
        from sqlalchemy import text
        with engine.connect() as conn:
            # Check if column exists
            result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='prompt' AND column_name='applicable_agents'"))
            if not result.fetchone():
                print("Migrating: Adding applicable_agents column...")
                conn.execute(text("ALTER TABLE prompt ADD COLUMN applicable_agents JSON"))
                conn.commit()
            else:
                print("Migration skipped: applicable_agents already exists.")

            # Auto-migration for preview_image_url
            result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='prompttemplate' AND column_name='preview_image_url'"))
            if not result.fetchone():
                print("Migrating: Adding preview_image_url to prompttemplate...")
                conn.execute(text("ALTER TABLE prompttemplate ADD COLUMN preview_image_url TEXT"))
                conn.commit()

            # Auto-migration for terms_agreed in User table
            result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='user' AND column_name='terms_agreed'"))
            if not result.fetchone():
                print("Migrating: Adding terms_agreed to user...")
                conn.execute(text("ALTER TABLE \"user\" ADD COLUMN terms_agreed BOOLEAN DEFAULT FALSE"))
                # Existing users are deemed agreed
                conn.execute(text("UPDATE \"user\" SET terms_agreed = TRUE"))
                conn.commit()

    except Exception as e:
        print(f"Migration warning: {e}")

def get_session():
    with Session(engine) as session:
        yield session
