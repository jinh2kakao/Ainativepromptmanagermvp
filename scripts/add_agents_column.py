import os
from sqlmodel import create_engine, text

from dotenv import load_dotenv

# Database URL
BASE_DIR = os.path.dirname(os.path.abspath(__file__)) # scripts/
PROJECT_ROOT = os.path.dirname(BASE_DIR) # root
ENV_PATH = os.path.join(PROJECT_ROOT, "backend", ".env")

load_dotenv(ENV_PATH)
DATABASE_URL = os.getenv("DATABASE_URL")
print(f"Loaded DATABASE_URL from .env: {DATABASE_URL}")

if not DATABASE_URL:
    # Fallback if not found in .env (though it should be)
    DB_PATH = os.path.join(PROJECT_ROOT, "backend", "prompt_manager.db")
    DB_PATH = DB_PATH.replace(os.sep, '/')
    DATABASE_URL = f"sqlite:///{DB_PATH}"
    print(f"Fallback DATABASE_URL: {DATABASE_URL}")

# Create engine
engine = create_engine(DATABASE_URL)

from sqlalchemy import inspect

def check_and_add_column():
    print(f"Checking database at {DATABASE_URL}...")
    
    inspector = inspect(engine)
    
    tables = inspector.get_table_names()
    print(f"Tables in DB: {tables}")
    
    if "prompt" not in tables:
        print("Table 'prompt' not found!")
        # It's possible tables are created but Uppercase? SQLAlchemy usually handles this.
        # But let's printing all tables helps.
        return

    columns = [col['name'] for col in inspector.get_columns("prompt")]
    
    if "applicable_agents" in columns:
        print("Column 'applicable_agents' already exists in 'prompt' table.")
    else:
        print("Column 'applicable_agents' missing. Adding it...")
        with engine.connect() as conn:
            with conn.begin(): # Transaction
                # Postgres/Generic syntax
                conn.execute(text("ALTER TABLE prompt ADD COLUMN applicable_agents JSON"))
        print("Successfully added 'applicable_agents' column.")
            
if __name__ == "__main__":
    check_and_add_column()
