# AinativePromptManager 프로젝트 컨텍스트
## 🏛️ 프로젝트 헌법
### 권한 계층
1. **최상위**: 이 GEMINI.md 파일의 규칙
2. **PRD 문서**: docs/prd/ 디렉토리
3. **기술 가이드**: docs/guides/ 디렉토리
### 수정 금지 파일
- `backend/core/security.py`
- `docker-compose.prod.yml`
- `.env.production`
---
## 🛠️ 기술 스택
| 영역 | 기술 |
|------|------|
| Backend | Python 3.11+, FastAPI |
| Frontend | React 18, TypeScript |
| Database | Supabase (PostgreSQL) |
| AI | Google Gemini |
| Infra | Docker, AWS EC2 |
---
## 📐 코드 규칙
### Python
- Black formatter (88자)
- Type hints 필수
- Docstring 필수
### TypeScript
- Prettier 사용
- interface 우선
- 함수형 컴포넌트
---
//## 🚀 배포
//배포 시 `/deploy` 워크플로우를 사용하세요.
//자세한 내용: [DEPLOY.md](file:///docs/guides/DEPLOY.md)
---
## 🔒 보안
> [!CAUTION]
> API 키를 코드에 하드코딩하지 마세요!
- 시크릿은 환경 변수 사용
- `.env` 파일은 `.gitignore` 포함
---
## 🤖 Context7 자동 호출
코드 생성, 라이브러리 설정, API 문서가 필요할 때 항상 context7을 사용하세요.
Context7 MCP 도구로 library id를 resolve하고 최신 docs를 가져오세요.