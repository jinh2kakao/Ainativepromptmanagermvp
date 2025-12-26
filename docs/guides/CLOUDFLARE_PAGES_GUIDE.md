# ⚡️ Cloudflare Pages 배포 가이드

**AWS 계정의 Free Tier 제약**으로 인해 Amplify에서 커스텀 도메인 연결이 불가능한 상황입니다.
다행히 **Cloudflare**를 이미 사용 중이시므로, 프론트엔드를 **Cloudflare Pages**로 배포하면 도메인 연결이 즉시 해결되며 비용도 무료입니다.

---

## 1단계: Cloudflare Pages 프로젝트 생성

1.  [Cloudflare Dashboard](https://dash.cloudflare.com/)에 로그인합니다.
2.  왼쪽 메뉴에서 **Workers & Pages** -> **Overview**를 클릭합니다.
3.  화면 우측 상단의 파란색 **[Create application]** 버튼을 클릭합니다.
4.  **중요**: 화면 중간에 "Ship something new"라는 창이 뜰 수 있습니다.
    *   이때 화면 **맨 아래쪽**에 있는 작은 글씨 **"Looking to deploy Pages? Get started"** 링크를 클릭해야 합니다.
    *   (또는 상단의 [Pages] 탭이 보이면 그것을 클릭하세요.)
5.  **[Connect to Git]** 버튼을 클릭합니다.

---

## 2단계: 빌드 설정 (중요)

설정 화면에서 다음 값을 정확히 입력해야 합니다.

1.  **Project name**: `promptlib` (또는 원하는 이름)
2.  **Production branch**: `main`
3.  **Framework preset**: **Next.js (Static HTML Export)** 선택.
    *   (선택 시 아래 값들이 자동으로 채워지지만, 확인하세요)
4.  **Build command**: `cd frontend && npm ci && npm run build`
    *   ⚠️ **주의**: Repository 루트에 `package.json`이 없고 `frontend/` 안에 있으므로, **`cd frontend && npm run build`**라고 입력해야 안전합니다. (또는 Root directory 설정 사용)
5.  **Build output directory**: `frontend/out`
    *   ⚠️ **주의**: `frontend/` 경로를 꼭 포함해야 합니다.
6.  **Root directory** (고급 설정): `frontend` 라고 입력하면 더 깔끔합니다.
    *   이 경우:
        *   **Build command**: `npm run build`
        *   **Build output directory**: `out`
    *   *(Root directory를 설정하는 것이 가장 권장됩니다)*

7.  **Environment variables (환경 변수)**:
    *   `NEXT_PUBLIC_API_URL`: `https://api.promptlib.co.kr` (SSL 적용됨)
    *   `NEXT_PUBLIC_SUPABASE_URL`: (기존 값, .env.local 참조)
    *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: (기존 값, .env.local 참조)

8.  **[Save and Deploy]** 클릭.

---

## 3단계: 도메인 연결 (Custom Domain)

배포가 완료되면(초록색 Success):

1.  Cloudflare 대시보드 왼쪽 메뉴에서 **Workers & Pages** -> **Overview**를 클릭합니다.
2.  방금 만든 프로젝트(`promptlib`)를 클릭해서 들어갑니다.
3.  상단 메뉴 탭 중에서 **[Custom domains]**를 클릭합니다.
4.  **[Set up a custom domain]** 버튼 클릭.
3.  **Domain**: `promptlib.co.kr` 입력.
4.  **[Continue]** 클릭.
5.  Cloudflare가 자동으로 DNS 레코드를 갱신합니다. **[Activate domain]** 클릭.

이제 `https://promptlib.co.kr`로 접속하면 사이트가 열립니다! 🚀
