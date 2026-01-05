# 프롬프트 템플릿 설명 일괄 업데이트 계획

## 1. 개요
현재 등록된 모든 프롬프트 템플릿에 대해 전문적인 프롬프트 엔지니어 관점에서 `description` 필드를 생성하고 일괄 업데이트를 진행합니다.

## 2. 업데이트 전략
템플릿의 `name`을 분석하여 카테고리별/유형별로 적절한 설명을 매핑합니다.

### A. 기획 및 비즈니스 (Business & Strategy)
| 템플릿명 | 설명 |
|---|---|
| SWOT Analysis Strategy | 강점, 약점, 기회, 위협 요소를 분석하여 전략적 인사이트를 도출합니다. |
| Value Proposition Canvas | 고객의 니즈와 제품의 가치를 매핑하여 시장 적합성을 분석합니다. |
| Lean Canvas | 스타트업의 비즈니스 모델을 한 장의 캔버스로 신속하게 구조화합니다. |
| Project Proposal | 프로젝트의 목적, 범위, 일정, 예산을 포함한 설득력 있는 제안서를 작성합니다. |
| Meeting Minutes | 회의의 안건, 논의 내용, 결정 사항, 액션 아이템을 요약 정리합니다. |
| Business Model Canvas | 비즈니스의 9가지 핵심 요소를 분석하여 수익 모델과 가치 제안을 정의합니다. |

### B. 디자인 및 UX (Design & UX)
| 템플릿명 | 설명 |
|---|---|
| Iconography Guidelines | 아이콘의 형태, 사이즈, 사용 규칙을 정의하여 시각적 일관성을 확보합니다. |
| Color Palette Generator | 브랜드 아이덴티티에 맞는 조화로운 컬러 팔레트와 계층 구조를 생성합니다. |
| Mobile Bottom Navigation | 모바일 앱의 하단 네비게이션 구조와 탭 구성을 최적화합니다. |
| User Onboarding Flow | 신규 사용자의 서비스 적응을 돕는 단계별 온보딩 경험을 설계합니다. |
| UI/UX Interaction Spec | 개발자 핸드오프를 위한 상세한 인터랙션 동작과 피드백 명세서를 작성합니다. |
| User Interview Guide | 사용자 심층 인터뷰를 위한 질문 리스트와 시나리오를 체계적으로 구성합니다. |

### C. 마케팅 및 콘텐츠 (Marketing & Content)
| 템플릿명 | 설명 |
|---|---|
| Product Detail Page Copy | 구매 전환율을 높이기 위한 매력적인 상품 상세 페이지 문구를 작성합니다. |
| High Open Rate Email Subject | 클릭을 유도하는 매력적인 이메일 제목과 프리헤더를 작성합니다. |
| B2B Whitepaper Outline | 전문적인 B2B 리드 생성을 위한 백서(Whitepaper)의 목차와 핵심 내용을 구성합니다. |
| Customer Success Case Study | 고객의 성공 사례를 스토리텔링 형식으로 구성하여 신뢰도를 높입니다. |
| Weekly Newsletter Plan | 정기 뉴스레터의 주제 선정부터 섹션 구성까지 주간 발행 계획을 수립합니다. |
| App Store Description | 앱 스토어 최적화(ASO)를 고려한 매력적인 앱 소개 및 홍보 문구를 작성합니다. |

### D. 개발 및 엔지니어링 (Development)
| 템플릿명 | 설명 |
|---|---|
| API Requirement Spec | API 엔드포인트, 요청/응답 스키마, 에러 코드를 상세히 정의합니다. |
| GraphQL Schema Design | 효율적인 데이터 쿼리를 위한 GraphQL 타입과 리졸버 스키마를 설계합니다. |
| React Component Structure | 재사용성과 유지보수성을 고려한 React 컴포넌트 구조를 설계합니다. |
| Terraform Infrastructure | IaC(Infrastructure as Code)를 위한 Terraform 리소스 구성을 정의합니다. |
| CI/CD Pipeline | 안정적인 배포를 위한 지속적 통합 및 배포 파이프라인을 설계합니다. |
| Code Refactoring Expert | 기존 코드의 가독성과 성능을 개선하기 위한 전문적인 리팩토링 가이드를 제공합니다. |

### E. 기타 및 공통
| 템플릿명 | 설명 |
|---|---|
| Default Template | 해당 카테고리의 기본 템플릿입니다. |
| Assistance Template | 단계별 가이드를 통해 완성도 높은 결과를 만드는 AI 지원 템플릿입니다. |
| (이미지 생성 템플릿) | 고품질 이미지 생성을 위한 상세 프롬프트입니다. |

## 3. 실행 방법
Python 스크립트(`backend/bulk_update_descriptions_v2.py`)를 작성하여 `PromptTemplate` 테이블을 순회하며 매핑된 설명을 업데이트합니다. 설명이 없는(`None`) 항목을 우선적으로 처리합니다.
