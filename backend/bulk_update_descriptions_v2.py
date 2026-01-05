from sqlmodel import Session, select
from database import engine
from models import PromptTemplate

# Mapping: Name -> Description
DESCRIPTION_MAP = {
    # Business & Strategy
    "SWOT Analysis Strategy": "강점, 약점, 기회, 위협 요소를 분석하여 전략적 인사이트를 도출합니다.",
    "Value Proposition Canvas": "고객의 니즈와 제품의 가치를 매핑하여 시장 적합성을 분석합니다.",
    "Lean Canvas": "스타트업의 비즈니스 모델을 한 장의 캔버스로 신속하게 구조화합니다.",
    "Project Proposal": "프로젝트의 목적, 범위, 일정, 예산을 포함한 설득력 있는 제안서를 작성합니다.",
    "Meeting Minutes": "회의의 안건, 논의 내용, 결정 사항, 액션 아이템을 요약 정리합니다.",
    "Business Model Canvas": "비즈니스의 9가지 핵심 요소를 분석하여 수익 모델과 가치 제안을 정의합니다.",
    "Annual Report Structure": "연간 성과, 재무 현황, 미래 전략을 포함한 연차 보고서 구조를 설계합니다.",
    "Strategic Feedback Analysis": "피드백 데이터를 분석하여 전략적 개선점과 실행 계획을 도출합니다.",
    "Pitch Deck Outline": "투자 유치를 위한 효과적인 피치덱 구성과 핵심 메시지를 개발합니다.",

    # Design & UX
    "Iconography Guidelines": "아이콘의 형태, 사이즈, 사용 규칙을 정의하여 시각적 일관성을 확보합니다.",
    "Color Palette Generator": "브랜드 아이덴티티에 맞는 조화로운 컬러 팔레트와 계층 구조를 생성합니다.",
    "Mobile Bottom Navigation": "모바일 앱의 하단 네비게이션 구조와 탭 구성을 최적화합니다.",
    "User Onboarding Flow": "신규 사용자의 서비스 적응을 돕는 단계별 온보딩 경험을 설계합니다.",
    "UI/UX Interaction Spec": "개발자 핸드오프를 위한 상세한 인터랙션 동작과 피드백 명세서를 작성합니다.",
    "User Interview Guide": "사용자 심층 인터뷰를 위한 질문 리스트와 시나리오를 체계적으로 구성합니다.",
    "Design System Token": "일관된 디자인을 위한 컬러, 타이포그래피 등 디자인 토큰 시스템을 구축합니다.",
    "Wireframe Feedback": "와이어프레임 단계에서 UI/UX의 사용성, 흐름, 구조적 문제를 분석합니다.",
    "Heuristic Evaluation": "사용성 원칙(Heuristics)을 기반으로 인터페이스의 잠재적인 문제를 평가합니다.",

    # Marketing & Content
    "Product Detail Page Copy": "구매 전환율을 높이기 위한 매력적인 상품 상세 페이지 문구를 작성합니다.",
    "High Open Rate Email Subject": "클릭을 유도하는 매력적인 이메일 제목과 프리헤더를 작성합니다.",
    "B2B Whitepaper Outline": "전문적인 B2B 리드 생성을 위한 백서(Whitepaper)의 목차와 핵심 내용을 구성합니다.",
    "Customer Success Case Study": "고객의 성공 사례를 스토리텔링 형식으로 구성하여 신뢰도를 높입니다.",
    "Weekly Newsletter Plan": "정기 뉴스레터의 주제 선정부터 섹션 구성까지 주간 발행 계획을 수립합니다.",
    "App Store Description": "앱 스토어 최적화(ASO)를 고려한 매력적인 앱 소개 및 홍보 문구를 작성합니다.",
    "Viral Twitter Thread": "SNS에서 바이럴될 수 있는 훅(Hook)과 스토리텔링 구조의 스레드를 작성합니다.",
    "Influencer Collaboration Brief": "인플루언서 협업을 위한 캠페인 목표, 가이드라인, 혜택을 명확히 정의합니다.",
    "Press Release": "신규 서비스 런칭이나 주요 성과를 언론에 효과적으로 알리기 위한 보도자료를 작성합니다.",

    # Development
    "API Requirement Spec": "API 엔드포인트, 요청/응답 스키마, 에러 코드를 상세히 정의합니다.",
    "GraphQL Schema Design": "효율적인 데이터 쿼리를 위한 GraphQL 타입과 리졸버 스키마를 설계합니다.",
    "React Component Structure": "재사용성과 유지보수성을 고려한 React 컴포넌트 구조를 설계합니다.",
    "Terraform Infrastructure": "IaC(Infrastructure as Code)를 위한 Terraform 리소스 구성을 정의합니다.",
    "CI/CD Pipeline": "안정적인 배포를 위한 지속적 통합 및 배포 파이프라인을 설계합니다.",
    "Code Refactoring Expert": "기존 코드의 가독성과 성능을 개선하기 위한 전문적인 리팩토링 가이드를 제공합니다.",
    "E2E Test Scenario": "사용자 관점의 주요 워크플로우를 검증하기 위한 종단간 테스트 시나리오를 설계합니다.",
    "Bug Report Template": "버그 재현 단계, 예상 결과, 실제 결과를 포함한 체계적인 버그 리포트를 작성합니다.",
    "System Architecture Diagram": "시스템의 컴포넌트, 데이터 흐름, 인프라 구조를 시각화하기 위한 다이어그램을 설계합니다.",

    # HR & Culture
    "Attractive Job Description": "지원자의 관심을 끄는 직무 소개와 기업 문화를 매력적으로 기술한 JD를 작성합니다.",
    "Interview Scorecard": "면접관이 일관된 기준으로 평가할 수 있는 역량 기반 면접 평가표를 구성합니다.",
    "Company Culture Guide": "신규 입사자가 조직 문화를 빠르게 이해할 수 있는 컬처덱/가이드를 작성합니다.",
    "360 Degree Feedback": "다면 평가를 위한 질문 문항과 평가 가이드를 구성합니다.",

    # Customer Support (CS/CX)
    "Angry Customer De-escalation": "불만 고객의 감정을 완화하고 문제를 해결하기 위한 공감 기반의 응대 스크립트를 작성합니다.",
    "Refund Policy Explanation": "환불 규정을 고객이 이해하기 쉽고 명확하게 전달하는 안내문을 작성합니다.",
    "Troubleshooting Wizard": "고객이 스스로 문제를 진단하고 해결할 수 있는 단계별 트러블슈팅 가이드를 만듭니다.",

    # Misc
    "PRD Requirement Spec": "제품의 기능 요구사항을 상세히 정의하고, 이해관계자들을 위한 기획 문서를 작성합니다.",
    "Executive Summary Slide": "의사결정권자를 위한 핵심 성과와 인사이트를 담은 임원 보고용 슬라이드를 구성합니다.",
    "Assistance Template": "단계별 AI 가이드를 통해 완성도 높은 결과를 생성합니다.",
    "Default Template": "해당 카테고리의 기본 템플릿입니다."
}

def update_descriptions_v2():
    with Session(engine) as session:
        templates = session.exec(select(PromptTemplate)).all()
        count = 0
        for template in templates:
            # Update only if description is empty or we want to force update (let's force update for consistency)
            
            # Direct match
            if template.name in DESCRIPTION_MAP:
                template.description = DESCRIPTION_MAP[template.name]
                session.add(template)
                count += 1
                continue
            
            # Keyword matching for generic images
            if "미니어처" in template.name or "Lego" in template.name or "Isometric" in template.name or "포토북" in template.name or "3D" in template.name:
                template.description = "고품질 이미지 생성을 위한 상세 프롬프트입니다."
                session.add(template)
                count += 1
                continue
                
        session.commit()
        print(f"Successfully updateddescriptions for {count} templates.")

if __name__ == "__main__":
    update_descriptions_v2()
