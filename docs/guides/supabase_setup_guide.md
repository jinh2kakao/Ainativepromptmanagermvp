# Supabase 구글 로그인 및 수동 연동(Manual Linking) 설정 가이드

애플리케이션에서 구글 로그인과 "Google 계정 연동(Connect Google Account)" 기능을 완전히 활성화하려면 Supabase 대시보드에서 몇 가지 설정이 필요합니다.

## 1. Manual Linking 활성화 ("Manual Linking is disabled" 에러 해결)

이 설정은 로그인된 사용자가 새로운 OAuth ID(예: Google)를 기존 계정에 연결할 수 있도록 허용합니다.

1.  **Supabase Dashboard**로 이동합니다.
2.  **Authentication** > **Providers** 메뉴로 이동합니다.
3.  **Google**을 클릭하여 설정을 펼칩니다.
4.  **"Enable Manual Linking"** (또는 고급 설정의 "Allow manual linking")이라는 토글이나 체크박스를 찾아 활성화합니다.
    *   *참고: Provider 설정에 이 옵션이 없다면 **Authentication** > **Settings** > **Security**를 확인해 보세요.*
    *   *업데이트: 일부 Supabase 버전에서는 기본적으로 활성화되어 있지만, 에러가 발생한다면 명시적으로 비활성화되어 있거나 **"Secure URL"** 설정이 필요할 수 있습니다.*
5.  **Save**를 클릭하여 저장합니다.

## 2. Google OAuth 자격 증명(Credentials) 설정

아직 Google Cloud Console 프로젝트를 설정하지 않았다면 다음 단계를 따르세요:

1.  [Google Cloud Console](https://console.cloud.google.com/)로 이동합니다.
2.  프로젝트를 선택합니다 (또는 새로 만듭니다).
3.  **APIs & Services** > **Credentials**로 이동합니다.
4.  **Create Credentials** > **OAuth client ID**를 클릭합니다.
5.  **Web application**을 선택합니다.
6.  **Authorized JavaScript origins**: 앱의 URL을 추가합니다 (예: 로컬 개발용 `http://localhost:3000`, 그리고 배포된 프로덕션 URL).
7.  **Authorized redirect URIs**: Supabase의 Callback URL을 추가합니다.
    *   이 URL은 Supabase의 **Authentication** > **Providers** > **Google** > **Callback URL (for OAuth)**에서 확인할 수 있습니다.
    *   보통 다음과 같은 형식입니다: `https://<your-project-ref>.supabase.co/auth/v1/callback`.
8.  **Client ID**와 **Client Secret**을 복사합니다.
9.  다시 **Supabase Dashboard** > **Authentication** > **Providers** > **Google**로 돌아갑니다.
10. 복사한 **Client ID**와 **Client Secret**을 붙여넣습니다.
11. **Enable Sign in with Google** 토글이 **ON** 상태인지 확인합니다.
12. **Save**를 클릭합니다.

## 3. URL Configuration (리다이렉트 설정)

로그인 후 사용자가 앱으로 올바르게 리다이렉트되도록 하려면 다음 설정이 필요합니다:

1.  **Authentication** > **URL Configuration**으로 이동합니다.
2.  **Site URL**: 배포된 프로덕션 URL로 설정합니다 (예: `https://your-app.com`).
3.  **Redirect URLs**: 로컬 개발 URL 및 기타 환경의 URL을 추가합니다.
    *   **와일드카드 사용 권장**: 도메인 뒤에 `/**`를 붙이면 해당 도메인의 모든 하위 경로가 허용됩니다.
    *   예시:
        *   `http://localhost:3000/**` (로컬 개발 환경의 모든 경로 허용)
        *   `https://your-app.com/**` (배포 환경의 모든 경로 허용)
    *   *참고: 특정 경로만 허용하고 싶다면 `https://your-app.com/auth/callback`과 같이 전체 경로를 입력해야 합니다.*
4.  **Save**를 클릭합니다.

## 4. 확인 (Verification)

설정을 마친 후:
1.  필요하다면 프론트엔드 애플리케이션을 재시작합니다.
2.  Settings > Profile 페이지에서 **"연동하기(Connect Google Account)"** 버튼을 다시 시도해 봅니다.
3.  이제 구글 로그인 화면으로 이동하며 계정이 성공적으로 연동되어야 합니다.
