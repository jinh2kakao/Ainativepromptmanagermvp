import sqlite3
import os

# Path to the database
# Based on previous file listing, it's in the root of the project, but let's check relative to backend
# The user's workspace root is /Users/jinh/Ainativepromptmanagermvp
# The backend is in /Users/jinh/Ainativepromptmanagermvp/backend
# The db seems to be at /Users/jinh/Ainativepromptmanagermvp/prompt_manager.db

DB_PATH = "/Users/jinh/Ainativepromptmanagermvp/prompt_manager.db"

def add_column():
    if not os.path.exists(DB_PATH):
        print(f"Database not found at {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        # Check if column exists
        cursor.execute("PRAGMA table_info(user)")
        columns = [info[1] for info in cursor.fetchall()]
        
        if "subscription_end_date" in columns:
            print("Column 'subscription_end_date' already exists.")
        else:
            print("Adding column 'subscription_end_date'...")
            cursor.execute("ALTER TABLE user ADD COLUMN subscription_end_date DATETIME")
            conn.commit()
            print("Column added successfully.")
            
    except Exception as e:
        print(f"An error occurred: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    add_column()
