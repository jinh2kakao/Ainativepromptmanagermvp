# PRD v2.1.0: Project Crucible - Phase 2 (User Empowerment)

## 1. 개요 (Overview)
본 PRD는 "Project Crucible"의 AI 최적화 엔진을 관리자 전용(Backend-only) 기능에서 **사용자 중심(User-Facing) 기능**으로 확장하는 단계를 정의합니다.
기존 v2.0.0이 시스템 내부적인 "The Judge"와 "The Optimizer"의 구축에 집중했다면, v2.1.0은 사용자가 직접 프롬프트 품질을 확인하고(Visibility), 능동적으로 최적화를 요청하며(Actionability), 결과를 제어(Control)할 수 있는 경험을 제공합니다.

## 2. 주요 목표 (Key Objectives)
1.  **평가 가시성 (Score Visibility)**: 사용자가 작성한 프롬프트가 시스템(The Judge)에 의해 몇 점으로 평가되었는지, 어떤 부분이 부족한지(Readability, Structure 등) 알 수 있게 합니다.
2.  **온디맨드 최적화 (On-Demand Optimization)**: 시스템 자동 트리거(70점 미만) 외에, 사용자가 원할 때 언제든지 "최적화(Optimize)" 버튼을 눌러 AI의 도움을 받을 수 있게 합니다.
3.  **사용자 통제권 강화 (User Control)**: 최적화된 결과물을 무조건 덮어쓰지 않고, 원본과 비교(Diff View)한 후 사용자가 선택적으로 적용(Apply)하거나 거절(Discard)할 수 있게 합니다.

## 3. 핵심 기능 설명 (Detailed Features)

### 3.1. 프롬프트 품질 점수 배지 (Prompt Quality Score Badge)
-   **위치**: 프롬프트 상세 페이지 상단 (`PromptDetailPage`) 및 리스트 카드 (`PromptCard`).
-   **기능**:
    -   "The Judge"가 평가한 `total_score`를 시각적 배지(Color-coded)로 표시.
    -   초록(Good, 80+), 노랑(Warning, 50-79), 빨강(Bad, <50).
    -   배지 클릭/호버 시 간략한 평가 피드백(Tooltip) 노출 (예: "가독성이 너무 낮습니다.", "페르소나가 누락되었습니다.").
-   **데이터 흐름**: Backend의 `prompt_ops` 테이블 정보를 Frontend `Prompt` 객체에 매핑하여 전달.

### 3.2. 사용자 주도 최적화 요청 (User-Initiated Optimization)
-   **위치**: 프롬프트 상세 페이지 하단 "실행(Run)" 버튼 또는 "복사(Copy)" 버튼 옆.
-   **UI**: "✨ AI 최적화 (Optimize)" 버튼.
-   **동작**:
    -   버튼 클릭 시 Backend API (`/api/prompts/{id}/optimize`) 호출.
    -   로딩 상태(Loading Spinner) 및 "AI가 프롬프트를 분석 중입니다..." 메시지 표시.
    -   최적화 완료 시 Toast 메시지 또는 결과 모달 자동 팝업.
-   **권한/제한**:
    -   Pro 유저: 무제한 또는 높은 쿼터.
    -   Free 유저: 일일 제한 또는 포인트 차감 (추후 정의).

### 3.3. 최적화 결과 검토 모달 (Optimization Review Modal)
-   **트리거**: 최적화 완료 직후 또는 "검토 대기 중" 배지 클릭 시.
-   **기능**:
    -   **Diff View**: 좌측(Original) vs 우측(Optimized) 비교. 변경된 텍스트 하이라이팅.
    -   **Reasoning**: AI가 왜 이렇게 수정했는지 설명 제공 (The Optimizer의 ChainOfThought 데이터 활용).
    -   **Actions**:
        -   **적용하기 (Apply)**: 원본 내용을 최적화본으로 덮어씀 (Version History에 원본 저장 권장). **적용 즉시 자동 재평가가 수행되어 새로운 품질 점수가 반영됨.**
        -   **따로 저장 (Save as New)**: 새로운 프롬프트로 복제 저장.
        -   **거절하기 (Discard)**: 최적화 결과 폐기.

## 4. 기술적 요구사항 (Technical Requirements)

### 4.1. Frontend
-   **ScoreBadge 컴포넌트**: 점수에 따른 색상 및 툴팁 로직 구현.
-   **DiffViewer 컴포넌트**: `diff` 라이브러리 등을 활용하여 텍스트 차이 시각화.
-   **OptimizationStatus 상태 관리**: 최적화 진행 중(Polling 또는 WebSocket/SSE) 상태 처리.

### 4.2. Backend
-   **API 확장**:
    -   `GET /api/prompts/{id}` 응답에 `evaluation` 정보(score, issues) 및 `latest_optimization` 정보 포함.
    -   `POST /api/prompts/{id}/optimize`: 사용자 트리거 엔드포인트. (기존 자동화 로직 재사용하되, 강제 실행 플래그 추가).
-   **DB 스키마**:
    -   기존 `prompt_ops` 테이블을 활용하되, `prompts` 테이블과 조인 성능 고려.

## 5. 단계별 구현 계획 (Implementation Phases)
1.  **Phase 2.1 (Visibility)**: 프롬프트 리스트 및 상세 페이지에 품질 점수(Score) 노출.
2.  **Phase 2.2 (Action)**: "최적화 요청" 버튼 및 Backend 연동.
3.  **Phase 2.3 (Control)**: Diff View 모달 및 적용 로직 구현.

## 6. 성공 지표 (Success Metrics)
-   **Optimization Usage**: "AI 최적화" 버튼 클릭률 (CTR).
-   **Acceptance Rate**: 제안된 최적화 결과의 적용(Apply) 비율 > 60%.
-   **Quality Improvement**: 최적화 후 'Run' 실행 횟수 또는 사용자 만족도 증가.
