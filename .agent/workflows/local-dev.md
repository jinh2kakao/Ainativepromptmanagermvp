---
description: 로컬 개발 환경 서버 구동 방법 (Backend + Frontend)
---

# 로컬 개발 서버 구동

## 사전 요구사항
- Python 3.11+ 설치
- Node.js 18+ 설치
- 환경변수 설정 완료 (`backend/.env`, `frontend/.env.local`)

---

## Backend 서버 구동

### 1. 백엔드 디렉토리 이동 및 가상환경 활성화

```powershell
cd c:\Develops\techs\Ainativepromptmanagermvp\backend
```

### 2. 가상환경 활성화 (Windows)

```powershell
..\.venv\Scripts\Activate.ps1
```

### 3. 의존성 설치 (필요한 경우)

```powershell
pip install -r requirements.txt
```

### 4. 백엔드 서버 실행

// turbo
```powershell
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

> 서버 주소: http://localhost:8000
> API 문서: http://localhost:8000/docs

---

## Frontend 서버 구동

### 1. 프론트엔드 디렉토리 이동

```powershell
cd c:\Develops\techs\Ainativepromptmanagermvp\frontend
```

### 2. 의존성 설치 (필요한 경우)

```powershell
npm install
```

### 3. 프론트엔드 개발 서버 실행

// turbo
```powershell
npm run dev
```

> 서버 주소: http://localhost:3000

---

## 동시 구동 (PowerShell 별도 터미널 2개 필요)

**터미널 1 - Backend:**
```powershell
cd c:\Develops\techs\Ainativepromptmanagermvp\backend
..\.venv\Scripts\Activate.ps1
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**터미널 2 - Frontend:**
```powershell
cd c:\Develops\techs\Ainativepromptmanagermvp\frontend
npm run dev
```

---

## 환경변수 파일 예시

### backend/.env
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
GEMINI_API_KEY=your_gemini_api_key
```

### frontend/.env.local
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 문제 해결

- **포트 충돌**: 이미 사용 중인 포트가 있다면 `--port` 옵션으로 다른 포트 사용
- **가상환경 오류**: `.venv` 폴더가 없으면 `python -m venv .venv`로 생성
- **의존성 오류**: `pip install -r requirements.txt` 또는 `npm install` 재실행
