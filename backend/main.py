import os
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from sqlmodel import SQLModel, text
from database import create_db_and_tables, engine 
from models import User, Prompt
from dependencies import get_current_user
from routers import prompts

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(lifespan=lifespan)

# [CORS 설정 수정 시작] ==============================================
# 1. 환경 변수에서 허용할 목록을 가져옵니다. (없으면 로컬호스트를 기본값으로 사용)
# 예: Render 환경변수에 "https://myapp.vercel.app,http://localhost:3000" 라고 설정하면 됨
origins_str = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")

# 2. 콤마(,)를 기준으로 잘라서 리스트로 만듭니다.
origins = [origin.strip() for origin in origins_str.split(",")]

# 3. 미들웨어에 리스트를 전달합니다.
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # 이제 고정값이 아니라 변수(origins)를 사용합니다.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# [CORS 설정 수정 끝] ================================================

app.include_router(prompts.router)

@app.get("/")
def read_root():
    return {"message": "Hello World"}

@app.get("/api/me", response_model=User)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@app.get("/api/health-db")
def health_db():
    try:
        SQLModel.metadata.create_all(engine)
        with engine.connect() as conn:
            result = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"))
            tables = [row[0] for row in result]
        return {"status": "ok", "tables": tables}
    except Exception as e:
        return {"status": "error", "message": str(e)}