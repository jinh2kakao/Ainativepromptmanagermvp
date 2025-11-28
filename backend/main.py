from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from sqlalchemy import inspect, text
from dotenv import load_dotenv
from .database import create_db_and_tables, engine

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(lifespan=lifespan)

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
        return JSONResponse(
            status_code=500,
            content={"status": "error", "detail": str(e)}
        )
