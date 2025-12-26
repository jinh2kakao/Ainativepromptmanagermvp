import sys
import os
import json
import uuid
from sqlmodel import Session, select
from sqlalchemy import text

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import engine
from models import Category, PromptTemplate, PromptMode

def create_template_json(persona, asset, instruction, result):
    groups = []
    
    # Persona
    persona_items = []
    for k, v in persona.items():
        persona_items.append({"label": k.capitalize(), "value": v})
    if persona_items:
        groups.append({"groupName": "Persona", "items": persona_items})

    # Asset
    asset_items = []
    for k, v in asset.items():
        asset_items.append({"label": k.replace("knowledgeBase", "Knowledge Base").replace("styleGuide", "Style Guide").capitalize(), "value": v})
    if asset_items:
        groups.append({"groupName": "Asset", "items": asset_items})

    # Instruction
    instruction_items = []
    for k, v in instruction.items():
        instruction_items.append({"label": k.capitalize(), "value": v})
    if instruction_items:
        groups.append({"groupName": "Instruction", "items": instruction_items})

    # Result
    result_items = []
    for k, v in result.items():
        result_items.append({"label": k.capitalize(), "value": v})
    if result_items:
        groups.append({"groupName": "Result", "items": result_items})

    return json.dumps(groups, ensure_ascii=False)

# Data for additional templates
# Format: "subcategory_value": [ { "title": "...", "persona": {...}, "asset": {...}, "instruction": {...}, "result": {...} }, ... ]
additional_templates = {
    # --- Service & Product Planning ---
    "business_model": [
        {
            "title": "린 캔버스(Lean Canvas) 작성기",
            "persona": {"Profile": "스타트업 비즈니스 컨설턴트", "Intent": "초기 아이디어의 사업성을 검증하기 위한 린 캔버스 작성"},
            "asset": {"Knowledge Base": "린 스타트업 방법론, 비즈니스 모델 캔버스 이론", "Style Guide": "핵심만 간결하게, 투자자에게 어필할 수 있는 설득력 있는 어조"},
            "instruction": {"Task": "제공된 아이디어를 바탕으로 9가지 구성 요소(문제, 솔루션, 가치 제안 등)를 포함한 린 캔버스를 작성하세요.", "Context": "초기 단계 스타트업이 IR 자료나 내부 검토용으로 사용할 예정입니다.", "Constraints": "각 항목은 3문장 이내로 요약하세요."},
            "result": {"Format": "Markdown 표 또는 리스트 형식", "Example": ""}
        },
        {
            "title": "SWOT 분석 및 전략 도출",
            "persona": {"Profile": "전략 기획 전문가", "Intent": "비즈니스 환경 분석 및 대응 전략 수립"},
            "asset": {"Knowledge Base": "SWOT 분석 프레임워크, 경쟁 전략 이론", "Style Guide": "객관적이고 분석적인 톤앤매너"},
            "instruction": {"Task": "대상 기업/서비스의 강점, 약점, 기회, 위협을 분석하고, 이를 바탕으로 SO, ST, WO, WT 전략을 도출하세요.", "Context": "신규 시장 진입 또는 서비스 리뉴얼을 앞두고 있습니다.", "Constraints": "구체적인 근거를 제시하세요."},
            "result": {"Format": "SWOT 매트릭스 및 전략 리스트", "Example": ""}
        }
    ],
    "service_planning": [
        {
            "title": "유저 스토리(User Story) 생성기",
            "persona": {"Profile": "Agile Product Owner", "Intent": "개발 팀이 이해할 수 있는 명확한 유저 스토리 작성"},
            "asset": {"Knowledge Base": "Agile 방법론, INVEST 원칙", "Style Guide": "명확하고 간결한 문장"},
            "instruction": {"Task": "기능 요구사항을 'As a [User], I want to [Action], so that [Benefit]' 형식의 유저 스토리로 변환하고, 인수 조건(Acceptance Criteria)을 포함하세요.", "Context": "스프린트 백로그 작성을 위해 필요합니다.", "Constraints": "모호한 표현을 피하고 구체적으로 작성하세요."},
            "result": {"Format": "유저 스토리 리스트 (Markdown)", "Example": ""}
        },
        {
            "title": "서비스 정책 정의서 초안",
            "persona": {"Profile": "서비스 기획자", "Intent": "서비스 운영 및 사용에 필요한 정책 정의"},
            "asset": {"Knowledge Base": "일반적인 서비스 이용 약관, 개인정보 처리 방침, 운영 정책 사례", "Style Guide": "법적 효력을 고려한 명확하고 보수적인 표현"},
            "instruction": {"Task": "특정 기능(예: 회원가입, 결제, 환불)에 대한 서비스 정책 초안을 작성하세요. 예외 상황에 대한 처리 방침도 포함해야 합니다.", "Context": "개발 및 운영 팀과 공유할 정책 문서입니다.", "Constraints": "논리적 허점이 없도록 꼼꼼하게 작성하세요."},
            "result": {"Format": "정책 문서 (번호 매기기)", "Example": ""}
        }
    ],
    "ux_research": [
        {
            "title": "심층 인터뷰(ID I) 질문지 설계",
            "persona": {"Profile": "UX 리서처", "Intent": "사용자의 잠재된 니즈와 행동 동기를 파악하기 위한 인터뷰 질문 설계"},
            "asset": {"Knowledge Base": "정성적 리서치 방법론, 더블 다이아몬드 프로세스", "Style Guide": "공감적이고 개방적인 질문 화법"},
            "instruction": {"Task": "리서치 목표에 맞춰 아이스브레이킹, 도입, 본론, 마무리 단계별 인터뷰 질문을 작성하세요. 꼬리물기 질문(Probing) 예시도 포함하세요.", "Context": "특정 타겟 유저를 대상으로 1:1 인터뷰를 진행할 예정입니다.", "Constraints": "유도신문(Leading Question)을 피하세요."},
            "result": {"Format": "인터뷰 가이드 (스크립트 형식)", "Example": ""}
        },
        {
            "title": "사용성 테스트(UT) 시나리오",
            "persona": {"Profile": "UX 리서처", "Intent": "서비스 사용성 검증을 위한 테스트 시나리오 작성"},
            "asset": {"Knowledge Base": "사용성 테스트 원칙, 태스크 기반 평가 방법", "Style Guide": "지시적이지 않고 상황을 부여하는 방식"},
            "instruction": {"Task": "사용자가 서비스의 핵심 기능을 자연스럽게 경험할 수 있도록 태스크(Task)와 시나리오를 작성하세요. 각 태스크별 성공 기준을 명시하세요.", "Context": "프로토타입 또는 베타 버전을 검증하는 단계입니다.", "Constraints": "구체적인 버튼 위치나 조작 방법을 직접 알려주지 마세요."},
            "result": {"Format": "태스크 리스트 및 시나리오 설명", "Example": ""}
        }
    ],
    # --- Design ---
    "ui_ux_design": [
        {
            "title": "디자인 시스템 컴포넌트 명세",
            "persona": {"Profile": "UI 디자이너", "Intent": "개발자와의 협업을 위한 컴포넌트 상세 명세 작성"},
            "asset": {"Knowledge Base": "Material Design, Human Interface Guidelines, Atomic Design", "Style Guide": "기술적이고 정확한 용어 사용"},
            "instruction": {"Task": "특정 UI 컴포넌트(예: 버튼, 카드, 모달)의 상태(Default, Hover, Active, Disabled)별 스타일, 인터랙션, 접근성 가이드를 작성하세요.", "Context": "디자인 시스템 문서화 작업 중입니다.", "Constraints": "CSS 속성이나 토큰 이름을 활용하면 좋습니다."},
            "result": {"Format": "컴포넌트 명세서 (표 또는 리스트)", "Example": ""}
        },
        {
            "title": "UI 카피라이팅 개선",
            "persona": {"Profile": "UX 라이터", "Intent": "사용자 경험을 향상시키는 명확하고 친절한 UI 텍스트 작성"},
            "asset": {"Knowledge Base": "UX 라이팅 가이드라인, 마이크로카피 사례", "Style Guide": "간결함, 명확함, 일관성, 인간적인 톤"},
            "instruction": {"Task": "현재의 딱딱하거나 모호한 UI 텍스트(에러 메시지, 안내 문구, 버튼 라벨)를 더 사용자 친화적으로 개선하세요.", "Context": "사용자가 혼란을 겪거나 이탈하는 지점의 텍스트를 수정하고 있습니다.", "Constraints": "브랜드 보이스를 유지하세요."},
            "result": {"Format": "Before & After 비교표", "Example": ""}
        }
    ],
    # --- Development ---
    "frontend_dev": [
        {
            "title": "React 컴포넌트 생성기",
            "persona": {"Profile": "Senior Frontend Developer", "Intent": "재사용 가능하고 성능이 최적화된 React 컴포넌트 코드 작성"},
            "asset": {"Knowledge Base": "React Best Practices, Hooks, TypeScript, Tailwind CSS", "Style Guide": "Clean Code, Functional Programming"},
            "instruction": {"Task": "요구사항에 맞는 React 컴포넌트를 작성하세요. Props 타입 정의, 에러 처리, 로딩 상태 등을 포함해야 합니다.", "Context": "Next.js 프로젝트에서 사용될 컴포넌트입니다.", "Constraints": "불필요한 리렌더링을 방지하고, 접근성을 고려하세요."},
            "result": {"Format": "TypeScript 코드 블록", "Example": ""}
        },
        {
            "title": "API 연동 로직 작성",
            "persona": {"Profile": "Frontend Developer", "Intent": "백엔드 API와 통신하는 효율적인 데이터 페칭 로직 구현"},
            "asset": {"Knowledge Base": "REST API, Axios/Fetch, React Query(TanStack Query)", "Style Guide": "비동기 처리, 에러 핸들링 표준 준수"},
            "instruction": {"Task": "특정 API 엔드포인트를 호출하여 데이터를 가져오고, 상태(Loading, Error, Success)를 관리하는 커스텀 훅을 작성하세요.", "Context": "데이터 캐싱 및 자동 갱신이 필요할 수 있습니다.", "Constraints": "타입 안정성을 보장하세요."},
            "result": {"Format": "TypeScript 코드 블록 (Custom Hook)", "Example": ""}
        }
    ],
    "backend_dev": [
        {
            "title": "REST API 엔드포인트 설계",
            "persona": {"Profile": "Backend Developer", "Intent": "RESTful 원칙을 준수하는 API 설계 및 구현"},
            "asset": {"Knowledge Base": "REST API Design Guide, HTTP Status Codes, OpenAPI (Swagger)", "Style Guide": "표준화된 응답 포맷, 명확한 리소스 명명"},
            "instruction": {"Task": "특정 기능에 대한 API 엔드포인트(Method, Path), 요청 파라미터, 응답 바디, 에러 코드를 설계하고 구현 코드를 작성하세요.", "Context": "FastAPI 또는 Node.js 환경을 가정합니다.", "Constraints": "보안 및 유효성 검사를 포함하세요."},
            "result": {"Format": "API 명세 및 코드 블록", "Example": ""}
        },
        {
            "title": "SQL 쿼리 최적화",
            "persona": {"Profile": "Database Administrator", "Intent": "데이터베이스 성능 향상을 위한 쿼리 튜닝"},
            "asset": {"Knowledge Base": "SQL Indexing, Execution Plan, Normalization", "Style Guide": "효율적이고 가독성 높은 SQL"},
            "instruction": {"Task": "주어진 비효율적인 쿼리를 분석하고, 인덱스를 활용하거나 구조를 변경하여 성능을 최적화한 쿼리를 제안하세요.", "Context": "대용량 테이블을 조회하는 상황입니다.", "Constraints": "실행 계획을 고려하여 설명하세요."},
            "result": {"Format": "최적화된 SQL 및 설명", "Example": ""}
        }
    ],
    # --- Marketing ---
    "content_marketing": [
        {
            "title": "블로그 포스트 SEO 최적화",
            "persona": {"Profile": "SEO Specialist & Content Marketer", "Intent": "검색 엔진 상위 노출을 위한 블로그 콘텐츠 작성"},
            "asset": {"Knowledge Base": "SEO 가이드라인, 키워드 리서치, 독자 체류 시간 증대 전략", "Style Guide": "정보성, 전문성, 가독성 높은 문체"},
            "instruction": {"Task": "타겟 키워드를 자연스럽게 포함하여 블로그 포스트의 제목, 메타 디스크립션, 본문 구조(H1, H2, H3)를 작성하세요.", "Context": "오가닉 트래픽 유입을 늘리기 위한 콘텐츠입니다.", "Constraints": "키워드 스터핑(과도한 반복)을 피하세요."},
            "result": {"Format": "블로그 포스트 초안 (Markdown)", "Example": ""}
        },
        {
            "title": "소셜 미디어 바이럴 콘텐츠 기획",
            "persona": {"Profile": "SNS 마케터", "Intent": "높은 참여(좋아요, 공유)를 유도하는 SNS 콘텐츠 기획"},
            "asset": {"Knowledge Base": "플랫폼별(인스타, 링크드인 등) 알고리즘 특성, 바이럴 트렌드", "Style Guide": "트렌디하고 감성적인, 또는 유머러스한 톤"},
            "instruction": {"Task": "특정 주제나 제품에 대해 카드뉴스 또는 숏폼 영상의 기획안(카피, 이미지 컨셉)을 작성하세요.", "Context": "브랜드 인지도를 높이고 팬덤을 형성하는 것이 목표입니다.", "Constraints": "첫 3초 안에 시선을 끌 수 있는 요소를 포함하세요."},
            "result": {"Format": "콘텐츠 기획안 (슬라이드별 구성)", "Example": ""}
        }
    ]
}

def seed_additional_templates():
    with Session(engine) as session:
        print("Starting to seed additional templates...")
        
        # Get all categories to map values to IDs
        categories = session.exec(select(Category)).all()
        cat_map = {c.value: c.id for c in categories}
        
        count = 0
        
        for cat_value, templates in additional_templates.items():
            cat_id = cat_map.get(cat_value)
            if not cat_id:
                print(f"Warning: Category '{cat_value}' not found in database. Skipping.")
                continue
            
            for tpl_data in templates:
                # Check if template with this title already exists
                existing = session.exec(
                    select(PromptTemplate).where(
                        PromptTemplate.category_id == cat_id,
                        PromptTemplate.title == tpl_data["title"],
                        PromptTemplate.mode == PromptMode.ASSISTANCE
                    )
                ).first()
                
                content_json = create_template_json(
                    tpl_data["persona"],
                    tpl_data["asset"],
                    tpl_data["instruction"],
                    tpl_data["result"]
                )
                
                if existing:
                    print(f"Updating template: {tpl_data['title']} ({cat_value})")
                    existing.content = content_json
                    existing.is_default = True
                    session.add(existing)
                else:
                    print(f"Creating template: {tpl_data['title']} ({cat_value})")
                    new_template = PromptTemplate(
                        category_id=cat_id,
                        mode=PromptMode.ASSISTANCE,
                        title=tpl_data["title"],
                        name=tpl_data["title"], # Use title as name as well
                        content=content_json,
                        is_default=True
                    )
                    session.add(new_template)
                count += 1
        
        session.commit()
        print(f"Successfully seeded/updated {count} additional templates.")

if __name__ == "__main__":
    seed_additional_templates()
