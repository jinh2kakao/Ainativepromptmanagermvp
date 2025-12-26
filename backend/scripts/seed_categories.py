import sys
import os
import uuid
from sqlmodel import Session, select

# Add the parent directory to sys.path to allow importing from backend
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import engine, create_db_and_tables
from models import Category

def seed_categories():
    categories_data = [
        {
            "name": "서비스 & 프로덕트 기획",
            "value": "service_product_planning",
            "children": [
                {"name": "비즈니스 모델(BM) 수립", "value": "business_model"},
                {"name": "사용자 리서치(UX Research)", "value": "ux_research"},
                {"name": "기능 명세 및 정책", "value": "functional_spec"},
                {"name": "화면 설계(IA)", "value": "ia_design"},
                {"name": "프로젝트 관리(PM/PO)", "value": "project_management"},
            ]
        },
        {
            "name": "UI/UX & 크리에이티브 디자인",
            "value": "design_creative",
            "children": [
                {"name": "UI 구조 및 레이아웃", "value": "ui_structure"},
                {"name": "디자인 시스템", "value": "design_system"},
                {"name": "UX 라이팅", "value": "ux_writing"},
                {"name": "그래픽 & 브랜딩", "value": "graphic_branding"},
                {"name": "디자인 리뷰", "value": "design_review"},
            ]
        },
        {
            "name": "소프트웨어 개발 & 엔지니어링",
            "value": "development_engineering",
            "children": [
                {"name": "프론트엔드 개발", "value": "frontend_dev"},
                {"name": "백엔드 & API", "value": "backend_api"},
                {"name": "코드 품질 & 리팩토링", "value": "code_quality"},
                {"name": "데브옵스 & 인프라", "value": "devops_infra"},
                {"name": "QA & 테스팅", "value": "qa_testing"},
                {"name": "기술 문서", "value": "tech_docs"},
            ]
        },
        {
            "name": "데이터 분석 & AI",
            "value": "data_ai",
            "children": [
                {"name": "데이터 쿼리(SQL)", "value": "data_query"},
                {"name": "데이터 시각화", "value": "data_visualization"},
                {"name": "데이터 분석 보고", "value": "data_analysis"},
                {"name": "AI 모델링", "value": "ai_modeling"},
            ]
        },
        {
            "name": "마케팅 & 그로스",
            "value": "marketing_growth",
            "children": [
                {"name": "카피라이팅(Ads)", "value": "copywriting"},
                {"name": "콘텐츠 마케팅", "value": "content_marketing"},
                {"name": "소셜 미디어(SNS)", "value": "social_media"},
                {"name": "CRM & 이메일", "value": "crm_email"},
                {"name": "브랜드 스토리텔링", "value": "brand_storytelling"},
            ]
        },
        {
            "name": "유튜브 & 영상 미디어",
            "value": "youtube_media",
            "children": [
                {"name": "숏폼 시나리오", "value": "short_form_scenario"},
                {"name": "롱폼 영상 기획", "value": "long_form_planning"},
                {"name": "영상 메타데이터", "value": "video_metadata"},
                {"name": "스토리보드 묘사", "value": "storyboard"},
            ]
        },
        {
            "name": "비즈니스 일반 & 영업",
            "value": "business_sales",
            "children": [
                {"name": "비즈니스 이메일", "value": "business_email"},
                {"name": "문서 및 보고서", "value": "docs_reports"},
                {"name": "발표 및 스피치", "value": "presentation_speech"},
                {"name": "협상 및 커뮤니케이션", "value": "negotiation_comm"},
            ]
        },
        {
            "name": "인사 & 조직문화",
            "value": "hr_culture",
            "children": [
                {"name": "채용(Recruiting)", "value": "recruiting"},
                {"name": "온보딩 & 교육", "value": "onboarding_edu"},
                {"name": "평가 & 피드백", "value": "evaluation_feedback"},
            ]
        },
        {
            "name": "고객 경험 & 지원 (CS/CX)",
            "value": "cs_cx",
            "children": [
                {"name": "고객 응대", "value": "customer_support"},
                {"name": "챗봇 시나리오", "value": "chatbot_scenario"},
                {"name": "설문조사", "value": "survey"},
            ]
        },
    ]

    with Session(engine) as session:
        # Clear existing categories
        existing_categories = session.exec(select(Category)).all()
        if existing_categories:
            print(f"Deleting {len(existing_categories)} existing categories...")
            for cat in existing_categories:
                session.delete(cat)
            session.commit()

        for i, cat_data in enumerate(categories_data):
            parent_cat = Category(
                name=cat_data["name"],
                value=cat_data["value"],
                order=i
            )
            session.add(parent_cat)
            session.commit()
            session.refresh(parent_cat)
            
            print(f"Added parent category: {parent_cat.name}")

            for j, child_data in enumerate(cat_data["children"]):
                child_cat = Category(
                    name=child_data["name"],
                    value=child_data["value"],
                    parent_id=parent_cat.id,
                    order=j
                )
                session.add(child_cat)
            
            session.commit()
            print(f"Added {len(cat_data['children'])} subcategories for {parent_cat.name}")

if __name__ == "__main__":
    seed_categories()
