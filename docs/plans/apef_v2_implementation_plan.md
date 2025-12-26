# 'The Judge' 평가 로직 APEF v2.0 업데이트 계획

## 목표 설명 (Goal Description)
이 작업의 목표는 "The Judge" 에이전트(현재 `supabase/functions/evaluate-prompt`에 구현됨)를 새로운 **APEF v2.0** 평가 기준을 사용하도록 업그레이드하는 것입니다.
기존의 결정론적 로직(단순 키워드 매칭, 가독성 점수 등)은 APEF v2.0 명세서에서 요구하는 뉘앙스, 문맥, 의도 파악이 가능한 LLM(Gemini 1.5 Flash) 기반의 의미론적(Semantic) 분석으로 대체됩니다.

## 사용자 검토 필요 (User Review Required)
> [!IMPORTANT]
> **Gemini API 의존성**: 새로운 구현은 Supabase Edge Function 환경 변수에 `GEMINI_API_KEY`가 존재해야 작동합니다. Supabase 프로젝트에 이 시크릿이 설정되어 있는지 확인해주세요 (`supabase secrets set GEMINI_API_KEY=...`).

> [!WARNING]
> **로직 전면 교체**: 이 변경은 기존의 `SecurityScanner`, `ReadabilityCalculator`, `StructureScanner` 로직을 단일 LLM 호출로 **완전히 대체**합니다. 기존의 휴리스틱 기반 점수 산정 방식은 더 이상 사용되지 않습니다.

## 변경 제안 (Proposed Changes)

### Supabase Edge Functions

#### [MODIFY] [index.ts](file:///Users/jinh/Ainativepromptmanagermvp/supabase/functions/evaluate-prompt/index.ts)
- 기존 import 및 로직을 Google Gemini API 호출로 대체합니다.
- **APEF v2.0 시스템 지침(System Instruction)**을 LLM의 시스템 프롬프트(또는 컨텍스트)로 구현합니다.
- **시스템 지침 준수 사항**:
    - **Safety Gate (보안)**: LLM이 가장 먼저 안전성을 검사하고, 안전하지 않은 경우 0점을 반환하도록 지시합니다.
    - **4가지 차원 (4 Dimensions)**: Structure (40%), Clarity (30%), Technique (20%), Efficiency (10%) 가중치를 적용합니다.
    - **출력 스키마 (Output Schema)**: APEF v2.0에 정의된 특정 JSON 구조를 강제합니다.
- API 응답을 처리하여 클라이언트에 반환합니다.

#### [DELETE] [security.ts](file:///Users/jinh/Ainativepromptmanagermvp/supabase/functions/evaluate-prompt/security.ts)
- 안전성 검사가 LLM에 의해 처리되므로 더 이상 필요하지 않습니다.

#### [DELETE] [readability.ts](file:///Users/jinh/Ainativepromptmanagermvp/supabase/functions/evaluate-prompt/readability.ts)
- 명확성(Clarity) 분석이 LLM에 의해 처리되므로 더 이상 필요하지 않습니다.

#### [DELETE] [structure.ts](file:///Users/jinh/Ainativepromptmanagermvp/supabase/functions/evaluate-prompt/structure.ts)
- 구조(Structure) 분석이 LLM에 의해 처리되므로 더 이상 필요하지 않습니다.

## 검증 계획 (Verification Plan)

### 자동화된 테스트 (Automated Tests)
로컬 환경에서 Supabase 전체를 구성하지 않고 Edge Function 로직을 검증하기 위해, **동일한 프롬프트와 로직**을 Gemini에 전송하는 Python 스크립트를 작성하여 테스트합니다.
이는 Judge의 "두뇌(Brain)"가 예상대로 작동하는지 확인하는 과정입니다.

1.  **검증 스크립트 작성**: `backend/scripts/verify_apef_logic.py`
    - 이 스크립트는 `google-generativeai` 라이브러리를 사용하여 APEF v2.0 시스템 프롬프트와 사용자의 "테스트 데이터" 프롬프트를 Gemini에 전송합니다.
    - 결과 JSON을 출력합니다.
2.  **검증 실행**:
    ```bash
    python3 backend/scripts/verify_apef_logic.py
    ```
3.  **수동 확인**:
    - 출력이 JSON 스키마와 일치하는지 확인합니다.
    - "Structure", "Clarity", "Technique", "Efficiency" 점수가 모두 포함되어 있는지 확인합니다.
    - 피드백 내용이 유의미한지 확인합니다.
