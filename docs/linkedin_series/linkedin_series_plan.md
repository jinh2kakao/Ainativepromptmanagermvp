# LinkedIn Content Series: 0 to 1 Product Builder Journey

## Objective
To showcase the depth of expertise as a "Product Builder" by sharing a multi-part series on building an AI-Native product from scratch. Each episode focuses on a specific phase and its unique challenges (Business, Tech, Ops).

## Series Outline

### 📌 Ep.01: 시작이 반이다 - Product Builder의 환경 설정과 설계 (The Setup)
- **Topic**: 개발 환경 세팅, 기술 스택 선정 이유, 그리고 PRD 작성의 중요성.
- **Key Insights**:
    - 단순한 아이디어를 '구현 가능한 문서(PRD)'로 만드는 과정.
    - **Tech Stack**: Next.js 16, Supabase, TailwindCSS 4를 선택한 이유 (Speed & Modernity).
    - **Philosophy**: 'Vibe Coding' - 심미성과 기능성을 동시에 잡는 몰입형 개발.

### 📌 Ep.02: 비용과 성능의 딜레마 - Project Crucible & The Gemini Migration
- **Topic**: 초기 MVP(OpenAI)에서 비용 문제를 직면하고, Google Gemini로 전환하며 최적화 엔진을 직접 구축한 이야기.
- **Key Insights**:
    - **Problem**: 토큰 비용 감당 불가.
    - **Solution**: Gemini 1.5 Flash 마이그레이션 + Custom Adapter(GeminiLM) 개발.
    - **Tech**: DSPy 프레임워크와의 호환성 문제 해결 경험.

### 📌 Ep.03: 배포는 끝이 아니라 시작이다 - "The Silent Drop"과 신뢰성 (Reliability)
- **Topic**: 로컬에서는 완벽했지만 프로덕션에서 터진 문제들(이메일 전송 실패, SSL/CORS).
- **Key Insights**:
    - **Issue**: Google SMTP의 조용한 차단 (Silent Drop).
    - **Fix**: Strategy Pattern을 도입해 Gmail API(OAuth2)로 유연하게 전환.
    - **Lesson**: 엣지 케이스 처리가 엔지니어링의 핵심이다.

### 📌 Ep.04: 단순 도구를 넘어 지능형 파트너로 - AI Agent Recommendation
- **Topic**: 단순한 데이터 저장이 아닌, AI가 직접 개입(Intervention)하여 가치를 더하는 기능 구현.
- **Key Insights**:
    - **Feature**: 프롬프트 복잡도 분석 및 적합한 모델(Agent) 추천 로직.
    - **UX**: Static한 도구에서 Dynamic한 파트너로의 진화.
    - **Tech**: APEF(Evaluate) 시스템과 Recommendation Engine.

### 📌 Ep.05: 회고 - Product Owner에서 Product Builder로 (Conclusion)
- **Topic**: 3주간의 여정을 마무리하며 느낀 '만드는 사람'의 태도 변화.
- **Key Insights**:
    - 기획(PO)과 구현(Dev)의 경계가 무너질 때 비로소 보이는 것들.
    - '안 되는 이유'를 찾는 대신 '되게 하는 방법'을 찾는 엔지니어링 마인드셋.
