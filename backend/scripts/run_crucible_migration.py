
import sys
import os
from sqlalchemy import text

# Add backend directory to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from database import engine

def run_migration():
    sql_file_path = os.path.join(os.path.dirname(__file__), '..', 'project_crucible_schema.sql')
    print(f"Reading SQL file from: {sql_file_path}")
    
    try:
        with open(sql_file_path, 'r') as f:
            sql_content = f.read()
            
        print("Connecting to database...")
        with engine.connect() as connection:
            # Begin transaction
            trans = connection.begin()
            try:
                print("Executing SQL...")
                # Execute the full content
                connection.execute(text(sql_content))
                trans.commit()
                print("Migration successful: Project Crucible Schema Applied.")
            except Exception as e:
                trans.rollback()
                print(f"Error executing SQL: {e}")
                raise e
                
    except Exception as e:
        print(f"Migration failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    run_migration()
