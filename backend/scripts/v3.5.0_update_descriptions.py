from sqlmodel import Session, select
from database import engine
from models import PromptTemplate

# Data Migration Script for v3.5.0
# Usage: python backend/scripts/v3.5.0_update_descriptions.py

def get_description_by_keyword(name):
    n = name.lower()
    
    # Specific Overrides (Korean)
    if "swot" in n: return "강점, 약점, 기회, 위협 요소를 분석하여 전략적 인사이트를 도출합니다."
    if "lean canvas" in n or "린 캔버스" in n: return "스타트업의 비즈니스 모델을 한 장의 캔버스로 신속하게 구조화합니다."
    if "persona" in n or "페르소나" in n: return "타겟 사용자의 특성과 니즈를 정의하여 가상의 인물을 설정합니다."
    if "journey map" in n or "여정" in n: return "사용자의 서비스 이용 경험을 단계별로 시각화하여 분석합니다."
    
    # Tech / Dev
    if any(k in n for k in ["sql", "query", "database", "schema"]): return "효율적인 데이터베이스 쿼리 및 구조를 설계합니다."
    if any(k in n for k in ["api", "endpoint", "rest", "graphql", "json"]): return "API 인터페이스 및 데이터 통신 규격을 정의합니다."
    if any(k in n for k in ["test", "testing", "qa", "bug", "e2e", "unit"]): return "소프트웨어 품질 보증을 위한 테스트 시나리오 및 리포트를 작성합니다."
    if any(k in n for k in ["git", "commit", "ci/cd", "pipeline", "deploy"]): return "개발 워크플로우 및 배포 파이프라인을 최적화합니다."
    if any(k in n for k in ["code", "refactor", "function", "component", "react", "state", "handling"]): return "고품질 코드 작성 및 리팩토링을 위한 가이드를 제공합니다."
    if any(k in n for k in ["architecture", "diagram", "system", "infra", "terraform", "cloud"]): return "시스템 아키텍처 및 인프라 구성을 설계합니다."
    
    # Design / UX
    if any(k in n for k in ["design", "ui", "ux", "wireframe", "layout", "visual", "screen", "interface"]): return "사용자 경험과 인터페이스 디자인을 위한 상세 가이드를 제공합니다."
    if any(k in n for k in ["color", "palette", "typography", "icon", "style", "font"]): return "시각적 일관성을 위한 디자인 시스템 및 스타일 가이드를 정의합니다."
    if any(k in n for k in ["usability", "heuristic", "interaction", "onboarding"]): return "사용 편의성 및 인터랙션 품질을 향상시킵니다."
    
    # Marketing / Content
    if any(k in n for k in ["marketing", "viral", "sns", "instagram", "facebook", "twitter", "linkedin", "social"]): return "소셜 미디어 바이럴 및 마케팅 효과를 극대화하는 콘텐츠를 기획합니다."
    if any(k in n for k in ["blog", "post", "article", "writing", "copy", "text", "description", "title", "subject"]): return "독자의 흥미를 유발하는 매력적인 카피와 콘텐츠를 작성합니다."
    if any(k in n for k in ["email", "letter", "message", "newsletter", "outreach"]): return "목적에 맞는 효과적인 이메일 및 메시지 커뮤니케이션을 지원합니다."
    if any(k in n for k in ["video", "script", "youtube", "vlog", "storyboard", "scene"]): return "영상 콘텐츠 제작을 위한 시나리오 및 스토리보드를 구성합니다."
    
    # Business
    if any(k in n for k in ["business", "strategy", "model", "profit", "revenue", "market", "competitor"]): return "비즈니스 전략 수립 및 시장 분석을 통해 경쟁력을 강화합니다."
    if any(k in n for k in ["proposal", "deck", "slide", "pitch", "presentation", "report", "summary"]): return "설득력 있는 제안서 및 보고서 작성을 지원합니다."
    if any(k in n for k in ["meeting", "minutes", "agenda", "communication"]): return "효율적인 회의 운영 및 커뮤니케이션을 돕습니다."
    if any(k in n for k in ["startup", "founder", "investor", "investment"]): return "스타트업 성장 및 투자 유치를 위한 전략을 수립합니다."
    
    # HR / Org
    if any(k in n for k in ["interview", "recruit", "job", "hiring", "salary", "negotiation"]): return "채용 프로세스 최적화 및 인재 영입 전략을 수립합니다."
    if any(k in n for k in ["culture", "feedback", "evaluation", "performance", "onboarding"]): return "조직 문화 발전 및 구성원 성과 관리를 지원합니다."
    
    # CS
    if any(k in n for k in ["customer", "support", "cs", "cx", "refund", "inquiry", "response"]): return "고객 만족도를 높이는 응대 스크립트 및 가이드를 제공합니다."
    
    # General Analysis/Idea
    if any(k in n for k in ["analyze", "analysis", "review", "audit", "diagnosis"]): return "데이터 및 현상을 심층 분석하여 개선점을 도출합니다."
    if any(k in n for k in ["idea", "brainstorm", "concept", "creative", "thinking"]): return "창의적인 아이디어 발상 및 새로운 컨셉 도출을 돕습니다."
    if any(k in n for k in ["troubleshoot", "problem", "solution", "resolve"]): return "문제를 진단하고 효과적인 해결책을 제시합니다."
    
    # Modifiers (General fallback based on Korean keywords)
    if "표준" in n or "standard" in n: return "해당 업무의 표준 가이드를 제공합니다."
    if "핵심" in n or "core" in n: return "핵심 요소를 정의하고 구체화합니다."
    if "단계별" in n or "step" in n: return "단계별 실행 절차를 상세히 안내합니다."
    if "창의적" in n or "creative" in n: return "창의적이고 혁신적인 접근 방식을 제안합니다."
    
    return "전문적인 프롬프트 템플릿입니다."

def update_all_descriptions():
    print("Starting v3.5.0 Data Migration: Template Descriptions...")
    with Session(engine) as session:
        templates = session.exec(select(PromptTemplate)).all()
        count = 0
        updated_count = 0
        
        for template in templates:
            count += 1
            if not template.description:
                desc = get_description_by_keyword(template.name)
                template.description = desc
                session.add(template)
                updated_count += 1
                if updated_count % 10 == 0:
                    print(f"Updated {updated_count}: {template.name} -> {desc}")
        
        session.commit()
        print(f"Migration Complete. Processed {count} templates. Updated {updated_count} descriptions.")

if __name__ == "__main__":
    update_all_descriptions()
