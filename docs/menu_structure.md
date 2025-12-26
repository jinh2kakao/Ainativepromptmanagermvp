# 메뉴 구조도 (Menu Structure)

## 1. 개요
본 문서는 **Ainative Prompt Manager MVP**의 프론트엔드 메뉴 구조를 정의합니다.
사용자의 작업 공간(Personal vs Team)과 권한(Admin/User)에 따라 동적으로 구성됩니다.

## 2. 글로벌 네비게이션 바 (Sidebar)
모든 페이지 좌측에 고정된 사이드바 형태의 메인 네비게이션입니다.

| 메뉴 레벨 1 | 메뉴 레벨 2 | 설명 | 권한/조건 | 링크 |
|:--- |:--- |:--- |:--- |:--- |
| **로고 (Logo)** | - | 메인 홈으로 이동 | 전체 | `/` |
| **팀 스위처 (Team Switcher)** | - | 개인/팀 워크스페이스 전환 | 로그인 사용자 | - |
| **My Prompts** | List View | 개인 프롬프트 목록 (리스트 뷰) | Personal Workspace | `/?view=list` |
| | Kanban Board | 개인 프롬프트 목록 (칸반 뷰) | Personal Workspace | `/?view=kanban` |
| | Projects | 개인 프로젝트 관리 | Personal Workspace | `/projects` |
| **Team Workspace** | Projects | 팀 프로젝트 공유 및 관리 | Team Workspace | `/projects` |
| | Team Management | 팀 설정 및 멤버 관리 | Team Workspace | `/teams/settings?id={ID}` |
| **Admin** | Admin Console | 관리자 대시보드 | Admin Only | `/admin` |
| **User Profile** | Settings | 사용자 계정 설정 | 로그인 사용자 | - |
| | Upgrade Plan | 요금제 업그레이드 | Free Plan | - |
| | Sign Out | 로그아웃 | 로그인 사용자 | - |

## 3. 페이지 별 상세 구조 및 UI 요소

### 3.1 메인 페이지 (Home / My Prompts)
프롬프트 목록을 조회하고 관리하는 메인 대시보드입니다.

#### 3.1.1 Top Toolbar
- **Search Input**: 프롬프트 제목 및 내용 검색
- **View Toggle Buttons**:
  - `List`: 리스트 형태로 보기
  - `Kanban`: 칸반 보드 형태로 보기 (상태별 분류)
- **New Prompt Button**:
  - `+ New Prompt`: 새 프롬프트 생성 (사용량 제한 확인 후 이동)
  - *Tooltip*: 무료 플랜 사용량 초과 시 경고 및 업그레이드 안내

#### 3.1.2 Prompt List/Card Options
- **Prompt Card**:
  - `Title`, `Description` (Truncated)
  - `Tags/Category` Badge
  - `Run` Button: 프롬프트 즉시 실행 (테스트)
  - `More Info` (···) Menu:
    - `Edit`: 수정 페이지 이동
    - `Delete`: 삭제 (확인 팝업 노출)

### 3.2 프로젝트 목록 (Projects)
다양한 프롬프트를 연결하여 워크플로우를 구성하는 프로젝트 리스트입니다.

#### 3.2.1 Header Area
- **Title**: "Personal Projects" 또는 "{Team Name} Projects"
- **New Project Button**: `+ New Project` (모달 호출)

#### 3.2.2 Create/Edit Project Modal
- **Inputs**:
  - `Project Name` (Text, Required)
  - `Description` (Textarea, Optional)
- **Actions**:
  - `Cancel`: 모달 닫기
  - `Create/Save`: 프로젝트 생성 또는 수정 사항 저장

#### 3.2.3 Project Card
- **Info**: 제목, 설명, 마지막 수정일, 포함된 노드 수(Item Count)
- **Interaction**: 클릭 시 프로젝트 상세(Canvas)로 이동
- **Context Menu**:
  - `Edit`: 메타데이터(제목/설명) 수정 모달 호출
  - `Delete`: 프로젝트 삭제 (Red Alert Modal 호출)

### 3.3 프로젝트 상세 (Canvas / Workflow Editor)
노드 기반의 시각적 워크플로우 편집기입니다.

#### 3.3.1 Top Toolbar
- **Left Group**:
  - `Back Arrow`: 리스트로 돌아가기
  - `Project Title`: 현재 프로젝트 이름
  - `Lock Status`: "Editing (Locked by you)" 또는 "Locked by {Name}" 배지
- **Right Group (Actions)**:
  - `Edit Mode` Button (Team Only): 동시 편집 방지를 위한 Lock 획득
  - `Finish Editing` Button (Team Only): Lock 해제 및 저장
  - `Publish to Team` Button (Personal Only): 현재 프로젝트를 선택된 팀으로 복제
  - `Memo` Button: 메모 노드(Sticky Note) 추가
  - `Add Node` Button: 기본 프롬프트 노드 추가
  - `Save` Button: 수동 저장 (변경 사항이 있을 때 활성화)

#### 3.3.2 Canvas Area (React Flow)
- **Interactive Nodes**:
  - `Prompt Node`: 프롬프트 선택/수정, 연결점(Handle) 제공
  - `Memo Node`: 자유로운 텍스트 메모, 리사이징 가능
- **Edges**: 노드 간의 연결 선, 삭제 가능
- **Workflow Controls**: Zoom In/Out, Fit View, Mini Map

### 3.4 팀 설정 (Team Settings)
팀 관리자를 위한 설정 페이지입니다.

#### 3.4.1 Header
- **Title**: "Team Settings"
- **Invite Member Button**: 이메일 초대 모달 호출 (Owner/Admin Only)

#### 3.4.2 Members List (Table)
- **Columns**: Member Info(이름/이메일), Role, Joined Date, Actions
- **Role Dropdown**:
  - `Viewer` / `Editor` / `Admin` 선택 (자신보다 낮은 권한만/Owner만 가능)
- **Action Buttons**:
  - `Remove`: 팀원 내보내기 (Trash Icon)

### 3.5 프롬프트 상세 (Editor & Evaluation) - *참고*
별도 페이지(`/prompts/view` or `/edit`)에서 프롬프트 작성 및 최적화를 수행합니다.

- **Editor Panel**: Markdown/Text 모드, 변수 자동 감지
- **Evaluation Panel**:
  - `Run Evaluation`: Gemini API 호출하여 점수 측정
  - `Optimization`: 점수가 낮을 경우 AI가 개선안 제안 및 자동 수정(Accept/Reject)
