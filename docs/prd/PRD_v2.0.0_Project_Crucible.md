# PRD v2.0.0: Project Crucible (AI-Native Optimization Platform)

## 1. 개요 (Overview)
본 PRD는 "Prompt Manager"를 넘어선 "AI-Native Optimization Platform"으로의 도약을 정의합니다. 핵심 이니셔티브인 **Project Crucible**을 통해, 시스템이 능동적으로 프롬프트를 평가(Evaluate)하고, 최적화(Optimize)하며, 이를 관리할 수 있는 전용 파이프라인과 UI를 구축합니다.

## 2. 주요 목표 (Key Objectives)
1.  **자동화된 품질 관리 (Automated QA)**: 사용자가 등록한 템플릿의 품질을 정량적으로 평가하여 낮은 품질의 프롬프트를 식별.
2.  **AI 기반 최적화 (AI Optimization)**: 식별된 저품질 프롬프트를 LLM(DSPy)을 통해 자동으로 개선하여 'Golden Prompt'로 전환.
3.  **관리 효율성 증대 (Admin Efficiency)**: 관리자가 최적화 현황을 한눈에 파악하고, 시스템이 제안한 최적화 결과를 승인하거나 모니터링할 수 있는 대시보드 제공.

## 3. 핵심 기능: The Judge (Module 1)
-   **정의**: 프롬프트의 품질을 휴리스틱 및 정적 분석 기법으로 평가하는 모듈.
-   **기술 스택**: Supabase Edge Functions (TypeScript), Deno.
-   **평가 지표**:
    1.  **Readability (가독성)**: Flesch Reading Ease 알고리즘 기반. 복잡한 문장을 피하고 명확한 지시를 내리는지 평가.
    2.  **Structure (구조)**: 필수 구성 요소(Persona, Context, Task, Constraints, Format)의 포함 여부 검사.
    3.  **Security (보안)**: Prompt Injection 등 악성 패턴(예: "Ignore previous instructions") 감지. (감지 시 0점 처리)
-   **워크플로우**:
    -   프롬프트 등록/수정 시 동기/비동기 호출.
    -   평가 결과(`metrics`, `total_score`)를 `prompt_ops.evaluations` 테이블에 저장.

## 4. 핵심 기능: The Optimizer (Module 2)
-   **정의**: 낮은 점수를 받은 프롬프트를 AI 모델을 사용하여 자동으로 재작성(Reformulate)하는 모듈.
-   **기술 스택**: Python Worker, DSPy (ChainOfThought), OpenAI (GPT-4o), PGMQ (Postgres Message Queue).
-   **트리거 조건**: The Judge 평가 결과 `total_score < 70`일 경우 자동 트리거.
-   **프로세스**:
    1.  **Flagging**: DB Trigger가 `templates` 상태를 `FLAGGED`로 변경하고 큐에 메시지 적재.
    2.  **Processing**: Python Worker가 큐를 폴링(Polling)하여 작업 수신.
    3.  **Optimization**: DSPy 파이프라인이 "부족한 요소(Missing Components)"와 "낮은 가독성"을 개선하는 방향으로 프롬프트 재작성.
    4.  **Completion**: 최적화 결과를 `prompt_ops.optimizations`에 저장하고 원본 템플릿 상태를 `APPROVED`로 갱신(혹은 별도 검토 상태).
    5.  **UX**: 사용자가 "최적화" 버튼 클릭 시, 즉시 모달(Skeleton UI)을 띄워 작업 승인(Feedback)을 제공하며, Background Polling을 통해 완료 시 내용을 업데이트.

## 5. 관리자 기능 (Admin Features)

### 5.1. 최적화 현황 대시보드
-   **위치**: `/admin/optimizations`
-   **기능**:
    -   실시간 최적화 로그 조회.
    -   Before(원본) vs After(최적화) 비교 뷰.
    -   초기 점수(Initial Score) 및 상태(Status) 표시.
    -   AI의 수정 사유(Reasoning) 확인.

### 5.2. 템플릿 스코어링
-   **위치**: `/admin/templates`
-   **기능**:
    -   템플릿 목록에 **Score Badge** 추가 (초록/노랑/빨강).
    -   점수 클릭 시 상세 평가 내역(누락된 요소 등) 조회 (Future Scope).

## 6. 기술적 아키텍처 (Technical Architecture)
-   **Schema**: `prompt_ops` 분리 (Microservice-like isolation).
-   **Queue**: `pgmq` 확장을 통한 신뢰성 있는 비동기 처리.
-   **Worker**: 독립적으로 실행되는 Python 컨테이너 (확장성 고려).
-   **Cost Control**:
    -   1차 평가(The Judge)는 **LLM Free** (비용 0).
    -   문제가 있는 건만 2차 최적화(The Optimizer)를 수행하여 토큰 비용 최소화.

## 7. 향후 계획 (Roadmap)
-   **v2.1**: 사용자(User)가 자신의 프롬프트를 "최적화 요청" 버튼을 통해 직접 의뢰하는 기능.
-   **v2.2**: A/B 테스팅 통합 (원본 vs 최적화본의 실제 응답 품질 비교).
-   **v2.3**: 커스텀 평가 기준(Security Policy) 설정 기능.
