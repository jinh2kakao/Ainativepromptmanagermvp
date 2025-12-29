# Backend 컨텍스트

## 📁 디렉토리 구조

```
backend/
├── main.py                 # FastAPI 앱 엔트리포인트
├── models.py               # SQLModel/Pydantic 모델 정의
├── database.py             # 데이터베이스 연결 설정
├── dependencies.py         # 의존성 주입 (인증 등)
├── routers/                # API 엔드포인트 (15개)
│   ├── admin.py            # 관리자 API
│   ├── admin_agents.py     # AI Agent 관리 API
│   ├── agents.py           # Agent 조회 API
│   ├── auth.py             # 인증 API (Supabase)
│   ├── categories.py       # 카테고리 API
│   ├── crucible.py         # 캔버스 저장 API
│   ├── faqs.py             # FAQ API
│   ├── inquiries.py        # 문의 API
│   ├── notices.py          # 공지사항 API
│   ├── projects.py         # 프로젝트/노드 API
│   ├── prompt_optimization.py  # AI 최적화 API
│   ├── prompts.py          # 프롬프트 CRUD API
│   ├── teams.py            # 팀 관리 API
│   ├── templates.py        # 템플릿 API
│   └── verification.py     # 이메일 인증 API
├── services/               # 비즈니스 로직
│   ├── email/              # 이메일 서비스
│   └── evaluation.py       # 프롬프트 평가 로직
├── optimizer_worker/       # 백그라운드 워커
│   └── main.py             # AI 최적화 워커 루프
├── core/                   # 핵심 설정
│   └── config.py           # AI 사용량 제한 설정
└── Dockerfile.prod         # 프로덕션 Docker 이미지
```

---

## 🔧 API 설계 원칙

- **RESTful 규칙** 준수
- **모든 엔드포인트** `/api/` 접두사 사용
- **응답 형식** JSON
- **인증** Supabase JWT 토큰 (`Authorization: Bearer <token>`)

---

## 📊 주요 데이터 모델

### 핵심 테이블
| 모델 | 용도 |
|------|------|
| `User` | 사용자 (email, user_type, role) |
| `Prompt` | 프롬프트 (title, content, mode, variables) |
| `Project` | 프로젝트 캔버스 (nodes, edges) |
| `ProjectNode` | 캔버스 노드 |
| `Team` / `TeamMember` | 팀 협업 |
| `PromptTemplate` | 프롬프트 템플릿 |
| `PromptEvaluation` | 프롬프트 평가 결과 |
| `OptimizationJob` | AI 최적화 작업 큐 |

### Enum 타입
```python
class UserType(str, Enum):
    GUEST = "GUEST"
    FREE = "FREE"
    PRO = "PRO"
    ENTERPRISE = "enterprise"

class PromptMode(str, Enum):
    SIMPLE = "simple"
    ASSISTANCE = "assistance"

class TeamRole(str, Enum):
    OWNER = "owner"
    ADMIN = "admin"
    EDITOR = "editor"
    VIEWER = "viewer"
```

---

## ⚠️ 에러 처리 패턴

```python
from fastapi import HTTPException

# 400 Bad Request
raise HTTPException(status_code=400, detail="Invalid input")

# 401 Unauthorized
raise HTTPException(status_code=401, detail="Not authenticated")

# 403 Forbidden
raise HTTPException(status_code=403, detail="Insufficient permissions")

# 404 Not Found
raise HTTPException(status_code=404, detail="Resource not found")
```

---

## 🔐 인증 의존성

```python
from dependencies import get_current_user, require_admin

# 일반 사용자 인증
@router.get("/api/prompts")
def list_prompts(user: User = Depends(get_current_user)):
    ...

# 관리자 권한 필요
@router.post("/api/admin/users")
def create_user(user: User = Depends(require_admin)):
    ...
```

---

## 🤖 AI 최적화 워커

- **위치**: `optimizer_worker/main.py`
- **실행**: `main.py` 시작 시 별도 데몬 스레드로 자동 실행
- **역할**: `OptimizationJob` 테이블 폴링 → Gemini API 호출 → 결과 저장

---

## 📝 코드 스타일

- **Formatter**: Black (line-length: 88)
- **Type Hints**: 모든 함수에 필수
- **Docstring**: public 함수에 필수
- **Import 순서**: stdlib → third-party → local