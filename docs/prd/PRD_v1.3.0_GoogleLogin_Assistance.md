# PRD v1.3.0: Google Login & Assistance Mode Enhancements
# PRD v1.3.0: 구글 로그인 및 어시스턴스 모드 고도화

## 1. Overview (개요)
This version focuses on enhancing user authentication with Google Login, improving the Assistance Mode with multi-template support, and redesigning the navigation layout with a sidebar.
이번 버전은 구글 로그인을 통한 사용자 인증 강화, 다중 템플릿 지원을 통한 어시스턴스 모드 개선, 그리고 사이드바 도입을 통한 내비게이션 레이아웃 개편에 중점을 둡니다.

## 2. Key Features (주요 기능)

### 2.1 Google Login Integration (구글 로그인 연동)
- **Login Page**: Add "Continue with Google" button.
  - **로그인 페이지**: "Google로 계속하기" 버튼 추가.
- **My Page**: Manage Google account connection.
  - **마이페이지**: 구글 계정 연동 관리 기능.
  - **Link Account**: Connect Google account if not linked.
    - **계정 연동**: 미연동 시 구글 계정 연동.
  - **Change Account**: Re-link to a different Google account (updates email).
    - **계정 변경**: 다른 구글 계정으로 재연동 (이메일 변경됨).
  - **Disconnect Account**: Unlink Google account (requires password verification/setting).
    - **연동 해제**: 구글 계정 연동 해제 (비밀번호 확인/설정 필요).

### 2.2 Assistance Mode Enhancements (어시스턴스 모드 고도화)
- **Multi-Template Support**: Support multiple templates per job category.
  - **다중 템플릿 지원**: 직무 카테고리당 여러 템플릿 지원.
- **Template Selection UI**: Dropdown to select a template when multiple are available.
  - **템플릿 선택 UI**: 여러 템플릿 존재 시 선택 가능한 드롭다운 제공.
- **Default Behavior**: Automatically select the first template.
  - **기본 동작**: 첫 번째 템플릿 자동 선택.

### 2.3 Sidebar Redesign (사이드바 개편)
- **Layout Change**: Replace top Header with Left Sidebar.
  - **레이아웃 변경**: 상단 헤더를 좌측 사이드바로 대체.
- **Collapsible**: Sidebar can be expanded or collapsed.
  - **접기/펼치기**: 사이드바 확장 및 축소 기능.
- **Components**:
  - Logo (Dashboard Link) / 로고 (대시보드 이동)
  - View Mode Toggle (List/Kanban) / 뷰 모드 토글 (리스트/칸반)
  - Prompt Count / 프롬프트 개수
  - Admin Button (Admin only) / 관리자 버튼 (관리자 전용)
  - User Profile & Settings / 사용자 프로필 및 설정

## 3. User Flow (사용자 흐름)

### 3.1 Google Login
1. User clicks "Continue with Google" on Login/Signup page.
   (사용자가 로그인/회원가입 페이지에서 "Google로 계속하기" 클릭)
2. Redirect to Google OAuth.
   (Google OAuth로 리다이렉트)
3. Redirect back to app authenticated.
   (인증 후 앱으로 복귀)

### 3.2 Template Selection
1. User opens "New Prompt" modal.
   (사용자가 "새 프롬프트" 모달 열기)
2. Selects a Category (e.g., Marketing).
   (카테고리 선택 (예: 마케팅))
3. Switches to "Assistance Mode".
   ("어시스턴스 모드"로 전환)
4. If multiple templates exist, selects one from dropdown.
   (다중 템플릿 존재 시 드롭다운에서 선택)
5. Form fields update based on selected template.
   (선택된 템플릿에 따라 폼 필드 업데이트)

## 4. Technical Requirements (기술 요구사항)
- **Frontend**: Next.js, Tailwind CSS, Supabase Auth Helpers
- **Backend**: FastAPI, SQLModel
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (Google Provider)
