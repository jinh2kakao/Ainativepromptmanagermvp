import sys
import os

# Add parent directory to path to import database
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from database import engine

def migrate_enum():
    print("Starting migration: Adding 'enterprise' to usertype Enum...")
    with engine.connect() as conn:
        # Use isolation level AUTOCOMMIT to ensure ALTER TYPE runs immediately
        conn = conn.execution_options(isolation_level="AUTOCOMMIT")
        try:
            conn.execute(text("ALTER TYPE usertype ADD VALUE 'enterprise'"))
            print("Successfully added 'enterprise' to usertype enum.")
        except Exception as e:
            if "already exists" in str(e):
                print("Value 'enterprise' already exists in usertype enum.")
            else:
                print(f"Error during migration: {e}")
                # Some Postgres setups might fail ALTER TYPE inside a transaction block if not careful,
                # hence isolation_level="AUTOCOMMIT" above.

if __name__ == "__main__":
    migrate_enum()
