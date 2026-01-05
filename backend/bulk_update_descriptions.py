from sqlmodel import Session, select
from database import engine
from models import PromptTemplate

UPDATES = {
    "PRD Requirement Spec": "제품의 기능 요구사항을 상세히 정의하고, 이해관계자들을 위한 기획 문서를 작성합니다.",
    "User Interview Guide": "사용자 심층 인터뷰를 위한 질문 리스트와 시나리오를 체계적으로 구성합니다.",
    "Business Model Canvas": "비즈니스의 9가지 핵심 요소를 분석하여 수익 모델과 가치 제안을 정의합니다.",
    "Design System Token": "일관된 디자인을 위한 컬러, 타이포그래피 등 디자인 토큰 시스템을 구축합니다.",
    "Code Refactoring Expert": "기존 코드의 가독성과 성능을 개선하기 위한 전문적인 리팩토링 가이드를 제공합니다.",
    "App Store Description": "앱 스토어 최적화(ASO)를 고려한 매력적인 앱 소개 및 홍보 문구를 작성합니다.",
    "UI/UX Interaction Spec": "개발자 핸드오프를 위한 상세한 인터랙션 동작과 피드백 명세서를 작성합니다.",
    "Executive Summary Slide": "의사결정권자를 위한 핵심 성과와 인사이트를 담은 임원 보고용 슬라이드를 구성합니다."
}

def update_descriptions():
    with Session(engine) as session:
        templates = session.exec(select(PromptTemplate)).all()
        count = 0
        for template in templates:
            if template.name in UPDATES:
                template.description = UPDATES[template.name]
                session.add(template)
                count += 1
                print(f"Updated description for: {template.name}")
        
        session.commit()
        print(f"Successfully updated/verified {count} templates.")

if __name__ == "__main__":
    update_descriptions()
