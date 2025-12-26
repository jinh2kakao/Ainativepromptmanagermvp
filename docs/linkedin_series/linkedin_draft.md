# Product Owner에서 Product Builder로: 3주간의 AI-Native 제품 0 to 1 개발기

"기획자가 코드를 알면 좋다"는 말은 이제 부족합니다. AI 시대, **Product Owner는 직접 제품을 깎아내는 Product Builder가 되어야 합니다.**

지난 3주간, `Prompt Manager`라는 AI-Native 프로덕트를 밑바닥부터 Production 레벨까지 혼자 구축하며 겪은 치열한 과정과 인사이트를 공유합니다. 단순한 사이드 프로젝트가 아닌, 실제 고객의 문제를 해결하고 비즈니스 가치를 창출하기 위한 **Engineering & Business Decision**의 기록입니다.

---

## 📅 Week 1: "Done is better than Perfect" (MVP)
> **Goal**: 핵심 가치(Prompt Management) 검증을 위한 신속한 배포

첫 주는 '속도'가 생명이었습니다. 완벽한 아키텍처보다 '작동하는 소프트웨어'를 목표로 달렸습니다.
*   **Challenge**: 사용자 인증부터 데이터 관리까지, 바닥부터 시작하는 0 to 1.
*   **Action**: Supabase Auth와 Next.js 16을 활용해 빠르게 뼈대를 잡았습니다. 'Vibe Coding' 원칙을 세워 심미성과 기능을 동시에 잡으며 개발 속도를 높였습니다.
*   **Insight**: 초기 단계에서 오버 엔지니어링은 독입니다. 사용자가 가치를 느낄 수 있는 최소한의 기능(Core Loop)에 집중하세요.

## ⚖️ Week 2: Project Crucible - 비즈니스와 기술의 교차점
> **Goal**: 비용 효율화와 성능 최적화 (The Gemini Factory)

기능이 동작하자 '비용'과 '속도'라는 현실적인 벽에 부딪혔습니다. OpenAI 모델 기반의 프롬프트 최적화 엔진은 비용이 너무 높았습니다. 여기서 PO로서의 판단과 개발자로서의 실행력이 결합된 **'Project Crucible'**이 시작되었습니다.
*   **Problem**: 고비용의 LLM 사용으로 인한 수익성 악화 우려.
*   **Decision**: OpenAI에서 **Google Gemini 1.5 Flash**로 전면 마이그레이션.
*   **Engineering**: 단순 API 교체가 아닌, DSPy 호환성을 위한 커스텀 어댑터(GeminiLM) 개발 및 `MIPROv2` 최적화 기법 도입.
*   **Result**: 
    *   비용 **50% 절감** ($0.15 → $0.075 / 1M tokens)
    *   응답 속도 개선 및 실시간 피드백 시스템(Supabase Realtime) 구축.
*   **Refer**: [Google Gemini Pricing](https://ai.google.dev/pricing), [DSPy Framework](https://github.com/stanfordnlp/dspy)

## 🔧 Week 3: "The Silent Drop" - 보이지 않는 문제를 해결하다
> **Goal**: 엔터프라이즈급 신뢰성 확보 (Reliability)

"메일이 안 와요." 
가장 무서운 피드백입니다. Google SMTP의 조용한 차단(Silent Drop) 이슈와 SSL/CORS 문제 등, 프로덕션 환경에서만 발생하는 '진짜 문제'들과 싸웠습니다.
*   **Problem**: SMTP 프로토콜의 신뢰성 문제 및 보안 설정(Mixed Content) 오류.
*   **Solution**: 
    *   **Strategy Pattern** 도입: 메일 발송 로직을 인터페이스화하여 SMTP에서 **Gmail API (OAuth 2.0)**로 유연하게 교체.
    *   **Full SSL**: Cloudflare와 AWS EC2 간의 Strict SSL 구성으로 보안 강화.
*   **Insight**: 로컬에서 잘 도는 코드는 반쪽짜리입니다. 진짜 실력은 배포 환경에서 발생하는 'Edge Case'를 어떻게 처리하느냐에 달려 있습니다.

## 🚀 Week 4: AI Agent Recommendation (Professional Polish)
> **Goal**: 단순 도구를 넘어선 '인텔리전트 파트너'로

마지막 주는 제품의 '지능'을 높이는 데 집중했습니다. 단순히 프롬프트를 저장하는 것을 넘어, 프롬프트 구조를 분석해 최적의 AI 모델(Claude 3.5 Sonnet, GPT-4o 등)을 추천해주는 기능을 탑재했습니다.
*   **Feature**: 사용자의 의도와 복잡도를 분석하여 적합한 AI Agent를 추천 및 자동 설정.
*   **Impact**: 사용자는 '어떤 모델을 써야 할지' 고민할 필요 없이, 가장 적합한 도구를 즉시 활용할 수 있게 되었습니다.

---

## 🎯 Conclusion: Product Builder가 된다는 것

Product Builder는 기획서(PRD)를 던져놓고 기다리는 사람이 아닙니다. 
**비즈니스 임팩트를 정의(PO)하고, 기술적 제약을 해결(Dev)하며, 사용자에게 가치를 전달(Delivery)하는 전체 사이클을 장악하는 사람입니다.**

이 프로젝트는 단순한 코딩이 아니었습니다. '비용 최적화'라는 비즈니스 목표를 달성하기 위해 '커스텀 어댑터 개발'이라는 기술적 수단을 선택하고 직접 구현해낸 과정이었습니다.

지금도 시장은 더 빠르고, 더 똑똑한 Product Builder를 원합니다. 
직접 만들고, 부딪히고, 해결하세요. 그 과정 속에 진짜 인사이트가 있습니다.

#ProductManager #ProductOwner #ProductBuilder #FullStack #AI #Gemini #NextJS #Engineering #Startup #0to1
