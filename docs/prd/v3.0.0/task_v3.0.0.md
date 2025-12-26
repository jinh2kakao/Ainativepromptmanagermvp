# Task: v3.0.0 팀 협업 및 비동기 잠금 구현

## Phase 1: 백엔드 기초 및 데이터베이스 [x]
- [x] **스키마 업데이트 (`backend/models.py`)**
    - [x] `Team` 모델 정의 (owner_id, name).
    - [x] `TeamMember` 모델 정의 (role: owner/admin/editor/viewer).
    - [x] `Project` 모델 업데이트 (`team_id`, `locked_by`, `locked_at` 추가).
- [x] **데이터베이스 마이그레이션**
    - [x] 새로운 테이블 생성을 위한 SQL 마이그레이션 스크립트 작성.
    - [x] 기존 사용자를 위한 마이그레이션 전략 수립 (개인 팀 자동 생성 또는 null team_id 처리).
- [x] **API - 팀 관리**
    - [x] `POST /teams`: 새 팀 생성 (엔터프라이즈 전용).
    - [x] `GET /teams`: 사용자의 팀 목록 조회.
    - [x] `POST /teams/{id}/members`: 멤버 초대/추가.
    - [x] `GET /teams/{id}/members`: 멤버 목록 조회.

## Phase 2: 백엔드 로직 및 보안 (RBAC) [COMPLETED]
- [x] **의존성 주입 (Dependency Injection)**
    - [x] 접근 권한 검증을 위한 `get_current_team_member` 생성 (Logic integrated directly in routers).
- [x] **프로젝트 잠금 로직 (Mutex)**
    - [x] `POST /projects/{id}/lock`: 편집 잠금 획득 (이미 잠겨있는지 확인).
    - [x] `POST /projects/{id}/unlock`: 잠금 해제.
    - [x] 자동 잠금 해제 로직 (타임아웃 또는 관리자 강제 해제 - Basic Manual Unlock implemented).
- [x] **퍼블리싱 워크플로우**
    - [x] `POST /projects/{id}/publish`: 개인 프로젝트를 팀 컨텍스트로 복사/이동.

## Phase 3: 프론트엔드 - 팀 공간 구현 [COMPLETED]
- [x] **대시보드 재구조화**
    - [x] **사이드바 (Sidebar) 업데이트**: 개인/팀 워크스페이스 전환 (TeamSwitcher implemented).
    - [x] **프로젝트 목록 (Dashboard)**: 현재 컨텍스트(개인/팀)에 따라 필터링 (Updated projects page).
- [x] **팀 관리 UI**
    - [x] **팀 생성 모달 (Create Team Modal)**: 구현 및 사이드바 연동 완료.
    - [x] **팀 설정 페이지**: 멤버 목록 조회 및 초대 (Integrated into SettingsPage).
    - [x] 멤버 목록 및 역할 변경 UI.
    - [x] 멤버 초대 모달 (이메일 기반).

## Phase 4: 프론트엔드 - 에디터 및 협업 [COMPLETED]
- [x] **프로젝트 퍼블리싱 (Publishing)**
    - [x] 에디터 상단에 "팀으로 게시(Publish to Team)" 버튼 추가 (개인 프로젝트인 경우).
    - [x] 게시 완료 시 팀 프로젝트로 이동 (또는 복제 알림).
- [x] **프로젝트 잠금 (Locking) UI**
    - [x] 팀 프로젝트 진입 시 `GET /projects/{id}`의 `locked_by` 확인.
    - [x] **Read-Only 모드**: 타인이 잠금 중이면 편집 비활성화 및 알림 표시.
    - [x] **편집 모드 진입**: "편집하기" 버튼 -> `POST /lock`.
    - [x] **편집 종료**: "저장/종료" -> `POST /unlock`.
    - [x] "팀으로 퍼블리싱" 모달 구현.

## Phase 5: 검증 및 다듬기 [COMPLETED]
- [x] **통합 테스트**
    - [x] 시나리오 검증 문서 작성: `docs/walkthrough_v3.0.0.md` (Korean).
- [x] **UI/UX 폴리싱**
    - [x] 에러 처리 강화 (토스트 메시지 적용 완료).
    - [x] 로딩 상태 개선 (Skeleton UI 적용 완료).
    - [x] 사용자의 파일을 해제할 수 없음 검증 (관리자 제외).
- [ ] **UI 다듬기**
    - [ ] 새 팀을 위한 빈 상태(Empty states).
    - [x] 지속성/잠금 이벤트를 위한 토스트 알림.
