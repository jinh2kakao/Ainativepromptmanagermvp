#!/usr/bin/env python3
"""
Migration script to update category values from English to Korean
to match frontend jobCategories.ts
"""

import sys
sys.path.insert(0, '/Users/jinh/Ainativepromptmanagermvp/backend')

from sqlmodel import Session, select
from database import engine
from models import Category

# Mapping from current English values to Korean values (from jobCategories.ts)
VALUE_MAPPING = {
    # Parent categories
    'service_product_planning': '서비스 & 프로덕트 기획',
    'ui_ux_design': 'UI/UX & 크리에이티브 디자인',
    'development_engineering': '소프트웨어 개발 & 엔지니어링',
    'data_ai': '데이터 분석 & AI',
    'marketing_growth': '마케팅 & 그로스',
    'youtube_media': '유튜브 & 영상 미디어',
    'business_sales': '비즈니스 일반 & 영업',
    'hr_culture': '인사 & 조직문화',
    'cs_cx': '고객 경험 & 지원 (CS/CX)',
    
    # Service & Product Planning subcategories
    'business_model': '비즈니스 모델(BM) 수립',
    'ux_research': '사용자 리서치(UX Research)',
    'feature_spec': '기능 명세 및 정책',
    'functional_spec': '기능 명세 및 정책',  # Alternative name
    'screen_design': '화면 설계(IA)',
    'ia_design': '화면 설계(IA)',  # Alternative name
    'pm_po': '프로젝트 관리(PM/PO)',
    'project_management': '프로젝트 관리(PM/PO)',  # Alternative name
    
    # UI/UX Design subcategories
    'ui_structure': 'UI 구조 및 레이아웃',
    'design_system': '디자인 시스템',
    'ux_writing': 'UX 라이팅',
    'graphic_branding': '그래픽 & 브랜딩',
    'design_review': '디자인 리뷰',
    'design_creative': 'UI/UX & 크리에이티브 디자인',  # Alternative name for parent
    
    # Development subcategories
    'frontend': '프론트엔드 개발',
    'frontend_dev': '프론트엔드 개발',  # Alternative name
    'backend_api': '백엔드 & API',
    'code_quality': '코드 품질 & 리팩토링',
    'devops': '데브옵스 & 인프라',
    'devops_infra': '데브옵스 & 인프라',  # Alternative name
    'qa_testing': 'QA & 테스팅',
    'tech_docs': '기술 문서',
    
    # Data & AI subcategories
    'sql': '데이터 쿼리(SQL)',
    'data_query': '데이터 쿼리(SQL)',  # Alternative name
    'data_viz': '데이터 시각화',
    'data_visualization': '데이터 시각화',  # Alternative name
    'data_analysis': '데이터 분석 보고',
    'ai_modeling': 'AI 모델링',
    
    # Marketing subcategories
    'copywriting': '카피라이팅(Ads)',
    'content_marketing': '콘텐츠 마케팅',
    'sns': '소셜 미디어(SNS)',
    'social_media': '소셜 미디어(SNS)',  # Alternative name
    'crm_email': 'CRM & 이메일',
    'brand_story': '브랜드 스토리텔링',
    'brand_storytelling': '브랜드 스토리텔링',  # Alternative name
    
    # YouTube subcategories
    'short_form_scenario': '숏폼 시나리오',
    'long_form_planning': '롱폼 영상 기획',
    'video_metadata': '영상 메타데이터',
    'storyboard': '스토리보드 묘사',
    
    # Business subcategories
    'business_email': '비즈니스 이메일',
    'docs_reports': '문서 및 보고서',
    'presentation_speech': '발표 및 스피치',
    'negotiation_comm': '협상 및 커뮤니케이션',
    
    # HR subcategories
    'recruiting': '채용(Recruiting)',
    'onboarding': '온보딩 & 교육',
    'onboarding_edu': '온보딩 & 교육',  # Alternative name
    'feedback': '평가 & 피드백',
    'evaluation_feedback': '평가 & 피드백',  # Alternative name
    
    # CS/CX subcategories
    'customer_service': '고객 응대',
    'customer_support': '고객 응대',  # Alternative name
    'chatbot': '챗봇 시나리오',
    'chatbot_scenario': '챗봇 시나리오',  # Alternative name
    'survey': '설문조사',
}

def main():
    with Session(engine) as session:
        print("=== Updating Category Values ===\n")
        
        # Get all categories
        categories = session.exec(select(Category)).all()
        
        updated_count = 0
        not_found = []
        
        for category in categories:
            old_value = category.value
            
            if old_value in VALUE_MAPPING:
                new_value = VALUE_MAPPING[old_value]
                category.value = new_value
                session.add(category)
                updated_count += 1
                print(f"✓ Updated: '{old_value}' -> '{new_value}'")
            else:
                not_found.append(old_value)
        
        # Commit changes
        session.commit()
        
        print(f"\n=== Summary ===")
        print(f"Total categories: {len(categories)}")
        print(f"Updated: {updated_count}")
        
        if not_found:
            print(f"\nWarning: {len(not_found)} categories not found in mapping:")
            for val in not_found:
                print(f"  - '{val}'")
        
        print("\n✅ Migration completed successfully!")

if __name__ == "__main__":
    main()
