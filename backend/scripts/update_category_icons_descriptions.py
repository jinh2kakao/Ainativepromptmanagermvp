"""
카테고리 대분류에 아이콘과 설명 일괄 업데이트 스크립트
브랜딩 전문가 & UX 카피라이팅 기반 작성

실행: python scripts/update_category_icons_descriptions.py
"""

import sys
import os
from sqlmodel import Session, select

# Add the parent directory to sys.path to allow importing from backend
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import engine
from models import Category

# 대분류 카테고리별 아이콘 및 설명 정의 (Lucide React 아이콘 사용)
CATEGORY_BRANDING = {
    "service_product_planning": {
        "icon": "Lightbulb",
        "description": "아이디어를 실현 가능한 제품으로 설계하세요. 비즈니스 모델부터 기능 명세까지, 서비스 기획의 모든 단계를 지원합니다."
    },
    "design_creative": {
        "icon": "Palette",
        "description": "사용자 경험을 시각적으로 완성하세요. UI 설계부터 브랜드 아이덴티티까지, 창의적 디자인 작업을 도와드립니다."
    },
    "development_engineering": {
        "icon": "Code2",
        "description": "코드로 아이디어에 생명을 불어넣으세요. 프론트엔드, 백엔드, 인프라까지 개발 전 과정을 아우릅니다."
    },
    "data_ai": {
        "icon": "BarChart3",
        "description": "데이터에서 인사이트를 발견하세요. SQL 쿼리부터 AI 모델링까지, 데이터 기반 의사결정을 지원합니다."
    },
    "marketing_growth": {
        "icon": "Megaphone",
        "description": "브랜드의 목소리를 세상에 전하세요. 퍼포먼스 마케팅부터 브랜드 스토리텔링까지 성장 전략을 함께합니다."
    },
    "youtube_media": {
        "icon": "Video",
        "description": "영상으로 스토리를 전달하세요. 숏폼부터 롱폼까지, 콘텐츠 기획과 제작의 모든 과정을 지원합니다."
    },
    "business_sales": {
        "icon": "Briefcase",
        "description": "비즈니스 커뮤니케이션을 더 효과적으로. 이메일, 보고서, 프레젠테이션의 품질을 높여드립니다."
    },
    "hr_culture": {
        "icon": "Users",
        "description": "최고의 팀을 만들어가세요. 채용부터 온보딩, 평가까지 인사 업무 전반을 도와드립니다."
    },
    "cs_cx": {
        "icon": "HeartHandshake",
        "description": "고객의 마음을 사로잡으세요. 응대 품질 향상부터 CX 전략까지, 고객 경험을 혁신합니다."
    },
}


def update_category_icons_and_descriptions():
    """대분류 카테고리에 아이콘과 설명 업데이트"""
    
    with Session(engine) as session:
        # parent_id가 None인 대분류 카테고리만 조회
        parent_categories = session.exec(
            select(Category).where(Category.parent_id == None)
        ).all()
        
        print(f"Found {len(parent_categories)} parent categories")
        
        updated_count = 0
        for category in parent_categories:
            if category.value in CATEGORY_BRANDING:
                branding = CATEGORY_BRANDING[category.value]
                
                category.icon = branding["icon"]
                category.description = branding["description"]
                
                session.add(category)
                updated_count += 1
                print(f"✅ Updated: {category.name}")
                print(f"   Icon: {branding['icon']}")
                print(f"   Description: {branding['description'][:50]}...")
            else:
                print(f"⚠️  No branding data for: {category.name} ({category.value})")
        
        session.commit()
        print(f"\n🎉 Successfully updated {updated_count} categories!")


if __name__ == "__main__":
    update_category_icons_and_descriptions()
