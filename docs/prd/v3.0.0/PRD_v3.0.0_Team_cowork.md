# PRD v3.0.0: 안티그라비티 에이전트 – 엔터프라이즈 팀 리소스 공유 및 권한 관리

**문서 정보**
- **버전:** 3.0.0 (Rev. Async)
- **날짜:** 2025-12-15
- **작성자:** AntiGravity Team
- **상태:** Draft

---

## 1. 서론 및 전략적 배경

### 1.1 문서 개요 및 목적
본 문서는 안티그라비티(AntiGravity) 플랫폼의 버전 3.0.0(v3.0.0) 개발을 위한 제품 요구사항 정의서(PRD)입니다. 이번 릴리즈의 핵심은 **"실시간 동시 편집"을 제외한 안전한 팀 리소스 공유와 조직 관리 시스템 구축**입니다.

복잡하고 비용이 높은 실시간 동기화(CRDT/WebSocket) 기술 도입 대신, **견고한 권한 관리(RBAC)**와 **프로젝트 공유/퍼블리싱(Publishing)** 워크플로우를 우선 구현하여 엔터프라이즈 시장의 "자산 관리" 및 "보안" 니즈를 충족시키는 것을 목표로 합니다.

### 1.2 비즈니스 맥락과 시장 요구사항
기업 고객의 핵심 요구사항은 "관리되지 않는 자산의 방지"와 "팀 단위의 접근 제어"입니다.
-   **팀 자산화:** 개인 계정에 방치된 프롬프트를 팀 소유로 전환하여 지식 자산(IP) 보호.
-   **접근 통제:** 부서별/프로젝트별로 명확한 조회 및 수정 권한 부여.

따라서 v3.0.0은 **"정적인 공유와 체계적인 관리"**에 집중합니다.

---

## 2. 사용자 경험(UX) 및 워크플로우 설계

### 2.1 워크스페이스 구조: 개인과 팀의 격리
사용자 환경은 '개인'과 '팀'으로 명확히 분리됩니다.

#### 2.1.1 개인 워크스페이스 (Personal Workspace)
-   사용자 고유의 샌드박스 환경.
-   이곳의 모든 데이터는 `Private`이며, 작성자 본인만 접근 가능.

#### 2.1.2 팀 워크스페이스 (Team Workspace)
-   엔터프라이즈 팀이 생성한 공유 공간.
-   팀 멤버는 역할(Role)에 따라 이 공간의 프로젝트를 조회하거나 수정할 수 있음.
-   **데이터 소유권:** 팀 공간에 생성되거나 이동된 프로젝트는 '팀'의 소유가 됨 (생성자가 퇴사해도 데이터는 팀에 잔존).

### 2.2 협업 모델: 퍼블리싱과 잠금(Locking)

#### 2.2.1 퍼블리싱 워크플로우 (Private to Team)
1.  **Draft:** 개인 공간에서 프롬프트 초안 작성.
2.  **Publish:** "팀 라이브러리에 게시" 버튼 클릭.
3.  **Transfer:** 원본을 복제하여 팀 프로젝트로 생성 (또는 원본 이동).
4.  **Access:** 팀 설정에 따라 모든 멤버 또는 특정 그룹에게 `Read` 권한 부여.

#### 2.2.2 비동기 편집 및 충돌 방지 (Soft Locking)
실시간 동시 편집이 없으므로, 데이터 덮어쓰기 방지를 위한 안전장치를 둡니다.
-   **단일 편집자 원칙 (Single Editor Mode):** 한 번에 한 명만 '수정 모드'에 진입할 수 있습니다.
-   **체크인/체크아웃 (Check-in/Check-out):**
    -   사용자 A가 "수정하기"를 누르면 프로젝트는 **'Locked by A'** 상태가 됩니다.
    -   사용자 B가 접근하면 "사용자 A가 수정 중입니다"라는 메시지와 함께 **Read-Only**로 열립니다.
    -   사용자 A가 저장하거나 나가면 Lock이 해제됩니다.
    -   *강제 해제:* 관리자(Admin)는 Lock을 강제로 해제할 수 있습니다.

#### 2.2.3 프롬프트 사용 및 포크(Fork)
-   **사용(Run):** 팀원은 누구나 권한 내에서 프롬프트를 실행하고 테스트할 수 있습니다.
-   **복제(Fork):** 타인의 프롬프트를 수정하고 싶다면, 원본을 건드리지 않고 '복제'하여 내 개인 공간이나 팀 내 새로운 프로젝트로 가져옵니다.

---

## 3. 팀 권한 그룹 및 엔터프라이즈 계층 구조

### 3.1 사용자 역할 (Role) 정의
팀 내에서의 역할은 다음과 같이 구분됩니다.

| 역할 (Role) | 정의 | 권한 범위 | 관리 기능 |
| :--- | :--- | :--- | :--- |
| **Owner** | 팀 소유자 | 팀 내 모든 자산에 대한 **절대 권한** | 팀 삭제, 결제 관리, 모든 Lock 해제 |
| **Admin** | 관리자 | 팀 운영 전반 관리 | 멤버 초대/방출, 프로젝트 삭제, Lock 해제 |
| **Editor** | 편집자 | 실무 작업자 | 프로젝트 생성/수정, 본인 Lock 제어 |
| **Viewer** | 뷰어 | 조회 전용 사용자 | 프로젝트 조회, 실행(Run), 복제(Fork) |

### 3.2 엔터프라이즈 구독 정책
-   **팀 생성 권한:** `Enterprise` 요금제 사용자만 팀을 생성할 수 있습니다.
-   **멤버 초대:** `Pro` 또는 `Free` 사용자를 팀 멤버로 초대할 수 있습니다. (Role 할당)
-   **구독 만료:** 구독 만료 시 팀은 **'Read-Only' 상태로 동결(Frozen)**되며, 데이터 조회만 가능하고 수정/생성은 차단됩니다.

---

## 4. 기능 명세 (Functional Specifications)

### 4.1 핵심 기능
1.  **팀 관리자 페이지:** 멤버 목록 조회, 초대(Email 발송), 역할 변경, 내보내기.
2.  **프로젝트 대시보드:** 팀 프로젝트 리스트 (필터: 내 프로젝트 / 전체 프로젝트).
3.  **프로젝트 상세 (Editor):**
    -   `수정하기` 버튼: Lock 획득 시도. 성공 시 편집 UI 활성화.
    -   `저장` 버튼: 변경 사항 DB 반영 및 Lock 해제.
    -   `보기 전용` 모드: 입력 폼 Disabled 처리.
4.  **퍼블리싱 모달:** 개인 프로젝트 선택 -> 대상 팀 선택 -> 이동/복사 실행.

---

## 5. 기술 아키텍처 및 데이터 모델링

### 5.1 데이터베이스 스키마 (PostgreSQL)
실시간성을 위한 복잡한 구조를 제거하고, 정규화된 RDB 모델을 사용합니다.

```sql
-- Team Context
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES users(id), -- users 테이블 참조
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE team_members (
  team_id UUID REFERENCES teams(id),
  user_id UUID REFERENCES users(id),
  role TEXT CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  PRIMARY KEY (team_id, user_id)
);

-- Projects Extension
ALTER TABLE projects ADD COLUMN team_id UUID REFERENCES teams(id);
ALTER TABLE projects ADD COLUMN locked_by UUID REFERENCES users(id); -- 편집 잠금용
ALTER TABLE projects ADD COLUMN locked_at TIMESTAMPTZ;
```

### 5.2 API 및 보안 전략
-   **REST API:** 기존 FastAPI 엔드포인트를 확장하여 사용합니다.
    -   `POST /teams`: 팀 생성
    -   `POST /teams/{id}/members`: 멤버 초대
    -   `POST /projects/{id}/lock`: 수정 권한 획득 (Mutex)
    -   `POST /projects/{id}/publish`: 프로젝트 팀 이관
-   **권한 검증:**
    -   API 호출 시 사용자의 `team_members.role`을 확인하여 권한을 제어합니다.
    -   DB 레벨의 RLS는 선택 사항이나, 보안 강화를 위해 권장됩니다.

---

## 6. 결론
본 PRD는 실시간 기술의 불확실성과 비용 리스크를 배제하고, 엔터프라이즈 고객의 가장 시급한 문제인 **'자산 중앙화'와 '접근 제어'**를 안정적으로 해결하는 방안을 제시합니다.
