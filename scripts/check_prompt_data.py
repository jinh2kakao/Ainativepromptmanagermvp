import sys
import os
from dotenv import load_dotenv

# Add current dir to sys.path
sys.path.append(os.getcwd())

from sqlmodel import create_engine, Session, select
from sqlalchemy import text
import sqlalchemy

# Load env from backend/.env
load_dotenv('backend/.env')

# Re-create engine if needed or import
database_url = os.getenv("DATABASE_URL")
if not database_url:
    print("DATABASE_URL not found")
    exit(1)

# Because we are running from root, and backend modules might be tricky to import if not in pythonpath
# I will make this a standalone script that imports models if possible, or just uses raw SQL.
# Using raw SQL is safer to avoid import errors.

import sqlalchemy
from sqlalchemy import text

db = sqlalchemy.create_engine(database_url)

with db.connect() as conn:
    # prompt ID from screenshot/browser
    prompt_id = 'a4517701-ace5-4b7f-8156-0b5f8eee92f2'
    
    result = conn.execute(text(f"SELECT title, applicable_agents FROM prompt WHERE id = '{prompt_id}'"))
    row = result.fetchone()
    
    if row:
        print(f"Title: {row[0]}")
        print(f"Applicable Agents (Raw): {row[1]}")
        print(f"Type: {type(row[1])}")
    else:
        print("Prompt not found")
