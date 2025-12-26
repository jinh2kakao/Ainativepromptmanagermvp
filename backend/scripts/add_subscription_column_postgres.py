import sys
import os

# Add backend directory to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from database import engine
from sqlalchemy import text

def migrate():
    print(f"Migrating database using engine: {engine.url}")
    
    with engine.connect() as connection:
        try:
            # Check if column exists first to avoid error
            # But 'ALTER TABLE ... ADD COLUMN IF NOT EXISTS' is Postgres specific and safe
            print("Adding column 'subscription_end_date' to 'user' table...")
            connection.execute(text('ALTER TABLE "user" ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP WITHOUT TIME ZONE'))
            connection.commit()
            print("Migration successful.")
        except Exception as e:
            print(f"Migration failed: {e}")
            # connection.rollback() # Auto-rollback on error context usually, but explicit is fine if needed

if __name__ == "__main__":
    migrate()
