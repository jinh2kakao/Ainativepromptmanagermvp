# Production Deployment Guide

이 가이드는 로컬 QA가 완료된 후, 프로덕션 환경(GitHub, EC2 등)에 배포하기 위해 필요한 환경변수와 사전 작업 항목을 설명합니다.

## 1. Environment Variables (환경변수)

### Backend (백엔드)
프로덕션 서버(EC2)의 `.env` 파일 또는 배포 파이프라인(GitHub Secrets)에 다음 변수들이 설정되어야 합니다.

| 변수명 | 설명 | 중요도 | 비고 |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | Supabase Transaction Pooler 연결 URL | **Critical** | `postgresql://...:6543/postgres` (Pooler 포트 권장) |
| `SUPABASE_URL` | Supabase 프로젝트 URL | **Critical** | `https://[project-id].supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key | **Critical** | **주의:** `anon` 키가 아닌 `service_role` 키여야 합니다. |
| `GEMINI_API_KEY` | Google Gemini AI API 키 | **Critical** | |

**참고:** 이전의 SMTP 관련 변수(`SMTP_SERVER` 등)는 `GmailService` 도입으로 더 이상 사용되지 않습니다.

### Frontend (프론트엔드)
Next.js 빌드 시점에 필요한 환경변수입니다. Vercel이나 Docker 빌드 Args, 또는 `.env.production`에 설정합니다.

| 변수명 | 설명 | 예시 |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL | `https://[project-id].supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon (Public) Key | `eyJ...` |
| `NEXT_PUBLIC_API_URL` | 백엔드 실서버 API 주소 | `https://api.yourdomain.com` (또는 EC2 IP) |

---

## 2. Required Files (필수 파일)

Gmail 연동을 위해 다음 파일들은 **환경변수로 대체할 수 없으며**, 보안상 Git에 포함되지 않습니다. 따라서 **서버에 직접 업로드**하거나 보안 스토리지에서 다운로드하도록 설정해야 합니다.

### Backend Directory (`/backend`)

1.  **`credentials.json`**
    *   **출처:** Google Cloud Console (OAuth 2.0 Client ID JSON 다운로드)
    *   **용도:** Gmail API 인증 초기 설정용
    *   **배포 방법:** EC2 서버의 `backend/` 디렉토리에 직접 SCP 등으로 복사.

2.  **`token.json`**
    *   **출처:** 로컬 개발 환경에서 최초 로그인 성공 시 생성된 파일
    *   **용도:** 실제 이메일 발송을 위한 인증 토큰 (User Credential)
    *   **주의:** 이 파일이 없으면 서버에서 브라우저 로그인을 시도하려다 실패합니다. **반드시 로컬에서 생성된 유효한 `token.json`을 서버로 복사해야 합니다.**
    *   **배포 방법:** 로컬의 `backend/token.json`을 EC2 서버의 `backend/` 디렉토리로 복사.

---

## 3. GitHub Actions / CI/CD (선택 사항: 자동 배포 설정 시)

GitHub Actions를 통해 자동 배포를 구성한다면, `Settings > Secrets and variables > Actions`에 다음 항목을 등록하세요.

*   `ENV_DATABASE_URL`
*   `ENV_SUPABASE_URL`
*   `ENV_SUPABASE_SERVICE_ROLE_KEY`
*   `ENV_GEMINI_API_KEY`

**파일 배포 팁:**
`credentials.json`과 `token.json`은 내용을 Base64로 인코딩하여 GitHub Secret(`GMAIL_CREDENTIALS_B64`, `GMAIL_TOKEN_B64`)으로 저장한 후, 워크플로우 실행 시 디코딩하여 파일로 생성하는 방식을 권장합니다.
