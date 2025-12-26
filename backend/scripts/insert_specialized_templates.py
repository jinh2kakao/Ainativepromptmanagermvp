import sys
import os
import json
from sqlmodel import Session, select
print("Starting script...")

# Add the parent directory to sys.path to allow importing from backend
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import engine
from models import Category, PromptTemplate, PromptMode

def create_structure(persona, asset, instruction, result):
    groups = []
    
    # 1. Persona Group
    if persona:
        persona_items = []
        if "profile" in persona:
            persona_items.append({"label": "Profile", "value": persona["profile"]})
        if "intent" in persona:
            persona_items.append({"label": "Intent", "value": persona["intent"]})
        if persona_items:
            groups.append({"groupName": "Persona", "items": persona_items})

    # 2. Asset Group
    if asset:
        asset_items = []
        if "knowledgeBase" in asset:
            asset_items.append({"label": "Knowledge Base", "value": asset["knowledgeBase"]})
        if "styleGuide" in asset:
            asset_items.append({"label": "Style Guide", "value": asset["styleGuide"]})
        if asset_items:
            groups.append({"groupName": "Asset", "items": asset_items})

    # 3. Instruction Group
    if instruction:
        instruction_items = []
        if "task" in instruction:
            instruction_items.append({"label": "Task", "value": instruction["task"]})
        if "context" in instruction:
            instruction_items.append({"label": "Context", "value": instruction["context"]})
        if "constraints" in instruction:
            instruction_items.append({"label": "Constraints", "value": instruction["constraints"]})
        if instruction_items:
            groups.append({"groupName": "Instruction", "items": instruction_items})

    # 4. Result Group
    if result:
        result_items = []
        if "format" in result:
            result_items.append({"label": "Format", "value": result["format"]})
        if "example" in result:
            result_items.append({"label": "Example", "value": result["example"]})
        if result_items:
            groups.append({"groupName": "Result", "items": result_items})
            
    return json.dumps(groups, ensure_ascii=False)

def insert_specialized_templates():
    # Define specialized templates
    # Format: "category_key": [ { "name": "...", "data": { ... } }, ... ]
    
    specialized_templates = {
        # --- Business & Product Planning ---
        "business_model": [
            {
                "name": "Lean Canvas for Startups",
                "data": {
                    "persona": {"profile": "린 스타트업 코치", "intent": "빠른 가설 검증을 위한 린 캔버스 작성"},
                    "asset": {"knowledgeBase": "Lean Canvas, Ash Maurya, MVP", "styleGuide": "핵심만 간결하게"},
                    "instruction": {"task": "문제, 솔루션, 고유 가치 제안(UVP), 경쟁 우위 등 린 캔버스의 핵심 요소를 정의하세요.", "context": "초기 아이디어 단계의 스타트업을 위한 1페이지 사업 계획서입니다.", "constraints": "각 항목은 3문장 이내로 요약하세요."},
                    "result": {"format": "Markdown 표 형식의 Lean Canvas", "example": ""}
                }
            },
            {
                "name": "SWOT Analysis Strategy",
                "data": {
                    "persona": {"profile": "전략 기획 전문가", "intent": "내부 역량과 외부 환경 분석을 통한 전략 도출"},
                    "asset": {"knowledgeBase": "SWOT, SO/WO/ST/WT 전략, 환경 분석", "styleGuide": "객관적이고 분석적인 톤"},
                    "instruction": {"task": "강점(S), 약점(W), 기회(O), 위협(T) 요소를 분석하고, 이를 결합한 크로스 전략(Cross-SWOT)을 수립하세요.", "context": "신규 시장 진입 여부를 결정하기 위한 전략 회의 자료입니다.", "constraints": "각 요소별로 최소 5가지 항목을 도출하세요."},
                    "result": {"format": "SWOT 매트릭스 및 전략 제안서", "example": ""}
                }
            },
            {
                "name": "Value Proposition Canvas",
                "data": {
                    "persona": {"profile": "프로덕트 마케팅 매니저(PMM)", "intent": "고객의 니즈와 제품의 가치 일치(Product-Market Fit) 확인"},
                    "asset": {"knowledgeBase": "Value Proposition Canvas, Customer Jobs, Pains & Gains", "styleGuide": "고객 중심적인 언어"},
                    "instruction": {"task": "고객 프로필(Jobs, Pains, Gains)과 가치 맵(Products, Pain Relievers, Gain Creators)을 매핑하여 분석하세요.", "context": "타겟 고객층의 반응이 저조하여 제품 컨셉을 재점검하고 있습니다.", "constraints": "고객의 숨겨진 니즈(Unmet Needs)를 발굴하는 데 집중하세요."},
                    "result": {"format": "가치 제안 캔버스 분석 리포트", "example": ""}
                }
            }
        ],
        "ux_research": [
            {
                "name": "Usability Testing Plan",
                "data": {
                    "persona": {"profile": "UX 리서처", "intent": "사용성 문제 발견 및 개선"},
                    "asset": {"knowledgeBase": "Nielsen Norman Group, Think Aloud Protocol, SUS", "styleGuide": "실용적이고 구체적인 가이드"},
                    "instruction": {"task": "사용성 테스트(UT)를 위한 시나리오와 과제(Task)를 설계하고, 관찰해야 할 주요 지표를 정의하세요.", "context": "프로토타입 단계에서 사용자 피드백을 수집하려고 합니다.", "constraints": "사용자에게 정답을 암시하지 않도록 중립적인 지시문을 작성하세요."},
                    "result": {"format": "UT 계획서 (시나리오, 체크리스트, 평가지표)", "example": ""}
                }
            },
            {
                "name": "Competitor UX Analysis",
                "data": {
                    "persona": {"profile": "UX 전략가", "intent": "경쟁사 대비 차별화된 사용자 경험 설계"},
                    "asset": {"knowledgeBase": "Heuristic Evaluation, UX Benchmarking", "styleGuide": "비교 분석적인 톤"},
                    "instruction": {"task": "주요 경쟁사 3곳의 UX/UI를 분석하여 장단점을 비교하고, 벤치마킹할 요소를 도출하세요.", "context": "서비스 리뉴얼을 앞두고 시장 표준을 파악해야 합니다.", "constraints": "스크린샷을 포함할 수 없으므로 텍스트로 화면 흐름을 상세히 묘사하세요."},
                    "result": {"format": "경쟁사 UX 비교 분석 보고서", "example": ""}
                }
            },
            {
                "name": "User Journey Map",
                "data": {
                    "persona": {"profile": "서비스 디자이너", "intent": "사용자 경험의 전체적인 흐름 시각화"},
                    "asset": {"knowledgeBase": "Customer Journey Map, Touchpoints, Moments of Truth", "styleGuide": "스토리텔링이 있는 서술"},
                    "instruction": {"task": "사용자의 서비스 이용 단계를 정의하고, 각 단계에서의 행동, 생각, 감정, 기회 요소를 매핑하세요.", "context": "이탈률이 높은 구간의 원인을 파악하고 개선 아이디어를 얻고자 합니다.", "constraints": "감정 곡선(Emotional Curve)의 변화를 텍스트로 표현하세요."},
                    "result": {"format": "User Journey Map (단계별 상세 기술)", "example": ""}
                }
            }
        ],
        "functional_spec": [
            {
                "name": "API Requirement Spec",
                "data": {
                    "persona": {"profile": "테크니컬 PM", "intent": "프론트엔드와 백엔드 간의 명확한 인터페이스 정의"},
                    "asset": {"knowledgeBase": "REST API, JSON, Swagger/OpenAPI", "styleGuide": "기술적이고 명확한 명세"},
                    "instruction": {"task": "필요한 API 목록을 정의하고, 각 API의 요청 파라미터(Request)와 응답 데이터(Response) 구조를 설계하세요.", "context": "화면 설계서를 바탕으로 서버 개발자에게 API 개발을 요청해야 합니다.", "constraints": "에러 코드 및 예외 처리 로직을 포함하세요."},
                    "result": {"format": "API 요구사항 명세서", "example": ""}
                }
            },
            {
                "name": "UI/UX Interaction Spec",
                "data": {
                    "persona": {"profile": "인터랙션 디자이너", "intent": "디테일한 사용자 인터랙션 정의"},
                    "asset": {"knowledgeBase": "Micro-interactions, Animation Curves, States", "styleGuide": "감각적이고 디테일한 묘사"},
                    "instruction": {"task": "버튼 클릭, 화면 전환, 로딩 등 주요 인터랙션의 동작 방식과 애니메이션 효과를 정의하세요.", "context": "개발자가 디자인 의도대로 구현할 수 있도록 상세한 가이드가 필요합니다.", "constraints": "트리거(Trigger), 동작(Action), 피드백(Feedback) 구조로 설명하세요."},
                    "result": {"format": "인터랙션 정의서", "example": ""}
                }
            },
            {
                "name": "Non-functional Requirements",
                "data": {
                    "persona": {"profile": "시스템 아키텍트", "intent": "시스템 품질 속성 정의"},
                    "asset": {"knowledgeBase": "Performance, Security, Reliability, Scalability", "styleGuide": "엄격하고 정량적인 기준"},
                    "instruction": {"task": "시스템의 성능, 보안, 가용성, 확장성 등 비기능적 요구사항(NFR)을 정의하세요.", "context": "엔터프라이즈급 솔루션 납품을 위한 요구사항 정의 단계입니다.", "constraints": "가능한 한 정량적인 목표 수치(예: 응답시간 200ms 미만)를 제시하세요."},
                    "result": {"format": "비기능 요구사항 명세서", "example": ""}
                }
            }
        ],
        "ia_design": [
            {
                "name": "Mobile Bottom Navigation",
                "data": {
                    "persona": {"profile": "모바일 UX 전문가", "intent": "모바일 환경에 최적화된 네비게이션 설계"},
                    "asset": {"knowledgeBase": "iOS Human Interface Guidelines, Material Design Navigation", "styleGuide": "직관적이고 간결한 구조"},
                    "instruction": {"task": "모바일 앱의 하단 탭바(Bottom Tab Bar) 메뉴를 구성하고, 각 탭의 하위 구조를 설계하세요.", "context": "엄지손가락으로 조작하기 쉬운 메뉴 구조가 필요합니다.", "constraints": "탭 메뉴는 3~5개로 제한하고, 중요도에 따라 배치하세요."},
                    "result": {"format": "모바일 네비게이션 구조도", "example": ""}
                }
            },
            {
                "name": "Faceted Search Logic",
                "data": {
                    "persona": {"profile": "검색 UX 설계자", "intent": "효율적인 정보 탐색 경험 제공"},
                    "asset": {"knowledgeBase": "Faceted Navigation, Filtering, Sorting", "styleGuide": "논리적이고 체계적인 분류"},
                    "instruction": {"task": "상품이나 콘텐츠 검색을 위한 필터(Filter) 및 정렬(Sort) 조건을 정의하고, 패싯(Facet) 구조를 설계하세요.", "context": "수만 개의 상품이 있는 이커머스 사이트의 검색 기능을 개선해야 합니다.", "constraints": "사용자가 자주 사용하는 조건을 우선적으로 노출하세요."},
                    "result": {"format": "검색 필터 및 정렬 로직 명세", "example": ""}
                }
            },
            {
                "name": "User Onboarding Flow",
                "data": {
                    "persona": {"profile": "그로스 해커", "intent": "신규 사용자의 서비스 적응 및 아하 모먼트 경험"},
                    "asset": {"knowledgeBase": "Aha Moment, Activation Funnel, Progressive Disclosure", "styleGuide": "친절하고 유도적인 흐름"},
                    "instruction": {"task": "앱 실행 후 회원가입부터 핵심 기능 경험까지의 온보딩 프로세스를 설계하세요.", "context": "초기 이탈률을 줄이고 사용자 활성화를 높여야 합니다.", "constraints": "사용자의 입력을 최소화하고, 가치를 빠르게 전달하는 데 집중하세요."},
                    "result": {"format": "온보딩 플로우 차트 및 화면 설명", "example": ""}
                }
            }
        ],
        "project_management": [
            {
                "name": "Risk Management Plan",
                "data": {
                    "persona": {"profile": "리스크 관리 전문가", "intent": "잠재적 위험 식별 및 대응책 마련"},
                    "asset": {"knowledgeBase": "Risk Matrix, Mitigation Strategies, Contingency Plan", "styleGuide": "보수적이고 철저한 분석"},
                    "instruction": {"task": "프로젝트 진행 중 발생할 수 있는 리스크를 식별하고, 발생 가능성과 영향도를 분석하여 대응 계획을 수립하세요.", "context": "외부 의존도가 높은 프로젝트라 불확실성이 큽니다.", "constraints": "기술적, 일정, 인력, 외부 요인 등 다양한 관점에서 리스크를 찾으세요."},
                    "result": {"format": "리스크 관리 대장 (Risk Register)", "example": ""}
                }
            },
            {
                "name": "Agile Sprint Planning",
                "data": {
                    "persona": {"profile": "스크럼 마스터", "intent": "효율적인 스프린트 운영 및 목표 달성"},
                    "asset": {"knowledgeBase": "Scrum, Sprint Backlog, Story Points, Velocity", "styleGuide": "협력적이고 목표 지향적인 톤"},
                    "instruction": {"task": "이번 스프린트의 목표(Sprint Goal)를 설정하고, 백로그 아이템을 선정하여 태스크를 할당하세요.", "context": "2주 단위 스프린트를 시작하는 플래닝 회의입니다.", "constraints": "팀의 지난 벨로시티(Velocity)를 고려하여 현실적인 계획을 세우세요."},
                    "result": {"format": "스프린트 백로그 및 계획서", "example": ""}
                }
            },
            {
                "name": "Stakeholder Communication",
                "data": {
                    "persona": {"profile": "커뮤니케이션 매니저", "intent": "원활한 정보 공유 및 이해관계자 관리"},
                    "asset": {"knowledgeBase": "Stakeholder Map, Communication Matrix", "styleGuide": "명확하고 정치적인 감각이 있는 톤"},
                    "instruction": {"task": "프로젝트 이해관계자(Stakeholder)를 정의하고, 각 대상별 보고 주기, 방식, 내용을 담은 커뮤니케이션 계획을 수립하세요.", "context": "다양한 부서가 엮인 프로젝트라 소통의 혼선을 방지해야 합니다.", "constraints": "핵심 의사결정자와 실무자를 구분하여 접근하세요."},
                    "result": {"format": "커뮤니케이션 매트릭스", "example": ""}
                }
            }
        ],

        # --- UI/UX & Creative Design ---
        "ui_structure": [
            {
                "name": "Dashboard Layout Strategy",
                "data": {
                    "persona": {"profile": "B2B SaaS 디자이너", "intent": "복잡한 데이터를 한눈에 파악할 수 있는 대시보드 설계"},
                    "asset": {"knowledgeBase": "Dashboard Design Patterns, Data Density", "styleGuide": "정보 중심적이고 깔끔한 레이아웃"},
                    "instruction": {"task": "핵심 지표(KPI)와 세부 데이터를 효과적으로 배치하는 대시보드 레이아웃을 제안하세요.", "context": "관리자용 통계 페이지를 리뉴얼 중입니다.", "constraints": "위젯 형태의 모듈형 구조를 적용하세요."},
                    "result": {"format": "대시보드 와이어프레임 설명", "example": ""}
                }
            },
            {
                "name": "Landing Page Conversion Flow",
                "data": {
                    "persona": {"profile": "CRO(전환율 최적화) 전문가", "intent": "방문자를 고객으로 전환시키는 랜딩 페이지 설계"},
                    "asset": {"knowledgeBase": "AIDA, Social Proof, Call to Action", "styleGuide": "설득력 있고 시선을 끄는 구조"},
                    "instruction": {"task": "헤더부터 푸터까지 스크롤 흐름에 따른 섹션 구성을 설계하고, 각 섹션의 목적을 정의하세요.", "context": "신규 서비스 사전 예약 페이지를 기획합니다.", "constraints": "신뢰도를 높이는 요소(리뷰, 로고 등)를 적절히 배치하세요."},
                    "result": {"format": "랜딩 페이지 섹션별 기획안", "example": ""}
                }
            },
            {
                "name": "Settings Information Architecture",
                "data": {
                    "persona": {"profile": "UI 기획자", "intent": "복잡한 설정 기능을 체계적으로 분류"},
                    "asset": {"knowledgeBase": "Card Sorting, Grouping Principles", "styleGuide": "논리적이고 찾기 쉬운 구조"},
                    "instruction": {"task": "다양한 설정 항목들을 카테고리별로 그룹핑하고, 계층 구조를 설계하세요.", "context": "기능이 추가되면서 설정 페이지가 너무 복잡해졌습니다.", "constraints": "사용자 계정, 알림, 보안, 결제 등으로 대분류를 나누세요."},
                    "result": {"format": "설정 페이지 메뉴 트리", "example": ""}
                }
            }
        ],
        "design_system": [
            {
                "name": "Typography Scale System",
                "data": {
                    "persona": {"profile": "타이포그래피 전문가", "intent": "가독성과 심미성을 모두 갖춘 서체 시스템 구축"},
                    "asset": {"knowledgeBase": "Modular Scale, Vertical Rhythm, Line Height", "styleGuide": "수학적 비율에 기반한 정의"},
                    "instruction": {"task": "H1부터 Caption까지의 폰트 사이즈, 행간(Line Height), 자간(Letter Spacing) 스케일을 정의하세요.", "context": "반응형 웹을 위한 기본 타이포그래피 가이드를 잡고 있습니다.", "constraints": "rem 단위를 기준으로 작성하세요."},
                    "result": {"format": "타이포그래피 스케일 표", "example": ""}
                }
            },
            {
                "name": "Semantic Color Palette",
                "data": {
                    "persona": {"profile": "컬러 리서처", "intent": "기능과 의미가 명확한 컬러 시스템 정의"},
                    "asset": {"knowledgeBase": "Color Theory, Accessibility (WCAG), Dark Mode", "styleGuide": "체계적인 네이밍 규칙"},
                    "instruction": {"task": "Primary, Secondary, Neutral, Semantic(Success, Warning, Error) 컬러 팔레트를 정의하고, 다크 모드 대응 값을 지정하세요.", "context": "브랜드 컬러를 기반으로 UI 전체에 적용할 컬러 시스템이 필요합니다.", "constraints": "색맹 사용자도 구분 가능한 배색을 고려하세요."},
                    "result": {"format": "시맨틱 컬러 팔레트 명세", "example": ""}
                }
            },
            {
                "name": "Iconography Guidelines",
                "data": {
                    "persona": {"profile": "아이콘 디자이너", "intent": "일관된 시각 언어의 아이콘 제작 가이드"},
                    "asset": {"knowledgeBase": "Pixel Grid, Stroke Weight, Corner Radius", "styleGuide": "기하학적이고 단순한 스타일"},
                    "instruction": {"task": "아이콘 제작을 위한 그리드 시스템, 라인 두께, 코너 라운드 값 등 세부 규칙을 정의하세요.", "context": "여러 디자이너가 작업해도 통일감을 유지해야 합니다.", "constraints": "24x24px 그리드를 기준으로 설명하세요."},
                    "result": {"format": "아이콘 디자인 가이드라인", "example": ""}
                }
            }
        ],
        "ux_writing": [
            {
                "name": "Onboarding Tooltips",
                "data": {
                    "persona": {"profile": "UX 라이터", "intent": "사용자의 기능 학습을 돕는 친절한 가이드"},
                    "asset": {"knowledgeBase": "Progressive Disclosure, Microcopy", "styleGuide": "짧고 명확하며 격려하는 톤"},
                    "instruction": {"task": "주요 기능을 설명하는 툴팁(Tooltip) 시리즈를 작성하고, 다음 단계로 넘어가는 버튼명을 정하세요.", "context": "복잡한 편집 도구를 처음 쓰는 사용자에게 사용법을 알려줘야 합니다.", "constraints": "각 툴팁은 2문장을 넘지 않도록 하세요."},
                    "result": {"format": "온보딩 툴팁 시나리오", "example": ""}
                }
            },
            {
                "name": "Empty State Messaging",
                "data": {
                    "persona": {"profile": "콘텐츠 전략가", "intent": "빈 화면에서도 행동을 유도하는 메시지 작성"},
                    "asset": {"knowledgeBase": "Call to Action, User Engagement", "styleGuide": "위트 있고 행동 지향적인 톤"},
                    "instruction": {"task": "데이터가 없을 때(예: 검색 결과 없음, 알림 없음) 표시할 문구와 행동 유도 버튼(CTA)을 작성하세요.", "context": "빈 화면이 오류처럼 보이지 않고, 사용자가 무엇을 해야 할지 알려줘야 합니다.", "constraints": "단순히 '없음'이라고 하지 말고 대안을 제시하세요."},
                    "result": {"format": "Empty State 케이스별 문구", "example": ""}
                }
            },
            {
                "name": "Success & Error Toasts",
                "data": {
                    "persona": {"profile": "마이크로카피 전문가", "intent": "시스템 상태를 명확하게 전달"},
                    "asset": {"knowledgeBase": "Feedback Loops, Error Recovery", "styleGuide": "안심시키거나 해결책을 주는 톤"},
                    "instruction": {"task": "작업 성공, 실패, 경고 상황에서 띄울 토스트 메시지(Toast Message) 문구를 작성하세요.", "context": "사용자가 자신의 행동 결과를 즉시 알 수 있어야 합니다.", "constraints": "실패 시에는 반드시 원인이나 해결 방법을 짧게 덧붙이세요."},
                    "result": {"format": "상황별 토스트 메시지 리스트", "example": ""}
                }
            }
        ],
        "graphic_branding": [
            {
                "name": "Logo Design Brief",
                "data": {
                    "persona": {"profile": "브랜드 디렉터", "intent": "디자이너에게 명확한 로고 제작 방향 제시"},
                    "asset": {"knowledgeBase": "Brand Archetype, Visual Metaphor", "styleGuide": "영감을 주는 서술"},
                    "instruction": {"task": "로고 디자인을 위한 브리프(Brief)를 작성하세요. 브랜드의 핵심 가치, 타겟 오디언스, 선호하는 스타일 등을 포함해야 합니다.", "context": "외부 디자인 에이전시에 로고 제작을 의뢰하려고 합니다.", "constraints": "추상적인 형용사보다는 구체적인 레퍼런스를 묘사하세요."},
                    "result": {"format": "로고 디자인 의뢰서", "example": ""}
                }
            },
            {
                "name": "Social Media Brand Kit",
                "data": {
                    "persona": {"profile": "SNS 마케팅 디자이너", "intent": "SNS 채널에서의 일관된 브랜드 이미지 구축"},
                    "asset": {"knowledgeBase": "Instagram Grid, Facebook Cover, Profile Image", "styleGuide": "트렌디하고 시선을 끄는 스타일"},
                    "instruction": {"task": "인스타그램, 페이스북, 유튜브 등 주요 SNS 채널에 적용할 프로필 이미지, 커버, 템플릿 가이드를 기획하세요.", "context": "브랜드 런칭에 맞춰 SNS 채널을 개설합니다.", "constraints": "각 채널별 규격과 특성을 고려하세요."},
                    "result": {"format": "SNS 브랜드 키트 구성안", "example": ""}
                }
            },
            {
                "name": "Brand Voice & Tone Guide",
                "data": {
                    "persona": {"profile": "브랜드 버벌리스트", "intent": "일관된 브랜드 목소리 정의"},
                    "asset": {"knowledgeBase": "Persona, Tone of Voice", "styleGuide": "감성적이고 명확한 정의"},
                    "instruction": {"task": "브랜드가 고객과 소통할 때 사용할 말투(Voice)와 태도(Tone)를 정의하고, 상황별 예시(Do & Don't)를 작성하세요.", "context": "마케터와 CS 담당자가 통일된 톤으로 커뮤니케이션해야 합니다.", "constraints": "브랜드를 사람에 비유하여 페르소나를 묘사하세요."},
                    "result": {"format": "브랜드 보이스 가이드라인", "example": ""}
                }
            }
        ],
        "design_review": [
            {
                "name": "Accessibility Audit",
                "data": {
                    "persona": {"profile": "접근성 전문가", "intent": "모든 사용자가 사용할 수 있는 디자인 검증"},
                    "asset": {"knowledgeBase": "WCAG 2.1, Screen Reader, Color Contrast", "styleGuide": "엄격하고 규범적인 톤"},
                    "instruction": {"task": "디자인 시안을 WCAG 기준에 맞춰 감사(Audit)하고, 위반 사항과 수정 권고안을 작성하세요.", "context": "공공기관 프로젝트라 웹 접근성 인증 마크를 획득해야 합니다.", "constraints": "색상 대비, 폰트 크기, 포커스 상태 등을 중점적으로 확인하세요."},
                    "result": {"format": "접근성 감사 보고서", "example": ""}
                }
            },
            {
                "name": "Heuristic Evaluation",
                "data": {
                    "persona": {"profile": "HCI 전문가", "intent": "사용성 원칙에 입각한 문제 발견"},
                    "asset": {"knowledgeBase": "Nielsen's 10 Heuristics", "styleGuide": "학술적이고 체계적인 분석"},
                    "instruction": {"task": "닐슨의 10가지 휴리스틱 원칙을 기준으로 현재 디자인의 문제점을 평가하고 개선안을 제시하세요.", "context": "사용자 테스트 전에 전문가 리뷰를 통해 명백한 문제를 먼저 잡고 싶습니다.", "constraints": "각 문제점의 심각도(Severity)를 상/중/하로 매기세요."},
                    "result": {"format": "휴리스틱 평가 리포트", "example": ""}
                }
            },
            {
                "name": "Visual Consistency Check",
                "data": {
                    "persona": {"profile": "QA 디자이너", "intent": "디자인 시스템 준수 여부 확인"},
                    "asset": {"knowledgeBase": "Design System, Pixel Perfect", "styleGuide": "꼼꼼하고 디테일한 지적"},
                    "instruction": {"task": "구현된 화면이 디자인 시스템의 규칙(컬러, 타이포, 간격 등)을 잘 따르고 있는지 검수하세요.", "context": "개발 완료 후 배포 전 디자인 QA 단계입니다.", "constraints": "육안으로 확인하기 힘든 미세한 차이도 찾아내세요."},
                    "result": {"format": "디자인 QA 체크리스트", "example": ""}
                }
            }
        ],

        # --- Software Development & Engineering ---
        "frontend_dev": [
            {
                "name": "Custom React Hook",
                "data": {
                    "persona": {"profile": "React 전문가", "intent": "복잡한 로직의 재사용성 향상"},
                    "asset": {"knowledgeBase": "React Hooks, Closure, Memory Leak", "styleGuide": "함수형 프로그래밍 스타일"},
                    "instruction": {"task": "특정 기능을 수행하는 커스텀 훅(Custom Hook)을 구현하고, 사용 예시를 작성하세요.", "context": "여러 컴포넌트에서 공통으로 사용하는 비즈니스 로직을 분리해야 합니다.", "constraints": "의존성 배열(Dependency Array)을 정확하게 관리하세요."},
                    "result": {"format": "React Custom Hook 코드", "example": ""}
                }
            },
            {
                "name": "State Management Slice",
                "data": {
                    "persona": {"profile": "프론트엔드 아키텍트", "intent": "효율적인 전역 상태 관리"},
                    "asset": {"knowledgeBase": "Redux Toolkit, Zustand, Immutability", "styleGuide": "예측 가능한 상태 변화"},
                    "instruction": {"task": "전역 상태 관리를 위한 스토어 슬라이스(Slice)와 액션, 리듀서를 정의하세요.", "context": "복잡한 사용자 세션 및 설정 정보를 관리해야 합니다.", "constraints": "비동기 액션 처리(Thunk/Saga) 로직을 포함하세요."},
                    "result": {"format": "State Management 코드 (Slice/Store)", "example": ""}
                }
            },
            {
                "name": "Performance Optimization",
                "data": {
                    "persona": {"profile": "웹 성능 엔지니어", "intent": "렌더링 성능 및 로딩 속도 개선"},
                    "asset": {"knowledgeBase": "React.memo, useMemo, Lazy Loading, Code Splitting", "styleGuide": "성능 중심적 사고"},
                    "instruction": {"task": "컴포넌트의 불필요한 리렌더링을 방지하고, 초기 로딩 속도를 최적화하는 코드를 작성하세요.", "context": "대시보드 페이지가 느리다는 사용자 불만이 접수되었습니다.", "constraints": "프로파일링 도구로 측정 가능한 개선 포인트를 짚어주세요."},
                    "result": {"format": "최적화 적용 코드 및 설명", "example": ""}
                }
            }
        ],
        "backend_api": [
            {
                "name": "GraphQL Schema Design",
                "data": {
                    "persona": {"profile": "API 디자이너", "intent": "유연하고 효율적인 데이터 쿼리 제공"},
                    "asset": {"knowledgeBase": "GraphQL SDL, Resolvers, N+1 Problem", "styleGuide": "그래프 구조적 사고"},
                    "instruction": {"task": "데이터 모델에 대한 GraphQL 타입 정의(Type Definition)와 쿼리/뮤테이션 스키마를 작성하세요.", "context": "프론트엔드에서 필요한 데이터만 골라 받을 수 있도록 API를 개선합니다.", "constraints": "N+1 문제를 방지하기 위한 해결책(DataLoader 등)을 고려하세요."},
                    "result": {"format": "GraphQL SDL 및 리졸버 로직", "example": ""}
                }
            },
            {
                "name": "Auth Middleware",
                "data": {
                    "persona": {"profile": "보안 엔지니어", "intent": "안전한 인증 및 인가 처리"},
                    "asset": {"knowledgeBase": "JWT, OAuth2, RBAC", "styleGuide": "보안 최우선"},
                    "instruction": {"task": "API 요청의 헤더에서 토큰을 검증하고, 사용자 권한을 확인하는 미들웨어를 구현하세요.", "context": "모든 보호된 라우트에 적용할 보안 계층이 필요합니다.", "constraints": "토큰 만료 및 갱신(Refresh) 로직을 고려하세요."},
                    "result": {"format": "인증 미들웨어 코드", "example": ""}
                }
            },
            {
                "name": "DB Migration Script",
                "data": {
                    "persona": {"profile": "DBA", "intent": "안전한 데이터베이스 스키마 변경"},
                    "asset": {"knowledgeBase": "Alembic, SQL, DDL", "styleGuide": "무중단 배포 고려"},
                    "instruction": {"task": "기존 테이블 구조를 변경하거나 새로운 테이블을 추가하는 마이그레이션 스크립트를 작성하세요.", "context": "서비스 운영 중에 스키마를 변경해야 합니다.", "constraints": "데이터 손실 없이 마이그레이션하고, 롤백(Rollback) 계획을 포함하세요."},
                    "result": {"format": "DB 마이그레이션 스크립트", "example": ""}
                }
            }
        ],
        "code_quality": [
            {
                "name": "Unit Test Refactoring",
                "data": {
                    "persona": {"profile": "TDD 전도사", "intent": "견고한 테스트 커버리지 확보"},
                    "asset": {"knowledgeBase": "Pytest, Jest, Mocking", "styleGuide": "테스트하기 쉬운 코드"},
                    "instruction": {"task": "기존 비즈니스 로직에 대한 단위 테스트 코드를 작성하고, 테스트가 용이하도록 의존성을 분리(Refactoring)하세요.", "context": "버그 수정 후 사이드 이펙트를 방지하기 위해 테스트를 강화합니다.", "constraints": "엣지 케이스(Edge Case)를 포함하여 테스트 커버리지를 높이세요."},
                    "result": {"format": "테스트 코드 및 리팩토링 제안", "example": ""}
                }
            },
            {
                "name": "Design Pattern Application",
                "data": {
                    "persona": {"profile": "소프트웨어 장인", "intent": "유지보수 가능한 구조 설계"},
                    "asset": {"knowledgeBase": "GoF Patterns, Strategy, Factory, Observer", "styleGuide": "우아하고 확장 가능한 구조"},
                    "instruction": {"task": "반복되는 조건문이나 결합도가 높은 코드를 적절한 디자인 패턴을 적용하여 개선하세요.", "context": "새로운 기능 추가 시 기존 코드를 수정해야 하는 문제가 있습니다.", "constraints": "Strategy 패턴이나 Factory 패턴 등을 활용하여 개방-폐쇄 원칙(OCP)을 준수하세요."},
                    "result": {"format": "디자인 패턴 적용 코드", "example": ""}
                }
            },
            {
                "name": "Global Error Handling",
                "data": {
                    "persona": {"profile": "백엔드 개발자", "intent": "일관된 에러 응답 및 로깅"},
                    "asset": {"knowledgeBase": "Exception Handling, Logging, HTTP Status", "styleGuide": "예측 가능한 에러 처리"},
                    "instruction": {"task": "애플리케이션 전역에서 발생하는 예외를 포착하여 표준화된 포맷으로 응답하는 핸들러를 구현하세요.", "context": "클라이언트가 에러를 일관되게 처리할 수 있어야 합니다.", "constraints": "내부 서버 오류(500)와 사용자 오류(400)를 명확히 구분하세요."},
                    "result": {"format": "Global Exception Handler 코드", "example": ""}
                }
            }
        ],
        "devops_infra": [
            {
                "name": "CI/CD Pipeline",
                "data": {
                    "persona": {"profile": "DevOps 엔지니어", "intent": "배포 자동화 및 안정성 확보"},
                    "asset": {"knowledgeBase": "GitHub Actions, Jenkins, CI/CD", "styleGuide": "자동화 및 효율성"},
                    "instruction": {"task": "코드 푸시부터 테스트, 빌드, 배포까지 이어지는 CI/CD 파이프라인 워크플로우를 작성하세요.", "context": "수동 배포의 실수를 줄이고 배포 주기를 단축해야 합니다.", "constraints": "프로덕션 배포 전 승인 절차나 스테이징 환경 배포를 포함하세요."},
                    "result": {"format": "CI/CD 설정 파일 (YAML)", "example": ""}
                }
            },
            {
                "name": "Terraform Infrastructure",
                "data": {
                    "persona": {"profile": "클라우드 아키텍트", "intent": "코드로 관리하는 인프라(IaC)"},
                    "asset": {"knowledgeBase": "Terraform, AWS, IaC", "styleGuide": "선언적이고 모듈화된 구성"},
                    "instruction": {"task": "AWS VPC, EC2, RDS 등 주요 인프라 리소스를 프로비저닝하는 Terraform 코드를 작성하세요.", "context": "인프라 환경을 코드로 관리하여 재현성을 높이고자 합니다.", "constraints": "변수(Variable)를 활용하여 환경(Dev/Prod)별로 구성을 분리하세요."},
                    "result": {"format": "Terraform HCL 코드", "example": ""}
                }
            },
            {
                "name": "Monitoring Setup",
                "data": {
                    "persona": {"profile": "SRE (사이트 신뢰성 엔지니어)", "intent": "시스템 상태 가시화 및 장애 감지"},
                    "asset": {"knowledgeBase": "Prometheus, Grafana, ELK Stack", "styleGuide": "데이터 기반의 관제"},
                    "instruction": {"task": "서버의 리소스 사용량과 애플리케이션 로그를 수집하고 시각화하기 위한 모니터링 구성을 설계하세요.", "context": "장애 발생 시 빠르게 원인을 파악하고 대응해야 합니다.", "constraints": "주요 지표(CPU, Memory, Request Count, Error Rate)에 대한 알림(Alert) 규칙을 설정하세요."},
                    "result": {"format": "모니터링 구성안 및 알림 규칙", "example": ""}
                }
            }
        ],
        "qa_testing": [
            {
                "name": "E2E Test Scenario",
                "data": {
                    "persona": {"profile": "QA 엔지니어", "intent": "사용자 관점에서의 기능 검증"},
                    "asset": {"knowledgeBase": "Cypress, Playwright, Selenium", "styleGuide": "실제 사용자 흐름 시뮬레이션"},
                    "instruction": {"task": "사용자가 사이트에 접속하여 상품을 구매하기까지의 전체 흐름(E2E)을 검증하는 테스트 시나리오를 작성하세요.", "context": "배포 전 핵심 기능이 정상 작동하는지 최종 확인해야 합니다.", "constraints": "로그인, 검색, 장바구니, 결제 단계를 모두 포함하세요."},
                    "result": {"format": "E2E 테스트 스크립트", "example": ""}
                }
            },
            {
                "name": "Load Testing Plan",
                "data": {
                    "persona": {"profile": "성능 테스터", "intent": "시스템의 한계 및 병목 구간 파악"},
                    "asset": {"knowledgeBase": "k6, JMeter, Stress Testing", "styleGuide": "극한 상황 가정"},
                    "instruction": {"task": "대규모 트래픽이 몰릴 때 시스템이 견딜 수 있는지 확인하기 위한 부하 테스트 계획을 수립하세요.", "context": "이벤트 오픈 시 접속자 폭주가 예상됩니다.", "constraints": "동시 접속자 수(VUser)를 단계적으로 늘려가며 임계점을 찾으세요."},
                    "result": {"format": "부하 테스트 시나리오 및 설정값", "example": ""}
                }
            },
            {
                "name": "Bug Report Template",
                "data": {
                    "persona": {"profile": "QA 매니저", "intent": "효율적인 버그 수정 커뮤니케이션"},
                    "asset": {"knowledgeBase": "Jira, Bug Tracking", "styleGuide": "재현 가능한 명확한 서술"},
                    "instruction": {"task": "개발자가 버그를 빠르게 이해하고 수정할 수 있도록 상세한 버그 리포트를 작성하세요.", "context": "QA 진행 중 발견된 이슈를 이슈 트래커에 등록해야 합니다.", "constraints": "재현 경로(Steps to Reproduce), 기대 결과, 실제 결과, 환경 정보를 반드시 포함하세요."},
                    "result": {"format": "버그 리포트", "example": ""}
                }
            }
        ],
        "tech_docs": [
            {
                "name": "SDK Documentation",
                "data": {
                    "persona": {"profile": "테크니컬 라이터", "intent": "개발자 친화적인 라이브러리 가이드"},
                    "asset": {"knowledgeBase": "API Reference, Getting Started", "styleGuide": "따라하기 쉬운 튜토리얼"},
                    "instruction": {"task": "SDK 설치부터 초기화, 주요 함수 사용법까지 설명하는 개발자 문서를 작성하세요.", "context": "자사 API를 래핑한 SDK를 파트너사에 배포합니다.", "constraints": "Copy & Paste 가능한 코드 스니펫을 풍부하게 제공하세요."},
                    "result": {"format": "SDK 연동 가이드 문서", "example": ""}
                }
            },
            {
                "name": "System Architecture Diagram",
                "data": {
                    "persona": {"profile": "소프트웨어 아키텍트", "intent": "시스템 구조의 시각적 전달"},
                    "asset": {"knowledgeBase": "UML, C4 Model, Mermaid.js", "styleGuide": "구조적이고 계층적인 표현"},
                    "instruction": {"task": "시스템의 주요 컴포넌트와 그들 간의 관계, 데이터 흐름을 보여주는 아키텍처 다이어그램을 설명하세요.", "context": "신규 입사자에게 전체 시스템 구조를 설명해야 합니다.", "constraints": "Mermaid 문법을 사용하여 텍스트로 다이어그램을 표현하세요."},
                    "result": {"format": "Mermaid 아키텍처 다이어그램 코드", "example": ""}
                }
            },
            {
                "name": "Troubleshooting Guide",
                "data": {
                    "persona": {"profile": "기술 지원 엔지니어", "intent": "신속한 문제 해결 지원"},
                    "asset": {"knowledgeBase": "FAQ, Debugging", "styleGuide": "문제 해결 중심"},
                    "instruction": {"task": "자주 발생하는 기술적 문제와 그에 대한 원인, 해결 방법을 정리한 트러블슈팅 가이드를 작성하세요.", "context": "고객사 개발자들의 기술 문의가 반복되고 있습니다.", "constraints": "에러 메시지를 키워드로 검색할 수 있도록 구성하세요."},
                    "result": {"format": "트러블슈팅 가이드 (증상/원인/해결)", "example": ""}
                }
            }
        ],

        # --- Data Analysis & AI ---
        "data_query": [
            {
                "name": "Cohort Analysis SQL",
                "data": {
                    "persona": {"profile": "데이터 분석가", "intent": "사용자 유지율(Retention) 분석"},
                    "asset": {"knowledgeBase": "Cohort Analysis, SQL Date Functions", "styleGuide": "효율적이고 가독성 높은 쿼리"},
                    "instruction": {"task": "가입 시점(월별)에 따른 사용자 코호트 유지율을 계산하는 SQL 쿼리를 작성하세요.", "context": "마케팅 캠페인의 장기적인 효과를 측정해야 합니다.", "constraints": "첫 구매일과 재구매일을 기준으로 리텐션을 산출하세요."},
                    "result": {"format": "SQL 쿼리문", "example": ""}
                }
            },
            {
                "name": "Funnel Analysis SQL",
                "data": {
                    "persona": {"profile": "그로스 분석가", "intent": "사용자 전환 단계별 이탈률 파악"},
                    "asset": {"knowledgeBase": "Funnel Analysis, Conversion Rate", "styleGuide": "단계별 로직이 명확한 쿼리"},
                    "instruction": {"task": "메인 페이지 방문 -> 상품 상세 -> 장바구니 -> 결제 완료로 이어지는 퍼널별 전환율을 구하는 쿼리를 작성하세요.", "context": "결제 단계에서의 이탈이 심각하여 원인을 파악하고자 합니다.", "constraints": "각 단계별 사용자 수와 전 단계 대비 전환율을 출력하세요."},
                    "result": {"format": "퍼널 분석 SQL 쿼리", "example": ""}
                }
            },
            {
                "name": "Data Cleaning Script",
                "data": {
                    "persona": {"profile": "데이터 엔지니어", "intent": "분석 가능한 깨끗한 데이터셋 생성"},
                    "asset": {"knowledgeBase": "Data Preprocessing, Null Handling, Deduplication", "styleGuide": "방어적이고 꼼꼼한 로직"},
                    "instruction": {"task": "수집된 로그 데이터에서 중복을 제거하고, 결측치(Null)를 적절한 값으로 대체하거나 제거하는 전처리 쿼리를 작성하세요.", "context": "더러운 데이터로 인해 분석 결과의 신뢰도가 떨어지고 있습니다.", "constraints": "이상치(Outlier)를 식별하는 기준도 포함하세요."},
                    "result": {"format": "데이터 전처리 SQL/Python 코드", "example": ""}
                }
            }
        ],
        "data_visualization": [
            {
                "name": "Sales Performance Dashboard",
                "data": {
                    "persona": {"profile": "BI 전문가", "intent": "매출 현황의 직관적 시각화"},
                    "asset": {"knowledgeBase": "KPI Dashboard, Trend Analysis", "styleGuide": "경영진이 보기 편한 요약형"},
                    "instruction": {"task": "월별 매출 추이, 카테고리별 판매 비중, 지역별 매출을 보여주는 대시보드 레이아웃을 기획하세요.", "context": "매주 월요일 경영 회의에서 사용할 핵심 지표 대시보드입니다.", "constraints": "전년 대비 성장률(YoY)을 강조하여 표현하세요."},
                    "result": {"format": "매출 대시보드 기획안", "example": ""}
                }
            },
            {
                "name": "User Engagement Heatmap",
                "data": {
                    "persona": {"profile": "UX 데이터 분석가", "intent": "사용자 행동 패턴의 시각적 파악"},
                    "asset": {"knowledgeBase": "Heatmap, Click Tracking, Scroll Depth", "styleGuide": "직관적인 색상 척도 사용"},
                    "instruction": {"task": "웹사이트 내에서 사용자의 클릭 빈도와 스크롤 도달률을 시각화하는 히트맵 분석 방안을 수립하세요.", "context": "메인 페이지의 어떤 영역이 가장 주목받는지 알고 싶습니다.", "constraints": "모바일과 데스크톱을 구분하여 분석하세요."},
                    "result": {"format": "히트맵 분석 가이드", "example": ""}
                }
            },
            {
                "name": "Executive Summary Slide",
                "data": {
                    "persona": {"profile": "데이터 스토리텔러", "intent": "데이터 기반의 설득력 있는 보고"},
                    "asset": {"knowledgeBase": "Data Storytelling, Slide Design", "styleGuide": "핵심 메시지 중심"},
                    "instruction": {"task": "복잡한 분석 결과를 한 장의 슬라이드로 요약하여, 의사결정자가 바로 행동을 취할 수 있도록 구성하세요.", "context": "분기 실적 보고서의 요약 장표를 작성해야 합니다.", "constraints": "3가지 핵심 인사이트와 1가지 제언을 포함하세요."},
                    "result": {"format": "임원 보고용 요약 슬라이드 구성", "example": ""}
                }
            }
        ],
        "data_analysis": [
            {
                "name": "A/B Test Significance",
                "data": {
                    "persona": {"profile": "통계학자", "intent": "실험 결과의 통계적 유의성 검증"},
                    "asset": {"knowledgeBase": "Hypothesis Testing, P-value, Confidence Interval", "styleGuide": "엄밀하고 객관적인 해석"},
                    "instruction": {"task": "A/B 테스트 결과를 분석하여 두 그룹 간의 차이가 통계적으로 유의미한지 검정(t-test 등)하는 절차를 설명하세요.", "context": "버튼 색상 변경이 클릭률에 미친 영향을 판단해야 합니다.", "constraints": "P-value 0.05를 기준으로 결론을 내리세요."},
                    "result": {"format": "A/B 테스트 분석 보고서", "example": ""}
                }
            },
            {
                "name": "Churn Prediction Model",
                "data": {
                    "persona": {"profile": "머신러닝 엔지니어", "intent": "이탈 위험 고객 조기 탐지"},
                    "asset": {"knowledgeBase": "Classification, Feature Engineering, ROC-AUC", "styleGuide": "예측 모델링 관점"},
                    "instruction": {"task": "고객의 이탈(Churn)을 예측하기 위한 주요 변수(Feature)를 선정하고, 모델링 방법론을 제안하세요.", "context": "이탈 징후를 보이는 고객에게 선제적으로 혜택을 제공하려 합니다.", "constraints": "최근 접속일, 구매 빈도, 상담 이력 등을 변수로 활용하세요."},
                    "result": {"format": "이탈 예측 모델링 계획서", "example": ""}
                }
            },
            {
                "name": "Market Basket Analysis",
                "data": {
                    "persona": {"profile": "데이터 마이닝 전문가", "intent": "연관 상품 추천을 통한 매출 증대"},
                    "asset": {"knowledgeBase": "Association Rules, Apriori, Lift", "styleGuide": "인사이트 발굴 중심"},
                    "instruction": {"task": "장바구니 데이터를 분석하여 '맥주와 기저귀'처럼 함께 자주 구매되는 상품 조합을 찾는 연관 분석을 수행하세요.", "context": "상품 상세 페이지 하단에 추천 상품을 노출하려고 합니다.", "constraints": "신뢰도(Confidence)와 향상도(Lift)를 기준으로 규칙을 선정하세요."},
                    "result": {"format": "연관 분석 결과 리포트", "example": ""}
                }
            }
        ],
        "ai_modeling": [
            {
                "name": "Fine-tuning LLM Strategy",
                "data": {
                    "persona": {"profile": "AI 리서처", "intent": "도메인 특화 언어 모델 개발"},
                    "asset": {"knowledgeBase": "LLM, LoRA, Instruction Tuning", "styleGuide": "최신 연구 트렌드 반영"},
                    "instruction": {"task": "오픈소스 LLM(Llama 등)을 자사 데이터로 파인튜닝하기 위한 데이터셋 구축 및 학습 전략을 수립하세요.", "context": "법률 상담에 특화된 AI 챗봇을 개발하려고 합니다.", "constraints": "적은 리소스로 효율적으로 학습할 수 있는 LoRA 방식을 고려하세요."},
                    "result": {"format": "LLM 파인튜닝 계획서", "example": ""}
                }
            },
            {
                "name": "Image Classification CNN",
                "data": {
                    "persona": {"profile": "컴퓨터 비전 엔지니어", "intent": "이미지 자동 분류 모델 구축"},
                    "asset": {"knowledgeBase": "CNN, ResNet, Transfer Learning", "styleGuide": "딥러닝 아키텍처 중심"},
                    "instruction": {"task": "제품 이미지를 카테고리별로 자동 분류하는 CNN 모델 아키텍처를 설계하고, 전이 학습(Transfer Learning) 방법을 설명하세요.", "context": "수만 장의 상품 이미지를 수동으로 태깅하는 비용을 줄여야 합니다.", "constraints": "ResNet이나 EfficientNet 같은 사전 학습된 모델을 활용하세요."},
                    "result": {"format": "이미지 분류 모델 설계서", "example": ""}
                }
            },
            {
                "name": "Recommendation System",
                "data": {
                    "persona": {"profile": "추천 시스템 엔지니어", "intent": "개인화된 콘텐츠 추천"},
                    "asset": {"knowledgeBase": "Collaborative Filtering, Matrix Factorization, Cold Start", "styleGuide": "알고리즘 중심 서술"},
                    "instruction": {"task": "사용자 기반 협업 필터링(User-based CF)과 콘텐츠 기반 필터링을 결합한 하이브리드 추천 알고리즘을 설계하세요.", "context": "신규 가입자(Cold Start)에게도 적절한 추천을 제공해야 합니다.", "constraints": "실시간성을 고려하여 모델 서빙 방식을 제안하세요."},
                    "result": {"format": "추천 시스템 알고리즘 명세", "example": ""}
                }
            }
        ],

        # --- Marketing & Growth ---
        "copywriting": [
            {
                "name": "Product Detail Page Copy",
                "data": {
                    "persona": {"profile": "세일즈 카피라이터", "intent": "구매 전환을 유도하는 상세 페이지 작성"},
                    "asset": {"knowledgeBase": "Persuasion, Benefits over Features", "styleGuide": "사고 싶게 만드는 매력적인 톤"},
                    "instruction": {"task": "제품의 특징(Feature)을 고객의 혜택(Benefit)으로 변환하여 상세 페이지 문구를 작성하세요.", "context": "기능은 좋지만 설명이 어려워 판매가 저조한 전자기기입니다.", "constraints": "감성적인 스토리텔링을 도입부에 배치하세요."},
                    "result": {"format": "상세 페이지 카피라이팅", "example": ""}
                }
            },
            {
                "name": "High Open Rate Email Subject",
                "data": {
                    "persona": {"profile": "이메일 마케터", "intent": "이메일 오픈율 극대화"},
                    "asset": {"knowledgeBase": "Curiosity Gap, Urgency, Personalization", "styleGuide": "짧고 강렬한 훅"},
                    "instruction": {"task": "뉴스레터 오픈율을 높이기 위한 제목(Subject Line) 5가지를 제안하고, 각각의 의도를 설명하세요.", "context": "할인 프로모션 메일이 스팸함으로 가거나 무시당하고 있습니다.", "constraints": "이모지를 적절히 사용하고, 30자 이내로 작성하세요."},
                    "result": {"format": "이메일 제목 A/B 테스트안", "example": ""}
                }
            },
            {
                "name": "App Store Description",
                "data": {
                    "persona": {"profile": "ASO(앱 스토어 최적화) 전문가", "intent": "앱 다운로드 유도 및 검색 노출"},
                    "asset": {"knowledgeBase": "ASO, Keywords, Social Proof", "styleGuide": "신뢰감 있고 핵심 기능 강조"},
                    "instruction": {"task": "앱 스토어에 등록할 앱 설명 문구를 작성하고, 검색 키워드를 자연스럽게 녹여내세요.", "context": "경쟁 앱 대비 차별점이 잘 드러나지 않아 다운로드가 저조합니다.", "constraints": "첫 3줄(더보기 전)에 가장 중요한 가치를 담으세요."},
                    "result": {"format": "앱 스토어 설명문 (Short/Long)", "example": ""}
                }
            }
        ],
        "content_marketing": [
            {
                "name": "B2B Whitepaper Outline",
                "data": {
                    "persona": {"profile": "B2B 콘텐츠 전략가", "intent": "전문성 입증 및 리드(Lead) 수집"},
                    "asset": {"knowledgeBase": "Thought Leadership, Industry Trends", "styleGuide": "전문적이고 깊이 있는 인사이트"},
                    "instruction": {"task": "잠재 고객의 정보를 얻기 위한(Lead Magnet) 백서(Whitepaper)의 주제를 선정하고 목차를 구성하세요.", "context": "기업 고객에게 우리 솔루션의 필요성을 논리적으로 설득해야 합니다.", "constraints": "업계의 최신 트렌드와 통계 자료를 인용하세요."},
                    "result": {"format": "백서 기획안 (주제, 목차, 핵심 메시지)", "example": ""}
                }
            },
            {
                "name": "Customer Success Case Study",
                "data": {
                    "persona": {"profile": "고객 성공 매니저", "intent": "성공 사례를 통한 신뢰도 확보"},
                    "asset": {"knowledgeBase": "STAR Method, ROI Analysis", "styleGuide": "인터뷰 형식의 생생한 후기"},
                    "instruction": {"task": "우리 제품을 도입하여 성과를 낸 고객사의 성공 사례(Case Study)를 작성하세요.", "context": "비슷한 고민을 가진 잠재 고객에게 확신을 주어야 합니다.", "constraints": "도입 전 문제점, 도입 과정, 도입 후 정량적 성과(ROI)를 명시하세요."},
                    "result": {"format": "고객 성공 사례 인터뷰", "example": ""}
                }
            },
            {
                "name": "Weekly Newsletter Plan",
                "data": {
                    "persona": {"profile": "뉴스레터 에디터", "intent": "지속적인 독자 관계 형성"},
                    "asset": {"knowledgeBase": "Curation, Editorial Calendar", "styleGuide": "친근하고 유익한 정보 전달"},
                    "instruction": {"task": "한 달간 발행할 주간 뉴스레터의 주제와 큐레이션 콘텐츠 리스트를 기획하세요.", "context": "단순한 회사 소식 전달을 넘어, 업계 인사이트를 제공하는 미디어로 자리 잡고 싶습니다.", "constraints": "매주 고정 코너(예: 이주의 툴, 아티클 추천)를 만드세요."},
                    "result": {"format": "뉴스레터 월간 발행 계획", "example": ""}
                }
            }
        ],
        "social_media": [
            {
                "name": "LinkedIn Thought Leadership",
                "data": {
                    "persona": {"profile": "퍼스널 브랜딩 코치", "intent": "전문가로서의 인지도 구축"},
                    "asset": {"knowledgeBase": "LinkedIn Algorithm, Professional Networking", "styleGuide": "통찰력 있고 진정성 있는 어조"},
                    "instruction": {"task": "링크드인에 올릴 업계 인사이트 포스팅을 작성하세요. 자신의 경험을 바탕으로 교훈을 전달해야 합니다.", "context": "CEO의 퍼스널 브랜딩을 통해 채용과 비즈니스 기회를 만들고자 합니다.", "constraints": "가독성을 위해 문단을 나누고, 토론을 유도하는 질문으로 마무리하세요."},
                    "result": {"format": "링크드인 포스팅 초안", "example": ""}
                }
            },
            {
                "name": "Viral Twitter Thread",
                "data": {
                    "persona": {"profile": "소셜 미디어 스토리텔러", "intent": "빠른 확산과 리트윗 유도"},
                    "asset": {"knowledgeBase": "Hook, Thread Structure, Cliffhanger", "styleGuide": "짧고 호흡이 빠른 문체"},
                    "instruction": {"task": "흥미로운 주제로 트위터(X) 스레드(타래)를 작성하세요. 첫 트윗에서 강한 호기심을 유발해야 합니다.", "context": "복잡한 개념을 아주 쉽게 설명하여 바이럴을 노립니다.", "constraints": "각 트윗은 280자를 넘지 않게 구성하세요."},
                    "result": {"format": "트위터 스레드 (1~10)", "example": ""}
                }
            },
            {
                "name": "Influencer Collaboration Brief",
                "data": {
                    "persona": {"profile": "인플루언서 마케터", "intent": "효과적인 인플루언서 협업"},
                    "asset": {"knowledgeBase": "Briefing, Brand Guidelines", "styleGuide": "명확한 가이드라인"},
                    "instruction": {"task": "인플루언서에게 전달할 협업 가이드라인(Brief)을 작성하세요. 필수 언급 키워드와 촬영 컨셉을 포함해야 합니다.", "context": "뷰티 유튜버와 협업하여 신제품 리뷰 영상을 제작합니다.", "constraints": "창작자의 자율성을 존중하되, 브랜드 안전성(Brand Safety) 가이드를 명시하세요."},
                    "result": {"format": "인플루언서 협업 가이드", "example": ""}
                }
            }
        ],
        "crm_email": [
            {
                "name": "Welcome Email Series",
                "data": {
                    "persona": {"profile": "온보딩 스페셜리스트", "intent": "신규 가입자의 정착 지원"},
                    "asset": {"knowledgeBase": "Drip Campaign, Automation", "styleGuide": "환영하고 도와주는 톤"},
                    "instruction": {"task": "가입 직후부터 7일간 발송될 웰컴 이메일 시리즈(3~4통)의 시퀀스를 설계하세요.", "context": "가입만 하고 서비스를 이용하지 않는 유령 회원을 줄여야 합니다.", "constraints": "각 메일마다 하나의 명확한 행동(CTA)만 유도하세요."},
                    "result": {"format": "웰컴 이메일 시퀀스 기획", "example": ""}
                }
            },
            {
                "name": "Win-back Campaign",
                "data": {
                    "persona": {"profile": "리텐션 마케터", "intent": "이탈 고객의 재방문 유도"},
                    "asset": {"knowledgeBase": "Loss Aversion, Incentive", "styleGuide": "그리움과 혜택 강조"},
                    "instruction": {"task": "3개월 이상 접속하지 않은 휴면 고객에게 보낼 윈백(Win-back) 이메일을 작성하세요.", "context": "파격적인 혜택을 주더라도 다시 돌아오게 만들어야 합니다.", "constraints": "제목에서 '돌아오세요'라는 진부한 표현 대신 호기심을 자극하세요."},
                    "result": {"format": "휴면 고객 복귀 이메일", "example": ""}
                }
            },
            {
                "name": "Upsell/Cross-sell Offer",
                "data": {
                    "persona": {"profile": "세일즈 전략가", "intent": "고객 생애 가치(LTV) 증대"},
                    "asset": {"knowledgeBase": "Customer Segmentation, Value Ladder", "styleGuide": "고객의 성공을 돕는 제안"},
                    "instruction": {"task": "기존 고객에게 상위 요금제(Upsell)나 관련 상품(Cross-sell)을 제안하는 이메일을 작성하세요.", "context": "무료 플랜 사용자가 한계에 도달했을 때 프리미엄 전환을 유도합니다.", "constraints": "업그레이드 시 얻을 수 있는 구체적인 이득을 비교표 등으로 제시하세요."},
                    "result": {"format": "업셀링 제안 이메일", "example": ""}
                }
            }
        ],
        "brand_storytelling": [
            {
                "name": "Founder's Letter",
                "data": {
                    "persona": {"profile": "창업자", "intent": "비전 공유 및 진정성 전달"},
                    "asset": {"knowledgeBase": "Origin Story, Vision, Mission", "styleGuide": "진솔하고 열정적인 어조"},
                    "instruction": {"task": "회사를 창업하게 된 계기와 앞으로의 비전을 담은 '창업자의 편지'를 작성하세요.", "context": "홈페이지 '회사 소개' 페이지에 들어갈 글입니다.", "constraints": "개인적인 경험에서 시작하여 보편적인 가치로 확장하세요."},
                    "result": {"format": "창업자 인사말 에세이", "example": ""}
                }
            },
            {
                "name": "About Us Page Content",
                "data": {
                    "persona": {"profile": "브랜드 에디터", "intent": "브랜드 정체성 확립"},
                    "asset": {"knowledgeBase": "Core Values, History, Culture", "styleGuide": "신뢰감 있고 매력적인 서술"},
                    "instruction": {"task": "회사의 연혁, 핵심 가치, 팀 문화를 소개하는 About Us 페이지의 콘텐츠를 구성하세요.", "context": "단순한 사실 나열이 아니라, 우리가 '누구'인지 보여주는 브랜딩 페이지가 필요합니다.", "constraints": "우리가 일하는 방식(Way of Working)을 구체적인 사례로 드세요."},
                    "result": {"format": "About Us 페이지 기획안", "example": ""}
                }
            },
            {
                "name": "Brand Manifesto",
                "data": {
                    "persona": {"profile": "CCO (최고 크리에이티브 책임자)", "intent": "내부 결속 및 외부 팬덤 형성"},
                    "asset": {"knowledgeBase": "Manifesto, Slogan, Beliefs", "styleGuide": "선언적이고 강렬한 문체"},
                    "instruction": {"task": "브랜드가 세상에 존재하는 이유와 우리가 믿는 신념을 담은 브랜드 매니페스토(Manifesto)를 작성하세요.", "context": "브랜드 리뉴얼 선포식에서 낭독할 선언문입니다.", "constraints": "짧고 리듬감 있는 문장으로 구성하여 울림을 주세요."},
                    "result": {"format": "브랜드 매니페스토", "example": ""}
                }
            }
        ],

        # --- YouTube & Video Media ---
        "short_form_scenario": [
            {
                "name": "Viral Challenge Idea",
                "data": {
                    "persona": {"profile": "틱톡 트렌드 세터", "intent": "참여형 챌린지 기획"},
                    "asset": {"knowledgeBase": "Hashtag Challenge, Duet, Trending Audio", "styleGuide": "재미있고 따라하기 쉬운"},
                    "instruction": {"task": "사용자들의 참여를 유도할 수 있는 댄스 또는 연기 챌린지 아이디어를 제안하세요.", "context": "신곡 홍보를 위해 바이럴 마케팅을 진행합니다.", "constraints": "누구나 쉽게 따라 할 수 있는 동작으로 구성하세요."},
                    "result": {"format": "챌린지 기획안", "example": ""}
                }
            },
            {
                "name": "15s Product Teaser",
                "data": {
                    "persona": {"profile": "광고 영상 감독", "intent": "짧은 시간 내에 제품 매력 발산"},
                    "asset": {"knowledgeBase": "Visual Hook, Fast Cut, Sound Design", "styleGuide": "감각적이고 임팩트 있는"},
                    "instruction": {"task": "15초짜리 인스타그램 릴스 광고를 위한 영상 시나리오를 작성하세요.", "context": "신규 립스틱 제품의 발색력을 강조하고 싶습니다.", "constraints": "초반 2초 안에 시선을 사로잡는 비주얼 훅을 넣으세요."},
                    "result": {"format": "15초 광고 시나리오", "example": ""}
                }
            },
            {
                "name": "Educational Snippet",
                "data": {
                    "persona": {"profile": "지식 크리에이터", "intent": "유용한 정보의 빠른 전달"},
                    "asset": {"knowledgeBase": "Edutainment, Text Overlay", "styleGuide": "핵심만 콕 집어주는"},
                    "instruction": {"task": "1분 이내에 생활 꿀팁 하나를 전달하는 숏폼 대본을 작성하세요.", "context": "자취생을 위한 청소 노하우를 공유합니다.", "constraints": "자막으로 들어갈 핵심 텍스트를 함께 표기하세요."},
                    "result": {"format": "정보성 숏폼 대본", "example": ""}
                }
            }
        ],
        "long_form_planning": [
            {
                "name": "Documentary Outline",
                "data": {
                    "persona": {"profile": "다큐멘터리 작가", "intent": "깊이 있는 스토리텔링"},
                    "asset": {"knowledgeBase": "Narrative Arc, Interview, B-Roll", "styleGuide": "진지하고 탐구적인"},
                    "instruction": {"task": "특정 주제를 심층적으로 다루는 10분 이상의 다큐멘터리 구성안을 작성하세요.", "context": "지역 소상공인의 성공 스토리를 취재합니다.", "constraints": "기승전결 구조를 갖추고, 인터뷰와 현장 스케치(B-Roll)를 적절히 배치하세요."},
                    "result": {"format": "다큐멘터리 구성안", "example": ""}
                }
            },
            {
                "name": "Interview Question List",
                "data": {
                    "persona": {"profile": "전문 인터뷰어", "intent": "흥미로운 이야기 이끌어내기"},
                    "asset": {"knowledgeBase": "Open-ended Questions, Follow-up", "styleGuide": "편안하지만 날카로운"},
                    "instruction": {"task": "게스트의 매력을 극대화할 수 있는 인터뷰 질문 리스트를 작성하세요.", "context": "유명 개발자를 모시고 커리어 조언을 듣는 코너입니다.", "constraints": "뻔한 질문은 피하고, 구체적인 에피소드를 묻는 질문을 포함하세요."},
                    "result": {"format": "인터뷰 질문지", "example": ""}
                }
            },
            {
                "name": "Vlog Story Arc",
                "data": {
                    "persona": {"profile": "라이프스타일 브이로거", "intent": "일상의 특별한 순간 공유"},
                    "asset": {"knowledgeBase": "Cinematic Vlog, BGM, Montage", "styleGuide": "감성적이고 자연스러운"},
                    "instruction": {"task": "평범한 하루를 특별하게 보이게 만드는 브이로그 스토리 라인을 기획하세요.", "context": "주말 여행을 다녀온 영상을 편집하려고 합니다.", "constraints": "시간 순서 나열보다는 감정의 흐름에 따라 구성하세요."},
                    "result": {"format": "브이로그 편집 구성안", "example": ""}
                }
            }
        ],
        "video_metadata": [
            {
                "name": "Clickbait Title Generator",
                "data": {
                    "persona": {"profile": "유튜브 썸네일 장인", "intent": "클릭률(CTR) 극대화"},
                    "asset": {"knowledgeBase": "Curiosity Gap, Power Words", "styleGuide": "자극적이지만 거짓말은 아닌"},
                    "instruction": {"task": "클릭을 부르는 유튜브 영상 제목 5가지를 제안하세요.", "context": "평범한 먹방 영상인데 조회수가 안 나옵니다.", "constraints": "의문문, 부정문, 숫자 등을 활용하여 호기심을 자극하세요."},
                    "result": {"format": "유튜브 제목 아이디어", "example": ""}
                }
            },
            {
                "name": "SEO Description Template",
                "data": {
                    "persona": {"profile": "비디오 SEO 전문가", "intent": "검색 상위 노출"},
                    "asset": {"knowledgeBase": "Keywords, Timestamps, Links", "styleGuide": "정보가 풍부한"},
                    "instruction": {"task": "영상 설명란(Description)에 들어갈 SEO 최적화 텍스트를 작성하세요.", "context": "IT 기기 리뷰 영상입니다.", "constraints": "타임스탬프(챕터)와 제휴 링크, 관련 태그를 포함하세요."},
                    "result": {"format": "영상 설명란 템플릿", "example": ""}
                }
            },
            {
                "name": "Thumbnail Text Ideas",
                "data": {
                    "persona": {"profile": "시각 디자이너", "intent": "한눈에 들어오는 텍스트 배치"},
                    "asset": {"knowledgeBase": "Typography, Contrast, Layout", "styleGuide": "짧고 굵은"},
                    "instruction": {"task": "썸네일 이미지에 넣을 임팩트 있는 텍스트 문구(카피)를 제안하세요.", "context": "주식 투자 실패담을 다루는 영상입니다.", "constraints": "5글자 이내의 단어로 강렬하게 표현하세요."},
                    "result": {"format": "썸네일 텍스트 아이디어", "example": ""}
                }
            }
        ],
        "storyboard": [
            {
                "name": "Cinematic Shot List",
                "data": {
                    "persona": {"profile": "촬영 감독", "intent": "영상미 넘치는 화면 구성"},
                    "asset": {"knowledgeBase": "Shot Size, Camera Angle, Movement", "styleGuide": "전문적인 촬영 용어"},
                    "instruction": {"task": "시나리오의 각 장면을 촬영하기 위한 샷 리스트(Shot List)를 작성하세요.", "context": "감성적인 뮤직비디오를 촬영합니다.", "constraints": "클로즈업, 롱샷, 달리 줌 등 다양한 기법을 활용하세요."},
                    "result": {"format": "샷 리스트 (Shot Size/Angle/Movement)", "example": ""}
                }
            },
            {
                "name": "Animation Flow",
                "data": {
                    "persona": {"profile": "모션 그래픽 디자이너", "intent": "역동적인 정보 전달"},
                    "asset": {"knowledgeBase": "Keyframe, Transition, Easing", "styleGuide": "리듬감 있는"},
                    "instruction": {"task": "로고 인트로 영상의 애니메이션 흐름을 묘사하세요.", "context": "IT 스타트업의 혁신적인 이미지를 보여줘야 합니다.", "constraints": "도형의 움직임과 속도감을 구체적으로 설명하세요."},
                    "result": {"format": "모션 그래픽 스토리보드", "example": ""}
                }
            },
            {
                "name": "Commercial Spot Script",
                "data": {
                    "persona": {"profile": "CF 감독", "intent": "30초 안에 브랜드 각인"},
                    "asset": {"knowledgeBase": "Storytelling, Brand Message", "styleGuide": "세련되고 감각적인"},
                    "instruction": {"task": "TV 또는 유튜브 프리롤 광고를 위한 30초 영상 콘티를 작성하세요.", "context": "프리미엄 커피 머신을 광고합니다.", "constraints": "시각, 청각적 요소를 모두 활용하여 고급스러움을 표현하세요."},
                    "result": {"format": "TVC 콘티", "example": ""}
                }
            }
        ],

        # --- Business General & Sales ---
        "business_email": [
            {
                "name": "Cold Email for Sales",
                "data": {
                    "persona": {"profile": "B2B 세일즈맨", "intent": "신규 영업 기회 창출"},
                    "asset": {"knowledgeBase": "Cold Calling, Value Proposition", "styleGuide": "정중하지만 자신감 있는"},
                    "instruction": {"task": "잠재 고객에게 미팅을 제안하는 콜드 이메일을 작성하세요.", "context": "우리 솔루션이 고객사의 비용을 절감해 줄 수 있음을 어필해야 합니다.", "constraints": "상대방의 시간을 존중하면서도 명확한 이점을 제시하세요."},
                    "result": {"format": "콜드 이메일 초안", "example": ""}
                }
            },
            {
                "name": "Follow-up Sequence",
                "data": {
                    "persona": {"profile": "영업 관리자", "intent": "지속적인 관계 유지"},
                    "asset": {"knowledgeBase": "Nurturing, Timing", "styleGuide": "끈기 있고 친절한"},
                    "instruction": {"task": "제안서를 보낸 후 응답이 없는 고객에게 보낼 팔로우업 이메일을 작성하세요.", "context": "일주일이 지났는데 피드백이 없습니다.", "constraints": "재촉하는 느낌을 주지 않으면서 리마인드하세요."},
                    "result": {"format": "팔로우업 이메일", "example": ""}
                }
            },
            {
                "name": "Apology Letter",
                "data": {
                    "persona": {"profile": "위기 관리 전문가", "intent": "실수로 인한 신뢰 회복"},
                    "asset": {"knowledgeBase": "Crisis Communication, Empathy", "styleGuide": "진정성 있고 책임감 있는"},
                    "instruction": {"task": "서비스 장애나 실수에 대해 고객에게 사과하는 공식 서한을 작성하세요.", "context": "서버 다운으로 인해 업무에 차질을 빚은 기업 고객들에게 보냅니다.", "constraints": "변명보다는 원인 규명과 재발 방지 대책에 집중하세요."},
                    "result": {"format": "공식 사과문", "example": ""}
                }
            }
        ],
        "docs_reports": [
            {
                "name": "Meeting Minutes",
                "data": {
                    "persona": {"profile": "꼼꼼한 서기", "intent": "회의 내용의 정확한 기록 및 공유"},
                    "asset": {"knowledgeBase": "Action Items, Agenda", "styleGuide": "객관적이고 요약된"},
                    "instruction": {"task": "회의 녹취록을 바탕으로 핵심 안건, 결정 사항, 향후 계획(Action Item)을 정리한 회의록을 작성하세요.", "context": "주간 팀 미팅 내용을 불참자에게 공유해야 합니다.", "constraints": "담당자와 마감 기한을 명시하세요."},
                    "result": {"format": "회의록 (Meeting Minutes)", "example": ""}
                }
            },
            {
                "name": "Project Proposal",
                "data": {
                    "persona": {"profile": "제안서 작성 전문가", "intent": "프로젝트 수주 및 설득"},
                    "asset": {"knowledgeBase": "Proposal Writing, Value Selling", "styleGuide": "논리적이고 설득력 있는"},
                    "instruction": {"task": "신규 프로젝트 제안서의 목차와 주요 내용을 기획하세요.", "context": "정부 지원 사업에 지원하기 위한 사업 계획서입니다.", "constraints": "사업의 필요성, 차별성, 기대 효과를 강조하세요."},
                    "result": {"format": "사업 제안서 요약", "example": ""}
                }
            },
            {
                "name": "Annual Report Structure",
                "data": {
                    "persona": {"profile": "경영 기획 담당자", "intent": "한 해의 성과 종합 및 보고"},
                    "asset": {"knowledgeBase": "Annual Report, Financial Highlights", "styleGuide": "공식적이고 품격 있는"},
                    "instruction": {"task": "연차 보고서(Annual Report)에 들어갈 주요 섹션을 구성하고, CEO 메시지 초안을 작성하세요.", "context": "주주와 이해관계자들에게 회사의 성장을 보여줘야 합니다.", "constraints": "재무적 성과와 비재무적(ESG) 성과를 균형 있게 다루세요."},
                    "result": {"format": "연차 보고서 기획안", "example": ""}
                }
            }
        ],
        "presentation_speech": [
            {
                "name": "Elevator Pitch",
                "data": {
                    "persona": {"profile": "스타트업 창업가", "intent": "짧은 시간 내에 투자자 설득"},
                    "asset": {"knowledgeBase": "Elevator Pitch, Hook", "styleGuide": "강렬하고 기억에 남는"},
                    "instruction": {"task": "1분 안에 우리 사업의 핵심을 전달하는 엘리베이터 피치 스크립트를 작성하세요.", "context": "우연히 만난 투자자에게 자신을 어필해야 합니다.", "constraints": "문제(Problem)와 해결책(Solution)을 명확히 제시하세요."},
                    "result": {"format": "1분 피치 스크립트", "example": ""}
                }
            },
            {
                "name": "Keynote Opening",
                "data": {
                    "persona": {"profile": "컨퍼런스 연사", "intent": "청중의 주의 집중"},
                    "asset": {"knowledgeBase": "Public Speaking, Storytelling", "styleGuide": "카리스마 있는"},
                    "instruction": {"task": "대형 컨퍼런스 기조연설(Keynote)의 오프닝 멘트를 작성하세요.", "context": "미래 기술 트렌드에 대해 발표합니다.", "constraints": "충격적인 통계나 개인적인 일화로 시작하여 관심을 끄세요."},
                    "result": {"format": "기조연설 오프닝 스크립트", "example": ""}
                }
            },
            {
                "name": "Investor Deck Script",
                "data": {
                    "persona": {"profile": "IR 담당자", "intent": "투자 유치 성공"},
                    "asset": {"knowledgeBase": "Pitch Deck, Valuation", "styleGuide": "신뢰감 있는"},
                    "instruction": {"task": "투자 유치 제안서(Pitch Deck)의 각 슬라이드별 발표 대본을 작성하세요.", "context": "시리즈 A 투자를 받기 위한 IR 피칭입니다.", "constraints": "시장 규모(TAM/SAM/SOM)와 성장 지표(Traction)를 강조하세요."},
                    "result": {"format": "IR 피칭 대본", "example": ""}
                }
            }
        ],
        "negotiation_comm": [
            {
                "name": "Price Negotiation Script",
                "data": {
                    "persona": {"profile": "구매 협상가", "intent": "최적의 가격으로 계약 체결"},
                    "asset": {"knowledgeBase": "BATNA, ZOPA", "styleGuide": "단호하지만 예의 바른"},
                    "instruction": {"task": "공급 업체와의 단가 협상을 위한 시나리오를 작성하세요.", "context": "예산이 삭감되어 공급가를 10% 낮춰야 합니다.", "constraints": "장기 계약이나 물량 증대 같은 반대 급부를 제안하세요."},
                    "result": {"format": "가격 협상 시나리오", "example": ""}
                }
            },
            {
                "name": "Partnership Proposal",
                "data": {
                    "persona": {"profile": "제휴 담당자", "intent": "상호 이익이 되는 파트너십 구축"},
                    "asset": {"knowledgeBase": "Strategic Alliance, Synergy", "styleGuide": "협력적인"},
                    "instruction": {"task": "타 기업에게 전략적 제휴를 제안하는 이메일이나 문서를 작성하세요.", "context": "우리 서비스와 시너지가 날 것 같은 플랫폼 기업에 연락합니다.", "constraints": "상대방이 얻을 수 있는 이익을 먼저 언급하세요."},
                    "result": {"format": "제휴 제안서 초안", "example": ""}
                }
            },
            {
                "name": "Conflict Resolution",
                "data": {
                    "persona": {"profile": "중재자", "intent": "갈등 해소 및 합의 도출"},
                    "asset": {"knowledgeBase": "Mediation, Active Listening", "styleGuide": "중립적이고 객관적인"},
                    "instruction": {"task": "팀 간의 갈등 상황을 해결하기 위한 중재 회의 시나리오를 작성하세요.", "context": "개발팀과 영업팀이 일정 문제로 다투고 있습니다.", "constraints": "각자의 입장을 충분히 듣고, 공통의 목표를 상기시키세요."},
                    "result": {"format": "갈등 중재 시나리오", "example": ""}
                }
            }
        ],

        # --- HR & Org Culture ---
        "recruiting": [
            {
                "name": "Attractive Job Description",
                "data": {
                    "persona": {"profile": "채용 브랜딩 전문가", "intent": "우수 인재 지원 유도"},
                    "asset": {"knowledgeBase": "EVP, Job Description", "styleGuide": "매력적이고 상세한"},
                    "instruction": {"task": "단순한 요건 나열이 아닌, 지원하고 싶게 만드는 직무 기술서(JD)를 작성하세요.", "context": "유능한 시니어 개발자를 채용해야 합니다.", "constraints": "팀의 기술 문화와 성장 가능성을 구체적으로 묘사하세요."},
                    "result": {"format": "채용 공고 (JD)", "example": ""}
                }
            },
            {
                "name": "Interview Scorecard",
                "data": {
                    "persona": {"profile": "면접관", "intent": "객관적이고 공정한 평가"},
                    "asset": {"knowledgeBase": "Structured Interview, Competency", "styleGuide": "평가 기준 중심"},
                    "instruction": {"task": "면접관들이 공통된 기준으로 후보자를 평가할 수 있는 면접 평가표(Scorecard)를 만드세요.", "context": "면접관의 주관적 느낌에 의존하는 채용을 개선하고 싶습니다.", "constraints": "직무 역량과 컬처 핏(Culture Fit) 항목을 구분하세요."},
                    "result": {"format": "면접 평가표 양식", "example": ""}
                }
            },
            {
                "name": "Rejection Email",
                "data": {
                    "persona": {"profile": "채용 담당자", "intent": "좋은 지원자 경험 유지"},
                    "asset": {"knowledgeBase": "Candidate Experience, Empathy", "styleGuide": "정중하고 따뜻한"},
                    "instruction": {"task": "불합격한 지원자에게 보낼 정중한 거절 이메일을 작성하세요.", "context": "면접까지 봤지만 아쉽게 탈락한 후보자입니다.", "constraints": "지원해 주셔서 감사하다는 마음을 진정성 있게 전하세요."},
                    "result": {"format": "불합격 통보 이메일", "example": ""}
                }
            }
        ],
        "onboarding_edu": [
            {
                "name": "First Week Checklist",
                "data": {
                    "persona": {"profile": "온보딩 매니저", "intent": "신규 입사자의 빠른 적응"},
                    "asset": {"knowledgeBase": "Onboarding, Checklist", "styleGuide": "친절하고 꼼꼼한"},
                    "instruction": {"task": "입사 첫 주에 신규 입사자가 수행해야 할 체크리스트를 작성하세요.", "context": "입사자가 무엇을 해야 할지 몰라 방황하지 않게 해야 합니다.", "constraints": "계정 설정, 팀원 미팅, 문서 숙지 등을 일자별로 정리하세요."},
                    "result": {"format": "입사 1주차 체크리스트", "example": ""}
                }
            },
            {
                "name": "Training Module Outline",
                "data": {
                    "persona": {"profile": "사내 강사", "intent": "직무 역량 강화"},
                    "asset": {"knowledgeBase": "Curriculum Design, Learning Objective", "styleGuide": "체계적인"},
                    "instruction": {"task": "신입 사원을 위한 직무 교육 커리큘럼을 설계하세요.", "context": "영업팀 신입 사원에게 세일즈 스킬을 가르쳐야 합니다.", "constraints": "이론 교육과 실습(Role Play)을 적절히 배분하세요."},
                    "result": {"format": "교육 커리큘럼 기획안", "example": ""}
                }
            },
            {
                "name": "Company Culture Guide",
                "data": {
                    "persona": {"profile": "컬처 덱 디자이너", "intent": "조직 문화 전파"},
                    "asset": {"knowledgeBase": "Culture Deck, Core Values", "styleGuide": "영감을 주는"},
                    "instruction": {"task": "우리 회사의 일하는 방식과 문화를 설명하는 컬처 가이드북의 목차를 구성하세요.", "context": "회사가 급성장하면서 기존의 문화가 희석되고 있습니다.", "constraints": "구체적인 행동 강령(Do & Don't)을 포함하세요."},
                    "result": {"format": "컬처 가이드북 목차", "example": ""}
                }
            }
        ],
        "evaluation_feedback": [
            {
                "name": "360 Degree Feedback",
                "data": {
                    "persona": {"profile": "인사 평가 담당자", "intent": "다면적인 성과 진단"},
                    "asset": {"knowledgeBase": "360 Feedback, Peer Review", "styleGuide": "건설적인"},
                    "instruction": {"task": "동료 평가(Peer Review)를 위한 설문 문항을 작성하세요.", "context": "상사의 평가뿐만 아니라 동료들의 피드백을 종합하여 평가합니다.", "constraints": "협업 태도, 커뮤니케이션 능력 등을 묻는 질문을 포함하세요."},
                    "result": {"format": "동료 평가 설문지", "example": ""}
                }
            },
            {
                "name": "Performance Improvement Plan",
                "data": {
                    "persona": {"profile": "HR 매니저", "intent": "저성과자의 성과 개선"},
                    "asset": {"knowledgeBase": "PIP, Goal Setting", "styleGuide": "명확하고 엄격한"},
                    "instruction": {"task": "성과가 저조한 직원을 위한 성과 향상 계획(PIP) 문서를 작성하세요.", "context": "해고 전 마지막으로 개선의 기회를 주는 절차입니다.", "constraints": "구체적인 개선 목표와 달성 기한, 지원 사항을 명시하세요."},
                    "result": {"format": "PIP 계획서 양식", "example": ""}
                }
            },
            {
                "name": "Promotion Justification",
                "data": {
                    "persona": {"profile": "팀장", "intent": "팀원의 승진 추천"},
                    "asset": {"knowledgeBase": "Performance Review, Leadership", "styleGuide": "설득력 있는"},
                    "instruction": {"task": "팀원을 승진시키기 위해 인사위원회에 제출할 추천서를 작성하세요.", "context": "탁월한 성과를 낸 팀원을 매니저로 승진시키고 싶습니다.", "constraints": "정량적인 성과와 리더십 역량을 구체적인 사례로 증명하세요."},
                    "result": {"format": "승진 추천서", "example": ""}
                }
            }
        ],

        # --- Customer Experience & Support (CS/CX) ---
        "customer_support": [
            {
                "name": "Refund Policy Explanation",
                "data": {
                    "persona": {"profile": "CS 팀장", "intent": "규정에 따른 명확한 안내"},
                    "asset": {"knowledgeBase": "Terms of Service, Refund Policy", "styleGuide": "단호하지만 정중한"},
                    "instruction": {"task": "환불 규정에 대해 문의한 고객에게 답변 메일을 작성하세요.", "context": "단순 변심으로 인한 환불은 불가함을 안내해야 합니다.", "constraints": "규정을 근거로 들되, 고객의 기분을 상하게 하지 않도록 완곡하게 표현하세요."},
                    "result": {"format": "환불 규정 안내 메일", "example": ""}
                }
            },
            {
                "name": "Angry Customer De-escalation",
                "data": {
                    "persona": {"profile": "불만 고객 전담 상담사", "intent": "고객의 화를 가라앉히고 문제 해결"},
                    "asset": {"knowledgeBase": "Empathy, Active Listening, Apology", "styleGuide": "공감하고 경청하는"},
                    "instruction": {"task": "서비스 불만으로 화가 난 고객을 진정시키기 위한 응대 스크립트를 작성하세요.", "context": "전화 연결이 안 되어 폭발한 고객입니다.", "constraints": "변명하지 말고 우선 사과한 뒤, 해결 의지를 보여주세요."},
                    "result": {"format": "불만 고객 응대 스크립트", "example": ""}
                }
            },
            {
                "name": "Feature Request Response",
                "data": {
                    "persona": {"profile": "프로덕트 매니저", "intent": "고객 피드백 관리"},
                    "asset": {"knowledgeBase": "Roadmap, Prioritization", "styleGuide": "감사하고 긍정적인"},
                    "instruction": {"task": "기능 추가를 요청한 고객에게 답변을 보내세요.", "context": "당장은 개발 계획이 없지만, 추후 고려해보겠다는 내용을 전달해야 합니다.", "constraints": "소중한 의견에 감사함을 표하고, 피드백이 어떻게 활용되는지 설명하세요."},
                    "result": {"format": "기능 요청 답변 메일", "example": ""}
                }
            }
        ],
        "chatbot_scenario": [
            {
                "name": "Order Status Inquiry",
                "data": {
                    "persona": {"profile": "챗봇 기획자", "intent": "단순 문의 자동화"},
                    "asset": {"knowledgeBase": "Flowchart, Decision Tree", "styleGuide": "간결하고 직관적인"},
                    "instruction": {"task": "배송 조회를 원하는 고객을 위한 챗봇 대화 흐름을 설계하세요.", "context": "주문 번호를 입력받아 배송 상태를 알려줘야 합니다.", "constraints": "조회 실패 시 상담원 연결 옵션을 제공하세요."},
                    "result": {"format": "배송 조회 챗봇 시나리오", "example": ""}
                }
            },
            {
                "name": "Product Recommendation Bot",
                "data": {
                    "persona": {"profile": "퍼스널 쇼퍼 봇", "intent": "맞춤형 상품 추천"},
                    "asset": {"knowledgeBase": "Quiz, Recommendation Logic", "styleGuide": "친근하고 센스 있는"},
                    "instruction": {"task": "고객의 취향을 파악하여 상품을 추천해 주는 퀴즈 형태의 챗봇 시나리오를 기획하세요.", "context": "피부 타입을 물어보고 적합한 화장품을 추천합니다.", "constraints": "3~4개의 질문으로 범위를 좁혀가세요."},
                    "result": {"format": "상품 추천 챗봇 시나리오", "example": ""}
                }
            },
            {
                "name": "Troubleshooting Wizard",
                "data": {
                    "persona": {"profile": "기술 지원 봇", "intent": "단계별 문제 해결"},
                    "asset": {"knowledgeBase": "Troubleshooting Tree, FAQ", "styleGuide": "논리적인"},
                    "instruction": {"task": "기기 작동 오류를 해결해 주는 단계별 가이드 챗봇을 설계하세요.", "context": "전원이 켜지지 않는 문제에 대한 해결책을 제시합니다.", "constraints": "사용자가 '예/아니오'로 대답하며 원인을 찾을 수 있게 하세요."},
                    "result": {"format": "트러블슈팅 챗봇 시나리오", "example": ""}
                }
            }
        ],
        "survey": [
            {
                "name": "NPS Survey Email",
                "data": {
                    "persona": {"profile": "CX 매니저", "intent": "고객 충성도 측정"},
                    "asset": {"knowledgeBase": "NPS, Likert Scale", "styleGuide": "부담 없는"},
                    "instruction": {"task": "순 추천 지수(NPS)를 측정하기 위한 설문 요청 이메일을 작성하세요.", "context": "서비스 이용 경험이 어땠는지 묻고 싶습니다.", "constraints": "질문은 하나로 단순화하고, 0~10점 척도를 사용하세요."},
                    "result": {"format": "NPS 설문 이메일", "example": ""}
                }
            },
            {
                "name": "Product Feedback Form",
                "data": {
                    "persona": {"profile": "프로덕트 리서처", "intent": "구체적인 제품 개선 의견 수집"},
                    "asset": {"knowledgeBase": "User Feedback, Survey Design", "styleGuide": "상세한"},
                    "instruction": {"task": "특정 기능에 대한 만족도와 개선 의견을 묻는 설문지를 작성하세요.", "context": "새로 출시한 기능을 사용해 본 고객에게 피드백을 받습니다.", "constraints": "객관식과 주관식 문항을 적절히 섞으세요."},
                    "result": {"format": "제품 피드백 설문지", "example": ""}
                }
            },
            {
                "name": "Exit Survey",
                "data": {
                    "persona": {"profile": "이탈 분석가", "intent": "탈퇴 원인 파악"},
                    "asset": {"knowledgeBase": "Churn Analysis, Exit Interview", "styleGuide": "아쉽지만 존중하는"},
                    "instruction": {"task": "서비스를 탈퇴하는 사용자에게 이유를 묻는 설문 문항을 작성하세요.", "context": "탈퇴 과정에서 마지막으로 의견을 듣고 싶습니다.", "constraints": "너무 많은 질문으로 탈퇴를 방해하지 않도록 주의하세요."},
                    "result": {"format": "탈퇴 설문지", "example": ""}
                }
            }
        ],
    }

    with Session(engine) as session:
        # Get all categories
        categories = session.exec(select(Category)).all()
        cat_map = {cat.value: cat.id for cat in categories}
        
        total_inserted = 0
        
        for cat_key, templates in specialized_templates.items():
            if cat_key not in cat_map:
                print(f"Skipping {cat_key}: Category not found")
                continue
                
            cat_id = cat_map[cat_key]
            
            for tmpl in templates:
                # Create JSON content
                content_json = create_structure(
                    tmpl["data"].get("persona"),
                    tmpl["data"].get("asset"),
                    tmpl["data"].get("instruction"),
                    tmpl["data"].get("result")
                )
                
                # Check if template with this name already exists to avoid duplicates
                existing = session.exec(
                    select(PromptTemplate)
                    .where(PromptTemplate.category_id == cat_id)
                    .where(PromptTemplate.name == tmpl["name"])
                ).first()
                
                if existing:
                    print(f"Template '{tmpl['name']}' already exists for {cat_key}. Skipping.")
                    continue
                
                # Insert new template
                new_template = PromptTemplate(
                    category_id=cat_id,
                    mode=PromptMode.ASSISTANCE,
                    content=content_json,
                    is_default=False, # Specialized templates are not default
                    name=tmpl["name"]
                )
                session.add(new_template)
                total_inserted += 1
                print(f"Added '{tmpl['name']}' to {cat_key}")
        
        session.commit()
        print(f"Successfully inserted {total_inserted} specialized templates.")

if __name__ == "__main__":
    insert_specialized_templates()
