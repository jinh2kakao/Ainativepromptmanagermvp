from fastapi import FastAPI

from dotenv import load_dotenv

load_dotenv()

from sqlalchemy import inspect
from .database import create_db_and_tables, engine

app = FastAPI()

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

@app.get("/")
def read_root():
    return {"message": "Hello World"}

@app.get("/api/health-db")
def health_db():
    try:
        # 1. Force create tables
        create_db_and_tables()
        
        # 2. Check connection and list tables
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        return {"status": "ok", "tables": tables}
    except Exception as e:
        return {"status": "error", "detail": str(e)}
