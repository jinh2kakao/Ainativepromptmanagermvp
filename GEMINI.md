# AinativePromptManager 프로젝트 컨텍스트
## 🏛️ 프로젝트 헌법
### 권한 계층
1. **최상위**: 이 GEMINI.md 파일의 규칙
2. **PRD 문서**: docs/prd/ 디렉토리
3. **기술 가이드**: docs/guides/ 디렉토리
### 수정 금지 파일 (Do Not Touch)
> CAUTION
> 아래 파일들은 보안 및 운영 안정성을 위해 수정 금지입니다.
| 파일 | 사유 |
|------|------|
| backend/core/config.py | AI 사용 제한 설정 |
| backend/credentials.json | Gmail API OAuth 자격 증명 |
| backend/token.json | Gmail API 토큰 |
| .github/workflows/deploy-ec2.yml | 프로덕션 배포 파이프라인 |
| deploy_prod.sh | EC2 배포 스크립트 |
| ainative-key.pem | AWS EC2 SSH 키 |
| cloudflare_origin.crt | SSL 인증서 |
| cloudflare_origin.key | SSL 개인키 |
---
## 🛠️ 기술 스택
| 영역 | 기술 | 버전 | 
|------|------|------|
| Backend | Python, FastAPI | 3.11+ |
| Frontend | React, TypeScript | 18+ |
| Styling | TailwindCSS | 4.x |
| UI Components | Radix UI, shadcn/ui | - |
| State Management | Zustand | 5.0.9 |
| Flow Editor | @xyflow/react | 12.9.3 |
| Database | Supabase (PostgreSQL) | - |
| AI | Google Gemini | - |
| Infra | Docker, AWS EC2, Cloudflare Pages | - |
---

## 📁 디렉토리 구조
```
AinativePromptManagerMVP/
├── backend/                    # FastAPI 백엔드
│   ├── routers/                # API 엔드포인트 (15개)
│   │   ├── admin.py            # 관리자 API
│   │   ├── auth.py             # 인증 API
│   │   ├── projects.py         # 프로젝트 API
│   │   ├── prompts.py          # 프롬프트 API
│   │   ├── teams.py            # 팀 API
│   │   └── ...
│   ├── services/               # 비즈니스 로직
│   ├── optimizer_worker/       # AI 최적화 워커
│   ├── core/                   # 핵심 설정
│   ├── models.py               # Pydantic 모델
│   └── main.py                 # FastAPI 앱
├── frontend/                   # Next.js 프론트엔드
│   └── src/                    # 소스 코드
├── docs/                       # 문서
│   ├── prd/                    # PRD 문서 (13개)
│   ├── guides/                 # 가이드 (11개)
│   ├── walkthroughs/           # 작업 기록
│   └── plans/                  # 구현 계획
├── scripts/                    # 유틸리티 스크립트
├── .github/workflows/          # GitHub Actions
│   ├── deploy-ec2.yml          # 백엔드 자동 배포
│   └── deploy.yml              # 기타 배포
└── .agent/workflows/           # AI 워크플로우
    └── ui-ux-qa.md             # UI/UX QA 자동화
```
---
## 📐 코드 규칙
### Python (Backend)
- Formatter: Black (line-length: 88)
- Type Hints: 모든 함수에 필수
- Docstring: 모든 public 함수에 필수
- API 접두사: `/api/v1/`
- 에러 처리:
```python
from fastapi import HTTPException
raise HTTPException(status_code=400, detail="Error message")
```
### TypeScript (Frontend)
- Formatter: Prettier + ESLint
- Type 선언: interface 우선, type은 union/intersection에만
- 컴포넌트: 함수형 컴포넌트 + Hooks
- 상태 관리: Zustand 사용
- 라우팅: Next.js App Router 사용
- API 호출: React Query 사용
- 스타일링: TailwindCSS (inline class 사용)
---
## 🚀 배포 프로세스
### Backend (자동 배포)
1. main 브랜치에 Push
2. GitHub Actions (.github/workflows/deploy-ec2.yml) 자동 실행
3. Docker 이미지 빌드 → GHCR Push → EC2 배포

### Frontend (수동 배포)
1. main 브랜치에 Push
2. Cloudflare Pages 자동 빌드 및 배포
3. 도메인: promptlib.co.kr

### 수동 배포 (Fallback)
```
# EC2 SSH 접속 후
./deploy_prod.sh [GH_TOKEN]
```
### 배포 전 체크리스트
테스트 통과 확인
타입 체크 오류 없음 (npm run type-check)
CHANGELOG.md 업데이트
GitHub Secrets 확인 (GEMINI_API_KEY, EC2_HOST, EC2_SSH_KEY)

---
## 🔒 보안
> [!CAUTION]
> API 키나 시크릿을 코드에 하드코딩하지 마세요!
### 환경 변수 관리
| 환경 | 파일 | 참고 |
| -- | -- | -- |
| 로컬 개발 | `backend/.env`, `frontend/.env.local` | `.gitignore`에 포함 |
| 프로덕션 | GitHub Secrets → Docker 주입 | `.github/workflows/deploy-ec2.yml` |
### 필수 환경 변수
- `SUPABASE_URL`, `SUPABASE_KEY` - 데이터베이스
- `GEMINI_API_KEY` - AI 기능
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` - 프론트엔드
### 보안 파일 (절대 커밋 금지)
- `*.pem` - SSH 키
- `*.key` - 개인키
- `credentials.json`, `token.json` - OAuth 자격 증명
- `.env*` - 환경 변수
---
## 🤖 AI 규칙
### Context7 자동 호출
코드 생성, 라이브러리 설정, API 문서가 필요할 때 항상 Context7을 사용하세요.
```
use context7
```
### 라이브러리 직접 지정
```
use library /supabase/supabase for API docs
use library /vercel/next.js for routing docs
```
### 워크플로우 사용
- UI/UX QA: /ui-ux-qa - 브라우저 기반 UI 검증
---
## 📚 참조 문서
| 문서 | 경로 | 용도 |
| -- | -- | -- |
| 배포 가이드 | DEPLOY.md | 배포 절차 |
| EC2 가이드	 | docs/guides/ec2_deployment_guide.md | EC2 상세 설정 |
| 보안 가이드	 | SECURITY_REMEDIATION_GUIDE.md | 보안 대응 |
| 트러블슈팅	 | TROUBLESHOOTING.md | 문제 해결 |
| PRD 모음	 | docs/prd/ | 기능 요구사항 |
---
## 📋 버전 히스토리
현재 버전의 주요 기능:
- v3.3.x: Community Features, Template System, Email Verification
- v3.2.0: Applicable AI Agents
- v2.1.0: Project Crucible (Canvas Editor)
- v1.4.0: Projects & Templates
자세한 변경 이력은 CHANGELOG.md 참조.