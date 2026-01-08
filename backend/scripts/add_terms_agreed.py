from sqlalchemy import text
from backend.database import engine

def migrate():
    try:
        with engine.connect() as conn:
            print("Checking if terms_agreed column exists...")
            # PostgreSQL specific check
            result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='user' AND column_name='terms_agreed'"))
            if not result.fetchone():
                print("Adding terms_agreed column to user table...")
                conn.execute(text("ALTER TABLE \"user\" ADD COLUMN terms_agreed BOOLEAN DEFAULT FALSE"))
                
                print("Updating existing users to terms_agreed = TRUE...")
                conn.execute(text("UPDATE \"user\" SET terms_agreed = TRUE"))
                
                conn.commit()
                print("Successfully added terms_agreed column.")
            else:
                print("Column terms_agreed already exists.")
                
    except Exception as e:
        print(f"Migration failed: {e}")

if __name__ == "__main__":
    migrate()
