import sys
import os
import uuid
from datetime import datetime

# Add backend directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlmodel import Session, select
from database import engine
from models import User, Notice, FAQ, UserRole, UserType

def populate_content():
    print("Starting content population...")
    
    with Session(engine) as session:
        # 1. Find or Create Admin User
        statement = select(User).where(User.role == UserRole.ADMIN)
        admin = session.exec(statement).first()
        
        if not admin:
            print("No Admin found. Creating one...")
            admin = User(
                email="admin@example.com",
                role=UserRole.ADMIN,
                user_type=UserType.PRO,
                is_active=True
            )
            session.add(admin)
            session.commit()
            session.refresh(admin)
            print(f"Created Admin: {admin.id}")
        else:
            print(f"Using existing Admin: {admin.id}")

        # 2. Create Initial Notice
        notice_title = "[업데이트] v3.3.0 커뮤니티 기능 & 에이전트 최적화 업데이트"
        notice_content = """안녕하세요, AI Native Prompt Manager 팀입니다.
v3.3.0 업데이트와 함께 그동안의 주요 변경 사항을 안내해 드립니다.

## 🚀 주요 업데이트

### 1. AI 최적화 엔진 업그레이드
- **Gemini 1.5 Flash 도입**: 더 빠르고 효율적인 최적화 엔진으로 교체되었습니다.
- **MIPROv2 전략**: 프롬프트 튜닝 품질이 대폭 향상되었습니다.
- **AI 에이전트 추천**: 프롬프트 특성에 가장 적합한 모델(GPT-4o, Claude 3.5 등)을 자동으로 추천합니다.

### 2. 프로젝트 및 템플릿 고도화
- **전문 템플릿 확장**: 개발, 마케팅, 기획 등 직무별 9종의 전문 템플릿이 추가되었습니다.
- **프로젝트 플로우**: 노드와 연결선(Edge)을 자유롭게 구성하고 저장할 수 있습니다.

### 3. 시스템 안정성 및 보안
- **Gmail 연동**: 인증 메일 발송 속도와 안정성이 크게 개선되었습니다.
- **HTTPS 보안**: 모든 통신 구간에 암호화가 적용되었습니다.

### 4. 커뮤니티 기능 신설 (New)
- **공지사항**: 업데이트 소식을 가장 먼저 확인하세요.
- **FAQ**: 서비스 이용 중 궁금한 점을 빠르게 해결하세요.
- **1:1 문의**: 해결되지 않는 문제는 언제든 문의를 남겨주세요.

앞으로도 더 좋은 서비스를 위해 노력하겠습니다.
감사합니다."""
        
        # Check uniqueness
        stmt = select(Notice).where(Notice.title == notice_title)
        existing_notice = session.exec(stmt).first()
        
        if not existing_notice:
            notice = Notice(
                title=notice_title,
                content=notice_content,
                is_published=True,
                is_pinned=True,
                author_id=admin.id,
                created_at=datetime.utcnow()
            )
            session.add(notice)
            print("Added Notice.")
        else:
            print("Notice already exists. Skipping.")

        # 3. Create FAQS
        faqs = [
            {
                "category": "기능",
                "question": "AI 프롬프트 최적화는 어떻게 동작하나요?",
                "answer": "Google의 Gemini 1.5 Flash 모델과 DSPy 기반의 MIPROv2 전략을 사용하여, 입력하신 프롬프트 구조와 내용을 분석하고 최적의 결과를 내도록 자동으로 튜닝합니다.",
                "display_order": 1
            },
            {
                "category": "기능",
                "question": "'적합한 AI 에이전트'는 무엇인가요?",
                "answer": "프롬프트의 난이도와 구조를 분석하여 해당 프롬프트를 가장 잘 수행할 수 있는 AI 모델(예: Claude 3.5 Sonnet, GPT-4o 등)을 추천해주는 기능입니다. 최적화 후 결과 모달에서 확인하실 수 있습니다.",
                "display_order": 2
            },
            {
                "category": "계정/결제",
                "question": "Guest 모드와 회원가입의 차이는 무엇인가요?",
                "answer": "Guest 모드는 로그인 없이 10개까지 프롬프트를 체험할 수 있습니다. 회원가입(Free) 시 50개까지 생성 가능하며, Guest 시절 데이터가 자동으로 계정에 연동됩니다.",
                "display_order": 3
            },
            {
                "category": "계정/결제",
                "question": "무료 버전의 제한사항은 무엇인가요?",
                "answer": "Free 플랜은 프롬프트 생성이 50개로 제한됩니다. 무제한 생성과 고급 기능을 원하시면 Pro 플랜으로 업그레이드해주세요.",
                "display_order": 4
            },
            {
                "category": "프로젝트",
                "question": "템플릿은 어떻게 사용하나요?",
                "answer": "프롬프트 생성 시 '지원 모드(Assistance Mode)'를 선택하고 원하시는 직무(Category)를 고르면, 해당 직무에 최적화된 전문 템플릿 구조가 자동으로 적용됩니다.",
                "display_order": 5
            },
               {
                "category": "프로젝트",
                "question": "프로젝트 흐름도를 저장할 수 있나요?",
                "answer": "네, 프로젝트 상세 페이지에서 노드(단계)와 엣지(연결)를 자유롭게 추가/삭제할 수 있으며, 모든 변경 사항은 데이터베이스에 자동으로 저장되어 언제든 다시 불러올 수 있습니다.",
                "display_order": 6
            }
        ]

        for item in faqs:
            stmt = select(FAQ).where(FAQ.question == item["question"])
            existing_faq = session.exec(stmt).first()
            if not existing_faq:
                faq = FAQ(**item)
                session.add(faq)
                print(f"Added FAQ: {item['question']}")
            else:
                print(f"FAQ exists: {item['question']}")
        
        session.commit()
        print("Population Complete.")

if __name__ == "__main__":
    populate_content()
