# 🚀 Deployment Guide (배포 가이드)

이 문서는 **Frontend(Vercel)**와 **Backend(Render)**를 사용하여 무료로 서비스를 배포하는 절차를 설명합니다.

---

## ✅ 0. 사전 준비 (Prerequisites)

1.  **GitHub Push**: 현재 작성한 모든 코드가 GitHub 저장소에 업로드되어 있어야 합니다.
2.  **계정 준비**:
    * [Vercel](https://vercel.com/) (프론트엔드 배포용)
    * [Render](https://render.com/) (백엔드 배포용)
    * [Supabase](https://supabase.com/) (DB 정보 확인용)

---

## 🛠️ 1. Backend 배포 (Render.com)

프론트엔드가 API를 호출하려면 백엔드 주소가 먼저 필요하므로, 백엔드부터 배포합니다.

1.  **서비스 생성**:
    * Render Dashboard 접속 -> `New +` 클릭 -> `Web Service` 선택.
    * `Build and deploy from a Git repository` -> `Next`.
    * 내 GitHub 저장소(`Ainativepromptmanagermvp`)를 찾아 `Connect` 클릭.

2.  **기본 설정 (중요)**:
    * **Name**: `ainative-backend` (원하는 이름)
    * **Region**: `Singapore` (한국에서 가장 빠름) 또는 `Oregon`.
    * **Branch**: `main`
    * **Root Directory**: `backend` (🚨 **필수**: Dockerfile이 있는 폴더 지정)
    * **Runtime**: `Docker` (🚨 **필수**: Python이 아닌 Docker 선택)
    * **Instance Type**: `Free`.

3.  **환경 변수 설정 (Environment Variables)**:
    * `Add Environment Variable` 버튼을 눌러 아래 값들을 추가합니다. (`backend/.env` 내용 참조)
    * **`DATABASE_URL`**: Supabase의 **Connection Pooling (Session Mode, Port 6543)** 주소.
        * (예: `postgresql://postgres:[PW]@aws-0-ap-...pooler.supabase.com:6543/postgres`)
    * **`SUPABASE_SERVICE_KEY`**: `eyJ...` 로 시작하는 `service_role` 키.
    * **`ALLOWED_ORIGINS`**: `*` (별표 하나만 입력. 초기 설정용)

4.  **배포 시작**:
    * `Create Web Service` 클릭.
    * 빌드가 완료되면 상단에 `https://ainative-backend.onrender.com` 같은 주소가 생깁니다. **이 주소를 복사해두세요.**

---

## 🎨 2. Frontend 배포 (Vercel)

1.  **프로젝트 생성**:
    * Vercel Dashboard 접속 -> `Add New...` -> `Project`.
    * 내 GitHub 저장소 옆의 `Import` 버튼 클릭.

2.  **기본 설정**:
    * **Framework Preset**: `Next.js` (자동 감지됨).
    * **Root Directory**: `Edit` 클릭 -> `frontend` 폴더 선택 (🚨 **필수**).

3.  **환경 변수 설정 (Environment Variables)**:
    * `frontend/.env.local` 파일 내용을 참조하여 입력합니다.
    * **`NEXT_PUBLIC_SUPABASE_URL`**: Supabase Project URL (`https://...supabase.co`).
    * **`NEXT_PUBLIC_SUPABASE_ANON_KEY`**: `eyJ...` 로 시작하는 `anon` 키.
    * **`NEXT_PUBLIC_API_URL`**: **위 1번 단계에서 복사한 Render 백엔드 주소**.
        * (예: `https://ainative-backend.onrender.com`)
        * ⚠️ **주의**: 주소 맨 뒤에 슬래시(`/`)를 붙이지 마세요!

4.  **배포 시작**:
    * `Deploy` 클릭.
    * 잠시 후 배포가 완료되고 축하 화면이 나옵니다. `Visit`을 눌러 접속해 봅니다.

---

## 🔒 3. 보안 설정 마무리 (CORS Update)

배포가 완료되면 백엔드의 문단속을 다시 해야 합니다.

1.  **Vercel 도메인 확인**: 방금 배포된 프론트엔드 주소를 복사합니다. (예: `https://my-app.vercel.app`)
2.  **Render 환경 변수 수정**:
    * Render Dashboard -> Backend Service 선택 -> 왼쪽 메뉴 `Environment`.
    * `ALLOWED_ORIGINS` 값을 `*`에서 `https://my-app.vercel.app`으로 변경합니다.
    * `Save Changes` 클릭. (서버가 자동으로 재시작됩니다.)

---

## 🎉 완료 (Troubleshooting)

* **배포 후 404 에러**: `Root Directory` 설정이 `backend`나 `frontend`로 잘 되어 있는지 확인하세요.
* **DB 연결 에러**: `DATABASE_URL`이 6543 포트(Pooler)인지 확인하고, 비밀번호에 특수문자가 있다면 URL 인코딩이 되었는지 확인하세요.
* **CORS 에러**: Render의 `ALLOWED_ORIGINS`에 `https://`가 포함된 Vercel 주소가 정확한지 확인하세요. (뒤에 슬래시 `/` 없음)