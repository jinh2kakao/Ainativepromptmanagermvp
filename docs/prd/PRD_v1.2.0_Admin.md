# [PRD] AI Native Prompt Manager MVP (Admin Features)

> **Version**: 1.2.0
> **Date**: 2024-12-02
> **Status**: Draft
> **Changes**: Added Admin Console requirements (User, Prompt, Category, Template Management).

## 1. Overview
서비스 운영 효율화와 콘텐츠 품질 관리를 위해 **관리자(Admin) 콘솔**을 도입합니다. 관리자는 사용자, 프롬프트, 직무 카테고리, 그리고 템플릿을 통합 관리할 수 있어야 합니다.

## 2. Admin Scope & Access Control
- **Access URL**: `/admin` (일반 사용자는 접근 불가)
- **Authentication**: `users` 테이블의 `role` 컬럼이 `admin`인 사용자만 접근 가능.
- **Security**: 모든 Admin API 요청 시 권한 검증 필수.

## 3. Requirements Detail

### A-1: 사용자 관리 (User Management)
**Goal**: 악성 유저 관리 및 고객 지원(CS) 대응을 위한 기능 제공.

**Features**
1. **User List**:
   - 테이블 뷰: 이름, 이메일, 가입일, 최근 접속일, 등급(Guest/Free/Pro), 상태(Active/Banned).
   - 검색/필터: 이메일 검색, 등급별 필터.
2. **User Detail & Actions**:
   - **로그인 이력**: 최근 접속 로그 확인 (IP, 시간).
   - **등급 관리**: Free <-> Pro 수동 변경 (CS 보상 등).
   - **탈퇴 처리**: 강제 탈퇴 (Soft Delete).
   - **비밀번호 초기화**: '임시 비밀번호 발송' 버튼 클릭 시, 해당 유저 이메일로 임시 비밀번호 전송 및 DB 업데이트.

### A-2: 유저 등록 프롬프트 관리 (User Prompt Management)
**Goal**: 공개된 프롬프트의 품질 관리 및 악성 콘텐츠 대응.

**Features**
1. **Prompt List**:
   - 테이블 뷰: 제목, 작성자, 카테고리, 생성일, 공개 여부, 신고 수.
   - 필터: 악성 의심(키워드 필터링), 신고 접수된 프롬프트.
2. **Prompt Detail & Actions**:
   - **콘텐츠 확인**: 프롬프트 전체 내용 열람.
   - **직무 분류 변경**: 사용자가 잘못 지정한 카테고리 수정.
   - **공개 여부 변경**: Public <-> Private 강제 전환.
   - **삭제**: 악성 프롬프트 영구 삭제 (작성자에게 알림 발송 옵션).

### A-3: 직무 분류 카테고리 관리 (Category Management)
**Goal**: 서비스 확장에 따른 유연한 카테고리 구조 변경.

**Features**
1. **Category Tree View**:
   - 2Depth 구조 시각화 (대분류 > 소분류).
   - Drag & Drop 또는 순서 변경 버튼으로 **노출 순서(Order)** 조정.
2. **CRUD**:
   - **대분류**: 추가/수정/삭제 (하위 소분류가 있는 경우 삭제 불가 경고).
   - **소분류**: 추가/수정/삭제.
   - **속성**: 한글명(Label), 영문코드(Value), 아이콘(Emoji/Icon).

### A-4: 예시 프롬프트 관리 (Template Management)
**Goal**: 각 직무별 최적화된 예시(Sample)를 제공하여 사용자의 초기 진입 장벽을 낮춤.

**Features**
1. **Multi-Template Support**:
   - 각 직무 분류(소분류 기준)마다 **N개의 예시 프롬프트** 등록 가능.
   - 추후 사용자가 "이 직무의 다른 예시 보기"를 선택할 수 있도록 대비.
2. **Mode Specific Templates**:
   - **일반 모드용**: 단순 텍스트 템플릿.
   - **어드밴스드(Assistance) 모드용**: P.A.I.R 구조가 적용된 JSON 형태의 데이터.
3. **Default Setting**:
   - 여러 예시 중 '기본(Default)'으로 노출할 프롬프트 선택 기능.

### A-5: 입력 항목 동적 관리 (Dynamic Input Configuration)
**Goal**: 직무별로 상이한 프롬프트 작성 가이드를 어드민에서 코딩 없이 수정.

**Features**
1. **Configuration Editor**:
   - 각 소분류별 `config` JSON 객체 편집.
   - **Profile/Intent/Context/Task** 등 각 섹션의:
     - Label (표시명)
     - Placeholder (입력 예시)
     - Guide Tooltip (도움말)
   - 수정 후 '저장' 시 즉시 프론트엔드 반영 (API를 통해 Config 로드).

## 4. Database Schema Changes (Proposed)
- **users**: `role` (enum: user, admin) 추가.
- **categories**: `id`, `parent_id`, `name`, `value`, `order`, `config_json` (Dynamic Input 설정).
- **prompt_templates**: `id`, `category_id`, `mode` (simple/advanced), `content` (JSON/Text), `is_default`.
- **audit_logs**: `admin_id`, `action`, `target_id`, `timestamp` (관리자 활동 로그).

## 5. UI/UX Requirements for Admin
- **Layout**: 사이드바 네비게이션 (Dashboard, Users, Prompts, Categories, Settings).
- **Design System**: 기존 앱과 톤앤매너를 맞추되, 데이터 밀도가 높은 **테이블 중심**의 UI.
- **Feedback**: 중요 작업(삭제, 초기화) 시 **이중 확인 모달(Confirmation Modal)** 필수.
