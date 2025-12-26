# v3.0.0 기능 검증 시나리오 (Walkthrough)

이 문서는 v3.0.0 업데이트에서 추가된 **팀 공간(Team Space)** 및 **에디터 협업(Editor Collaboration)** 기능의 검증 절차를 설명합니다.

## 사전 준비 (Prerequisites)
1.  **백엔드 실행**: `poetry run uvicorn main:app --reload`
2.  **프론트엔드 실행**: `npm run dev`
3.  **다중 사용자 환경**: 서로 다른 두 개의 브라우저(또는 시크릿 모드)를 준비하여 User A와 User B로 로그인합니다.

---

## 검증 시나리오

### 1. 팀 관리 (Team Management) - Phase 3
**User A (팀 생성자):**
1.  **팀 생성**:
    - 사이드바 좌측 상단의 워크스페이스 드롭다운을 클릭합니다.
    - `+ Create Team` 버튼을 클릭합니다.
    - 팀 이름(예: "AI Design Team")을 입력하고 생성합니다.
    - **결과 확인**: 드롭다운 및 사이드바 상단에 "AI Design Team"이 표시되는지 확인합니다.
2.  **멤버 초대**:
    - 사이드바 하단의 `설정(Settings)` 메뉴로 이동합니다.
    - `팀 관리(Team Management)` 탭을 선택합니다 (User 아이콘이 아닌 Users 아이콘).
    - `멤버 초대(Invite Member)` 버튼을 클릭합니다.
    - User B의 이메일 주소를 입력하고, 역할을 **Editor**로 설정하여 초대장을 보냅니다.
    - **결과 확인**: 멤버 목록에 User B가 추가되었는지 확인합니다.

### 2. 프로젝트 퍼블리싱 (Project Publishing) - Phase 4
**User A (개인 워크스페이스):**
1.  **개인 프로젝트 생성**:
    - 워크스페이스를 "Personal Workspace"로 전환합니다.
    - `Projects` 메뉴에서 `New Project`를 클릭하여 "개인 프롬프트 초안"을 생성합니다.
2.  **팀으로 게시 (Publish)**:
    - 에디터 우측 상단의 `Publish to Team` (공유 아이콘) 버튼을 클릭합니다.
    - "AI Design Team"을 선택하고 `Publish`를 클릭합니다.
    - **결과 확인**: 성공 메시지와 함께 팀 워크스페이스의 복제된 프로젝트로 자동 이동하는지 확인합니다.

### 3. 협업 및 잠금 (Collaboration & Locking) - Phase 4
**User A ("AI Design Team" 워크스페이스):**
1.  **편집 모드 진입**:
    - 팀 프로젝트 에디터에서 `Edit Mode` (잠금 아이콘) 버튼을 클릭합니다.
    - **결과 확인**: 상단 배너에 "Editing (Locked by you)"가 표시되고, 노드 추가 및 저장이 가능한지 확인합니다.

**User B ("AI Design Team" 워크스페이스):**
1.  팀 워크스페이스로 이동하여 동일한 프로젝트를 엽니다.
2.  **잠금 상태 확인**:
    - **결과 확인**: 상단에 "Locked by team member" 배너가 붉은색으로 표시되는지 확인합니다.
    - **결과 확인**: `Edit Mode`, `Add Node`, `Save` 버튼이 비활성화(또는 숨김) 처리되어 편집이 불가능한지 확인합니다.

**User A:**
1.  **편집 종료 (Unlock)**:
    - `Finish Editing` 버튼을 클릭하여 저장을 완료하고 잠금을 해제합니다.
    - **결과 확인**: 배너가 사라지고 읽기 전용 상태로 돌아가는지 확인합니다.

**User B:**
1.  **편집 권한 획득**:
    - 이제 활성화된 `Edit Mode` 버튼을 클릭합니다.
    - **결과 확인**: User B가 새로운 편집자(Locker)가 되었음을 확인합니다.

---

## 문제 해결 (Troubleshooting)
- **403 Forbidden**: 팀 멤버가 아니거나 권한이 부족한 경우 발생합니다. 설정 페이지에서 권한을 확인하세요.
- **409 Conflict**: 이미 다른 사용자가 편집 중(Lock)인 프로젝트에 접근하거나 락을 시도할 때 발생합니다. 잠금 배너를 확인하세요.

## 배포 및 문제 해결 로그 (Deployment Logic & Troubleshooting)

### 1. Cloudflare Static Export 호환성 문제
- **문제**: `next.config.ts`에서 `output: 'export'` 설정을 사용하면, 동적 라우팅(`[id]`) 페이지는 빌드 시점에 경로를 미리 알 수 없어 생성이 불가능함. 반면, 이 설정을 끄면 Cloudflare가 요구하는 `out` 디렉토리가 생성되지 않음.
- **해결**: 팀 설정 페이지(`src/app/teams/[id]/settings/page.tsx`)를 **Query Parameter** 방식(`src/app/teams/settings/page.tsx` + `?id=...`)으로 리팩토링하여 정적 내보내기 호환성을 확보함.

### 2. TypeScript 빌드 에러 수정
- **증상**: Cloudflare 빌드 중 `Property 'team_id' does not exist on type 'Project'` 및 `Module ... declares 'TeamCreate' locally, but it is not exported` 에러 발생.
- **해결**:
    - `src/types/project.ts`: `Project` 인터페이스에 `team_id`, `locked_by`, `locked_at` 필드 추가.
    - `src/features/teams/api.ts`: 내부에서 사용하던 타입(`TeamCreate` 등)을 `export type`으로 명시적 내보내기 처리.

### 3. Docker 백엔드 재배포
- **절차**:
    1. 로컬에서 Docker Daemon 실행.
    2. `./update_backend.sh` 실행하여 이미지 빌드 및 ECR 푸시.
    3. EC2 인스턴스에서 `./force_deploy_ec2.sh` 실행하여 최신 이미지 Pull 및 컨테이너 재시작.
