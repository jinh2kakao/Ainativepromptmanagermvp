import os
import sys
# Try to import sqlalchemy, if not present, user needs to install or run in venv
try:
    from sqlalchemy import create_engine, text
except ImportError:
    print("Error: sqlalchemy not installed. Please run this in your backend virtual environment.")
    sys.exit(1)

# Manual env loading to avoid dotenv dependency if possible, but dotenv is likely there.
try:
    from dotenv import load_dotenv
    load_dotenv('backend/.env')
except ImportError:
    # If dotenv missing, try manual read
    try:
        with open('backend/.env', 'r') as f:
            for line in f:
                if line.startswith('DATABASE_URL='):
                    os.environ['DATABASE_URL'] = line.strip().split('=', 1)[1]
    except:
        pass

database_url = os.getenv("DATABASE_URL")
if not database_url:
    print("Error: DATABASE_URL not found in backend/.env")
    sys.exit(1)

print(f"Target Database: {database_url}")

def migrate():
    try:
        engine = create_engine(database_url)
        with engine.connect() as conn:
            print("Connected to database.")
            
            # Check existing columns
            print("Checking schema...")
            # PostgreSQL specific check
            try:
                result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='prompt' AND column_name='applicable_agents'"))
                row = result.fetchone()
                
                if row:
                    print("✅ Column 'applicable_agents' ALREADY EXISTS.")
                else:
                    print("⚠️ Column 'applicable_agents' MISSING.")
                    print("Attempting to add column...")
                    conn.execute(text("ALTER TABLE prompt ADD COLUMN applicable_agents JSON"))
                    conn.commit()
                    print("✅ Column 'applicable_agents' ADDED SUCCESSFULLY.")
            except Exception as e:
                print(f"Error checking/adding column: {e}")
                
    except Exception as e:
        print(f"❌ Connection Failed: {e}")
        print("Please ensure your database is running and accessible.")

if __name__ == "__main__":
    migrate()
