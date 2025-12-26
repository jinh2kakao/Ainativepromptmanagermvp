# 로컬 환경 백엔드/프론트엔드 서버 구동 가이드

이 가이드는 로컬 환경(Windows)에서 백엔드(Python/FastAPI)와 프론트엔드(Next.js) 서버를 실행하는 방법을 설명합니다.

## 사전 요구 사항 (Prerequisites)

- **Backend**: Python 3.11 이상, 가상환경 생성됨 (`backend/venv` 또는 `.venv`)
- **Frontend**: Node.js 18 이상, npm 설치됨

## 1. 백엔드 서버 (Backend Server)

**터미널(PowerShell 또는 CMD)**을 열고 아래 명령어를 순서대로 실행하세요.

```powershell
# 1. 백엔드 폴더로 이동
cd c:\Develops\techs\Ainativepromptmanagermvp\backend

# 2. 가상환경 활성화
# Windows (PowerShell)
.\venv\Scripts\Activate.ps1
# 또는 Windows (Command Prompt)
.\venv\Scripts\activate.bat

# 3. 서버 실행 (Uvicorn)
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

- 서버 주소: `http://localhost:8000`
- API 문서(Swagger): `http://localhost:8000/docs`

## 2. 프론트엔드 서버 (Frontend Server)

**새로운 터미널** 창을 열고 아래 명령어를 실행하세요.

```powershell
# 1. 프론트엔드 폴더로 이동
cd c:\Develops\techs\Ainativepromptmanagermvp\frontend

# 2. 패키지 설치 (최초 실행 시 1회)
npm install

# 3. 개발 서버 실행
npm run dev
```

- 웹사이트 주소: `http://localhost:3000`

## 문제 해결 (Troubleshooting)

- **포트 충돌 (Port in use)**: 이미 8000번이나 3000번 포트가 사용 중이라면, 실행 중인 터미널을 찾아서 종료(Ctrl+C)하거나 프로세스를 강제 종료해주세요.
- **환경 변수 오류**: `backend/.env` 파일이 존재하는지, 그리고 `SUPABASE_SERVICE_ROLE_KEY` 및 `GMAIL` 관련 설정이 올바른지 확인해주세요.
