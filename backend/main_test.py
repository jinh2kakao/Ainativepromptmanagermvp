
import os
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from sqlmodel import SQLModel, text
from database import create_db_and_tables, engine 
from models import User, Prompt
from dependencies import get_current_user
from routers import auth, prompts, admin, templates, categories, crucible, projects, prompt_optimization, teams


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Lifespan: Creating tables...")
    create_db_and_tables()
    print("Lifespan: Tables created.")
    yield

app = FastAPI(lifespan=lifespan)

from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware
app.add_middleware(ProxyHeadersMiddleware, trusted_hosts=["*"])

origins_str = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")
origins = [origin.strip() for origin in origins_str.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(prompts.router)
app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(crucible.router)
app.include_router(projects.router)
app.include_router(prompt_optimization.router)
app.include_router(templates.router)
app.include_router(categories.router)
app.include_router(teams.router)

@app.get("/")
def read_root():
    return {"message": "Hello World - Test Mode"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
