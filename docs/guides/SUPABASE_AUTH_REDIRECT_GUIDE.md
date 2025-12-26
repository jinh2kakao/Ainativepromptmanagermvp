# 🔐 Supabase Google 로그인(OAuth) 리다이렉트 설정

**문제 상황**: 도메인이 `https://promptlib.co.kr`로 변경되었으나, Supabase의 인증 설정에는 이전 주소(localhost 또는 amplify 주소)만 등록되어 있어서 Google 로그인이 실패할 수 있습니다.

**해결 방법**: Supabase Dashboard에서 새로운 도메인을 **Redirect URL**에 추가해야 합니다.

---

## 🚀 설정 방법 (1분 소요)

1.  **Supabase 대시보드 접속**:
    *   [Supabase Dashboard](https://supabase.com/dashboard) 로그인.
    *   `Ainativepromptmanagermvp` 프로젝트 선택.

2.  **Authentication 설정 이동**:
    *   왼쪽 메뉴에서 **Authentication** 아이콘(자물쇠 모양) 클릭.
    *   **Configuration** 하위 메뉴의 **URL Configuration** 클릭.

3.  **Site URL 변경**:
    *   **Site URL**: `https://promptlib.co.kr` 입력.

4.  **Redirect URLs 추가 (중요!)**:
    *   **Redirect URLs** 섹션에서 **Add URL** 클릭.
    *   다음 URL들을 모두 추가합니다:
        *   `https://promptlib.co.kr`
        *   `https://promptlib.co.kr/auth/callback`
        *   `https://www.promptlib.co.kr`
        *   `https://www.promptlib.co.kr/auth/callback`
        *   `http://localhost:3000` (개발용, 없으면 추가)
        *   `http://localhost:3000/auth/callback` (개발용, 없으면 추가)

5.  **[Save]** 버튼을 눌러 저장합니다.

---

## ✅ 확인 방법
1.  Supabase 설정 저장 후 1분 정도 기다립니다.
2.  `https://promptlib.co.kr`에서 Google 로그인을 시도합니다.
3.  로그인 창이 뜨고 정상적으로 로그인이 완료되면 성공입니다!
