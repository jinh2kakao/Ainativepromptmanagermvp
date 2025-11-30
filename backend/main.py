from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from sqlmodel import SQLModel, text
from database import create_db_and_tables, engine 
from models import User, Prompt
# [추가] 인증 의존성 주입 (dependencies.py가 생성되었다고 가정)
from dependencies import get_current_user

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Hello World"}

# [추가] 내 정보 조회 API (로그인 확인용)
# 헤더에 유효한 Token이 없으면 401 에러가 발생합니다.
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