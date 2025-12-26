import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Setup path and load env
sys.path.append(os.getcwd())
load_dotenv('backend/.env')

# Get DB URL
database_url = os.getenv("DATABASE_URL")
if not database_url:
    print("DATABASE_URL is missing")
    exit(1)

# Ensure 127.0.0.1 usage if issues with localhost
# database_url = database_url.replace("localhost", "127.0.0.1")

print(f"Connecting to: {database_url}")

try:
    engine = create_engine(database_url)
    with engine.connect() as conn:
        # Check if column exists
        check_sql = text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='prompt' AND column_name='applicable_agents';
        """)
        result = conn.execute(check_sql)
        exists = result.fetchone()
        
        if exists:
            print("Column 'applicable_agents' ALREADY EXISTS.")
        else:
            print("Column 'applicable_agents' MISSING. Adding it now...")
            conn.execute(text("ALTER TABLE prompt ADD COLUMN applicable_agents JSON;"))
            conn.commit()
            print("Column 'applicable_agents' ADDED SUCCESSFULLY.")

except Exception as e:
    print(f"Migration Failed: {e}")
