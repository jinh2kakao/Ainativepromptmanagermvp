import os
from dotenv import load_dotenv

# Load environment variables first
load_dotenv()

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from sqlmodel import SQLModel, text
from database import create_db_and_tables, engine
from models import User, Prompt
from dependencies import get_current_user
from routers import (
    prompts,
    admin,
    templates,
    categories,
    projects,
    teams,
    prompt_optimization,
    admin_agents,
    auth,
    crucible,
    verification,
    notices,
    faqs,
    inquiries,
    inquiries,
    agents,
    onboarding
)

import threading
from optimizer_worker.main import worker_loop
@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    
    # [Auto-Migration] Apply v3.0.0 changes (Add Team columns to Project)
    # This is safe to run on every startup
    try:
        with engine.connect() as conn:
            # Use transaction for safety
            trans = conn.begin()
            try:
                alter_queries = [
                    'ALTER TABLE project ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES team(id);',
                    'ALTER TABLE project ADD COLUMN IF NOT EXISTS locked_by UUID REFERENCES "user"(id);',
                    'ALTER TABLE project ADD COLUMN IF NOT EXISTS locked_at TIMESTAMPTZ;',
                    'ALTER TABLE "user" ADD COLUMN IF NOT EXISTS auth_provider VARCHAR;',
                    # [v3.2.0] PromptTemplate Schema Update
                    'ALTER TABLE prompttemplate ADD COLUMN IF NOT EXISTS title VARCHAR;',
                    'ALTER TABLE prompttemplate ADD COLUMN IF NOT EXISTS name VARCHAR DEFAULT \'Default Template\';',
                    'ALTER TABLE prompttemplate ADD COLUMN IF NOT EXISTS applicable_agents JSON;',
                    'ALTER TABLE prompttemplate ADD COLUMN IF NOT EXISTS preview_image_url TEXT;',
                ]
                for q in alter_queries:
                    conn.execute(text(q))
                trans.commit()
                print("Auto-migration v3.0.0 (Project columns) checked/applied.")
            except Exception as e:
                trans.rollback()
                print(f"Auto-migration v3.0.0 failed (non-critical if columns exist): {e}")
    except Exception as e:
         print(f"DB Connection for migration failed: {e}")

    
    # Start the worker loop in a separate thread
    # Daemon thread ensures it dies when main process dies
    worker_thread = threading.Thread(target=worker_loop, daemon=True)
    worker_thread.start() 
    print("Optimization Worker thread started within Main App.")
    
    yield

# Trigger Deployment: 2025-12-18 17:58

app = FastAPI(lifespan=lifespan)

# Cloudflare 등 Proxy 뒤에 있을 때 HTTPS 인식을 위해 추가
from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware
app.add_middleware(ProxyHeadersMiddleware, trusted_hosts=["*"])

# [CORS 설정 수정 시작] ==============================================
# 1. 환경 변수에서 허용할 목록을 가져옵니다. (없으면 로컬호스트를 기본값으로 사용)
# 예: Render 환경변수에 "https://myapp.vercel.app,http://localhost:3000" 라고 설정하면 됨
origins_str = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:3001,http://127.0.0.1:3000,https://jinh2kakao.github.io,https://promptlib.co.kr,https://www.promptlib.co.kr,https://api.promptlib.co.kr")

# 2. 콤마(,)를 기준으로 잘라서 리스트로 만듭니다.
origins = [origin.strip() for origin in origins_str.split(",")]

# 3. 미들웨어에 리스트를 전달합니다.
# 3. 미들웨어에 리스트를 전달합니다.
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, # 구체적인 오리진 목록 사용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# [CORS 설정 수정 끝] ================================================

app.include_router(prompts.router)
app.include_router(admin.router)
app.include_router(admin_agents.router)
app.include_router(templates.router)
app.include_router(categories.router)
app.include_router(teams.router)
app.include_router(verification.router)

# Original routers that were not explicitly included in the user's provided list,
# but were present before and are still imported.
# Keeping them to avoid unintended removal, assuming the user's snippet was
# an addition/modification rather than a full replacement of all router includes.
app.include_router(auth.router)
app.include_router(crucible.router)
app.include_router(projects.router)
app.include_router(prompt_optimization.router)

# Community Routers
app.include_router(notices.router)
app.include_router(faqs.router)
app.include_router(inquiries.router)
app.include_router(agents.router)
app.include_router(onboarding.router)


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