
import sys
import os
from sqlalchemy import create_engine, text

# Add parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import engine

def migrate_add_category_fields():
    with engine.connect() as conn:
        print("Checking if 'icon' and 'description' columns exist in 'category' table...")
        
        # Check if columns exist (PostgreSQL specific)
        result = conn.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='category' AND column_name IN ('icon', 'description');
        """)).fetchall()
        
        existing_columns = [row[0] for row in result]
        
        if 'icon' not in existing_columns:
            print("Adding 'icon' column...")
            conn.execute(text("ALTER TABLE category ADD COLUMN icon VARCHAR NULL;"))
            print("Added 'icon' column.")
        else:
            print("'icon' column already exists.")
            
        if 'description' not in existing_columns:
            print("Adding 'description' column...")
            conn.execute(text("ALTER TABLE category ADD COLUMN description VARCHAR NULL;"))
            print("Added 'description' column.")
        else:
            print("'description' column already exists.")
            
        conn.commit()
        print("Migration complete.")

if __name__ == "__main__":
    migrate_add_category_fields()
