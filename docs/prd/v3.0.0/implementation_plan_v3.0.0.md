# 구현 계획 - 백엔드 파운데이션 (Phase 1)

## 목표 설명
"팀 협업(Team Collaboration)" 기능(v3.0.0)을 위한 핵심 데이터베이스 스키마 변경을 구현합니다. 여기에는 `Team` 및 `TeamMember` 모델 정의와 소유권 및 잠금(Locking) 필드를 포함한 `Project` 모델 확장이 포함됩니다. 이 기반은 추후 RBAC(역할 기반 접근 제어) 로직과 팀 API 개발을 가능하게 합니다.

## 사용자 검토 필요
> [!IMPORTANT]
> **스키마 마이그레이션 전략**: 현재 `SQLModel`과 `create_all()`을 사용하므로, 새로운 테이블(`Team`, `TeamMember`)은 자동으로 생성됩니다. 하지만 기존 테이블(`Project`)에 컬럼을 추가하는 것은 자동 반영되지 않을 수 있으므로 수동 마이그레이션 단계가 필요합니다.
> **결정**: `scripts/migrate_v3.py` 스크립트를 작성하여 기존 데이터를 유지하면서 안전하게 컬럼을 추가하도록 하겠습니다.

## 제안된 변경 사항

### Backend

#### [NEW] [models.py](file:///Users/jinh/Ainativepromptmanagermvp/backend/models.py)
- **`Team` 모델 추가**:
    - `id`: UUID (PK)
    - `name`: str
    - `owner_id`: UUID (FK -> User)
    - `created_at`: datetime
- **`TeamMember` 모델 추가**:
    - `team_id`: UUID (FK -> Team, PK)
    - `user_id`: UUID (FK -> User, PK)
    - `role`: str (Enum: owner, admin, editor, viewer)
- **`Project` 모델 업데이트**:
    - `team_id`: Optional[UUID] (FK -> Team) 추가
    - `locked_by`: Optional[UUID] (FK -> User) 추가
    - `locked_at`: Optional[datetime] 추가

#### [NEW] [scripts/migrate_v3.py](file:///Users/jinh/Ainativepromptmanagermvp/backend/scripts/migrate_v3.py)
- 데이터 손실 없이 기존 데이터베이스에 v3.0.0 기능을 지원하기 위한 `ALTER TABLE` 명령을 수행하는 독립형 스크립트입니다.

## 검증 계획

### 자동화 테스트
- **스키마 검증 스크립트**: `python backend/scripts/test_schema_v3.py` (생성 예정) 실행:
    1. 데이터베이스 초기화 (또는 기존 연결).
    2. `Team` 및 `TeamMember` 생성 시도.
    3. `team_id`와 `locked_by`를 포함하여 `Project` 생성 시도.
    4. 모든 연산이 성공하고 데이터 조회가 가능한지 확인.

### 수동 검증
- **DB 검사**:
    1. 마이그레이션 스크립트 실행.
    2. 데이터베이스 도구(또는 `sqlite3` CLI) 접속.
    3. `.schema teams` 및 `.schema projects` 명령어로 올바른 구조인지 확인.
