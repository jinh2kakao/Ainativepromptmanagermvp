import sys
import os
import json
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

# Data for additional templates (Part 2)
additional_templates = {
    # --- Video & Content ---
    "video_scenario": [
        {
            "title": "유튜브 숏폼 시나리오 (1분)",
            "persona": {"Profile": "유튜브 크리에이터", "Intent": "시청 지속 시간을 극대화하는 숏폼 영상 시나리오 작성"},
            "asset": {"Knowledge Base": "숏폼 트렌드, 후킹 기법, 스토리텔링 구조", "Style Guide": "빠른 호흡, 구어체, 임팩트 있는 대사"},
            "instruction": {"Task": "주제에 맞는 1분 이내의 숏폼 시나리오를 작성하세요. 도입부(Hook), 전개(Body), 결말(CTA) 구조를 따르세요.", "Context": "틱톡, 릴스, 쇼츠 업로드용입니다.", "Constraints": "첫 3초에 시선을 끄는 시각적/청각적 요소를 명시하세요."},
            "result": {"Format": "타임라인별 스크립트 (00:00 ~ 00:03 등)", "Example": ""}
        },
        {
            "title": "제품 리뷰 영상 대본",
            "persona": {"Profile": "테크 유튜버", "Intent": "제품의 장단점을 솔직하고 매력적으로 전달하는 리뷰 대본 작성"},
            "asset": {"Knowledge Base": "제품 스펙 시트, 경쟁 제품 정보", "Style Guide": "신뢰감 있는, 전문적인, 그러나 친근한 어조"},
            "instruction": {"Task": "제품 언박싱부터 주요 기능 시연, 총평까지 이어지는 리뷰 대본을 작성하세요.", "Context": "구매를 고민하는 시청자에게 정보를 제공합니다.", "Constraints": "장점뿐만 아니라 아쉬운 점도 1~2개 포함하여 신뢰도를 높이세요."},
            "result": {"Format": "영상 구성안 (인트로-본론-아웃트로)", "Example": ""}
        }
    ],
    "storyboard": [
        {
            "title": "광고 영상 스토리보드",
            "persona": {"Profile": "영상 감독 (CF Director)", "Intent": "클라이언트를 설득할 수 있는 시각적인 스토리보드 텍스트 묘사"},
            "asset": {"Knowledge Base": "영상 문법, 카메라 앵글 용어(Full Shot, Close Up 등)", "Style Guide": "감각적이고 구체적인 묘사"},
            "instruction": {"Task": "광고 컨셉에 맞는 씬(Scene)별 화면 구성(Video)과 오디오(Audio)를 작성하세요.", "Context": "15초 또는 30초 TVC/디지털 광고입니다.", "Constraints": "각 씬의 카메라 무빙과 BGM 분위기를 포함하세요."},
            "result": {"Format": "표 형식 (Scene No. | Video | Audio | Time)", "Example": ""}
        }
    ],
    # --- Business & Sales ---
    "sales_strategy": [
        {
            "title": "콜드 메일(Cold Email) 작성",
            "persona": {"Profile": "B2B 세일즈 매니저", "Intent": "잠재 고객의 회신을 유도하는 제안 메일 작성"},
            "asset": {"Knowledge Base": "콜드 메일 성공 사례, 설득의 심리학", "Style Guide": "정중하지만 자신감 있는, 상대방 중심의 화법"},
            "instruction": {"Task": "잠재 고객에게 우리 솔루션을 소개하고 미팅을 제안하는 이메일을 작성하세요.", "Context": "상대방은 바쁜 의사결정권자입니다.", "Constraints": "제목은 클릭율을 높이도록 작성하고, 본문은 모바일에서도 읽기 편하게 짧게 쓰세요."},
            "result": {"Format": "이메일 제목 및 본문", "Example": ""}
        },
        {
            "title": "고객 페르소나 정의",
            "persona": {"Profile": "마케팅 전략가", "Intent": "타겟 고객을 명확히 정의하여 마케팅 효율 증대"},
            "asset": {"Knowledge Base": "시장 세분화 이론, 고객 여정 지도", "Style Guide": "구체적이고 생생한 인물 묘사"},
            "instruction": {"Task": "우리 제품의 핵심 타겟 고객을 가상의 인물(페르소나)로 정의하세요. 인구통계학적 특성, 관심사, 고충(Pain Point), 목표를 포함하세요.", "Context": "마케팅 캠페인 기획의 기초 자료로 활용됩니다.", "Constraints": ""},
            "result": {"Format": "페르소나 프로필 카드 형식", "Example": ""}
        }
    ],
    "cs_response": [
        {
            "title": "불만 고객 응대 스크립트",
            "persona": {"Profile": "CS 팀장", "Intent": "고객의 불만을 해소하고 신뢰를 회복하는 답변 작성"},
            "asset": {"Knowledge Base": "CS 매뉴얼, 쿠션어 사용법, 보상 규정", "Style Guide": "공감하는, 사과하는, 해결책을 제시하는"},
            "instruction": {"Task": "배송 지연이나 제품 불량으로 화난 고객에게 보낼 사과 및 보상 안내 메시지를 작성하세요.", "Context": "고객이 매우 감정적인 상태입니다.", "Constraints": "변명보다는 인정과 해결책 제시에 집중하세요."},
            "result": {"Format": "채팅 상담 또는 이메일 답변 스크립트", "Example": ""}
        }
    ],
    # --- HR & General ---
    "hr_interview": [
        {
            "title": "채용 공고(JD) 작성",
            "persona": {"Profile": "채용 담당자 (Recruiter)", "Intent": "우수한 인재를 유인하는 매력적인 채용 공고 작성"},
            "asset": {"Knowledge Base": "직무 기술서(JD) 표준, 채용 브랜딩", "Style Guide": "회사의 문화를 반영한, 명확하고 매력적인"},
            "instruction": {"Task": "특정 포지션의 주요 업무, 자격 요건, 우대 사항, 혜택 및 복지를 포함한 채용 공고를 작성하세요.", "Context": "채용 플랫폼(원티드, 링크드인 등)에 게시할 예정입니다.", "Constraints": "지원자의 성장을 강조하세요."},
            "result": {"Format": "채용 공고문", "Example": ""}
        },
        {
            "title": "면접 질문 리스트",
            "persona": {"Profile": "면접관", "Intent": "지원자의 역량과 문화 적합성을 검증하는 질문 준비"},
            "asset": {"Knowledge Base": "역량 면접(BEI) 기법, STAR 기법", "Style Guide": "구체적인 경험을 묻는 질문"},
            "instruction": {"Task": "지원자의 직무 역량과 협업 태도를 평가할 수 있는 면접 질문 10가지를 작성하세요.", "Context": "실무 면접 또는 컬처핏 면접입니다.", "Constraints": "단답형 질문을 피하고 경험을 묻는 질문 위주로 구성하세요."},
            "result": {"Format": "질문 리스트 및 평가 의도", "Example": ""}
        }
    ]
}

def seed_additional_templates_part2():
    with Session(engine) as session:
        print("Starting to seed additional templates (Part 2)...")
        
        categories = session.exec(select(Category)).all()
        cat_map = {c.value: c.id for c in categories}
        
        count = 0
        
        for cat_value, templates in additional_templates.items():
            cat_id = cat_map.get(cat_value)
            if not cat_id:
                print(f"Warning: Category '{cat_value}' not found in database. Skipping.")
                continue
            
            for tpl_data in templates:
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
                        name=tpl_data["title"],
                        content=content_json,
                        is_default=True
                    )
                    session.add(new_template)
                count += 1
        
        session.commit()
        print(f"Successfully seeded/updated {count} additional templates (Part 2).")

if __name__ == "__main__":
    seed_additional_templates_part2()
