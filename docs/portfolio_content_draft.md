# 포트폴리오 슬라이드 구성안 (Portfolio Content Draft)

첨부해주신 "AI 기반 개발 오케스트레이션(06)" 슬라이드의 톤앤매너와 구조(Header, Badge, Description, Architecture, Tech Stack)를 반영하여, 프로젝트의 핵심 가치를 전달할 수 있는 3장의 추가 슬라이드를 기획했습니다.

---

## 03. 프로젝트 중심 워크스페이스
**Project-Centric Workspace**

### [Badge]
Scaleable Prompt Management

### [Description]
단순한 텍스트 저장소를 넘어, 프롬프트를 자산화하고 프로젝트 단위로 관리하는 워크스페이스를 설계했습니다. 노드(Node) 기반의 시각적 인터페이스를 도입하여 프롬프트 간의 연결 흐름을 직관적으로 파악할 수 있으며, 팀 단위의 협업과 버전 관리(History)를 통해 엔터프라이즈급 관리 경험을 제공합니다.

### [Visual Placeholder]
`[Insert: Dashboard & Node Flow Screenshot]`
*설명: 글래스모피즘이 적용된 대시보드 화면. 좌측에는 프로젝트 폴더 구조, 중앙에는 React Flow로 구현된 프롬프트 노드 연결 그래프가 펼쳐져 있고, 우측 패널에서는 실시간 협업 중인 팀원들의 커서가 보이는 고밀도 UI.*

### [Workflow Architecture]
*   **Hierarchical Structure**: 프로젝트(Project) > 그룹(Group) > 프롬프트(Prompt)로 이어지는 체계적 자산 구조화
*   **Visual Flow Builder**: 복잡한 LLM 체인을 시각적으로 설계하고 디버깅하는 노드 에디터 구현
*   **Version Control**: Git과 유사한 롤백 및 변경 이력 추적 시스템

### [Tech Stack Used]
*   **Frontend**: Next.js 14, React Flow
*   **State Mgmt**: Zustand (Client), TanStack Query (Server)
*   **Styling**: Tailwind CSS, Framer Motion (Animations)
*   **Design**: Shadcn UI, Custom Glassmorphism

---

## 04. 멀티 모델 대응 템플릿 시스템
**Multi-Model Strategy & Applicable Agents**

### [Badge]
Adaptive Model Selection

### [Description]
단일 모델 의존성을 탈피하고, GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro 등 각 모델의 아키텍처 특성에 맞춰 최적화된 템플릿 시스템을 구축했습니다. 'Applicable AI Agents' 속성을 통해 각 모델이 선호하는 포맷(XML vs Markdown)과 추론 방식을 자동으로 매핑하여, 모델 전환 비용을 최소화했습니다.

### [Visual Placeholder]
`[Insert: Template Selection UI & Agent Chips]`
*설명: 템플릿 선택 화면에서 각 카드에 "Recommended for: GPT-4, Claude" 칩(Chip)이 붙어있는 모습. 사용자가 에이전트를 변경할 때마다 프롬프트의 구조가 동적으로 변환되는(Transpiling) 과정을 도식화.*

### [Workflow Architecture]
*   **Agent Mapping Strategy**: 템플릿별 메타데이터에 적합한 AI 모델을 태깅하고 필터링하는 로직
*   **Adaptive Formatting**: 선택된 모델에 따라 프롬프트 구문(Delimiter, Chain-of-Thought 등)을 동적 변환
*   **Strategy Pattern**: 새로운 모델 추가 시 비즈니스 로직 변경 없이 확장 가능한 백엔드 설계

### [Tech Stack Used]
*   **Backend**: FastAPI, Python (Type Hints)
*   **Database**: Supabase (PostgreSQL JSONB for Flexible Schema)
*   **Architecture**: Strategy Pattern, Factory Pattern
*   **Integration**: Official Model APIs (OpenAI, Anthropic, Google)

---

## 05. AI 기반 프롬프트 최적화 엔진
**Automated Prompt Optimization (APEF)**

### [Badge]
AI-Driven Refinement

### [Description]
실험과 수정의 반복인 프롬프트 엔지니어링 과정을 AI로 자동화했습니다. 자체 구축한 APEF(Automated Prompt Evaluation Framework)를 도입하여, 사용자의 거친 초안(Raw Draft)을 다각도로 평가하고 Meta-Prompting 기술을 통해 Production 레벨의 고정밀 프롬프트로 재작성(Rewrite)합니다.

### [Visual Placeholder]
`[Insert: Optimization Pipeline Diagram & Diff View]`
*설명: 좌측의 "Original Prompt"가 중앙의 "AI Optimizer Engine"을 거쳐 우측의 "Optimized Prompt"로 변환되는 과정. 하단에는 APEF 평가 점수(논리성, 명확성, 안전성)가 레이더 차트로 표시되고, 텍스트 변경 사항이 Diff Highlight로 강조됨.*

### [Workflow Architecture]
*   **Meta-Prompting**: 최적화 원칙(CO-STAR, Few-shot)을 내재화한 Optimizer가 의도를 분석하고 구체화
*   **Automated Evaluation**: LLM Judge를 활용하여 프롬프트의 품질을 5가지 지표로 정량적 평가
*   **Iterative Refinement**: 목표 점수에 도달할 때까지 최적화-평가 루프를 반복 수행(Self-Correction)

### [Tech Stack Used]
*   **AI Engine**: LangChain, dspy (Declarative Self-improving Language Models)
*   **Evaluator**: Claude 3.5 Sonnet (as a Judge)
*   **Algorithm**: Cosine Similarity, APEF Scoring Logic
*   **Visual**: Custom Diff Viewer

---
