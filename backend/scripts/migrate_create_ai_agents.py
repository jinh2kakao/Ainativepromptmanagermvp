
from sqlmodel import Session, SQLModel, create_engine, select
import sys
import os

# Add parent directory to path to import models
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models import AiAgent
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL not found in environment variables")

engine = create_engine(DATABASE_URL)

POPULAR_AGENTS = [
    # Top 20 Popular AI Agents/Models

    # 1. General High-End (범용 상위 모델)
    { "id": 'gpt-4o', "name": 'GPT-4o', "group": '범용 상위 모델 (General High-End)', "sort_order": 10 },
    { "id": 'gpt-4-turbo', "name": 'GPT-4 Turbo', "group": '범용 상위 모델 (General High-End)', "sort_order": 20 },
    { "id": 'claude-3-opus', "name": 'Claude 3 Opus', "group": '범용 상위 모델 (General High-End)', "sort_order": 30 },
    { "id": 'gemini-1.5-pro', "name": 'Gemini 1.5 Pro', "group": '범용 상위 모델 (General High-End)', "sort_order": 40 },

    # 2. Coding & Logic (코딩 및 논리)
    { "id": 'claude-3-sonnet', "name": 'Claude 3.5 Sonnet', "group": '코딩 및 논리 (Coding & Logic)', "sort_order": 50 }, 
    { "id": 'copilot', "name": 'GitHub Copilot', "group": '코딩 및 논리 (Coding & Logic)', "sort_order": 60 },
    { "id": 'command-r-plus', "name": 'Command R+', "group": '코딩 및 논리 (Coding & Logic)', "sort_order": 70 },

    # 3. Fast & Efficient (속도 및 효율성)
    { "id": 'gpt-3.5-turbo', "name": 'GPT-3.5', "group": '속도 및 효율성 (Fast & Efficiency)', "sort_order": 80 },
    { "id": 'claude-3-haiku', "name": 'Claude 3 Haiku', "group": '속도 및 효율성 (Fast & Efficiency)', "sort_order": 90 },
    { "id": 'gemini-1.5-flash', "name": 'Gemini 1.5 Flash', "group": '속도 및 효율성 (Fast & Efficiency)', "sort_order": 100 },
    { "id": 'o1-preview', "name": 'o1 Preview', "group": '속도 및 효율성 (Fast & Efficiency)', "sort_order": 105 },

    # 4. Open Source (오픈 소스)
    { "id": 'llama-3-70b', "name": 'Llama 3 70B', "group": '오픈 소스 (Open Source)', "sort_order": 110 },
    { "id": 'llama-3-8b', "name": 'Llama 3 8B', "group": '오픈 소스 (Open Source)', "sort_order": 120 },
    { "id": 'mixtral-8x22b', "name": 'Mixtral 8x22B', "group": '오픈 소스 (Open Source)', "sort_order": 130 },
    { "id": 'mistral-large', "name": 'Mistral Large', "group": '오픈 소스 (Open Source)', "sort_order": 140 },
    { "id": 'qwen', "name": 'Qwen', "group": '오픈 소스 (Open Source)', "sort_order": 150 },
    { "id": 'grok-1.5', "name": 'Grok 1.5', "group": '오픈 소스 (Open Source)', "sort_order": 160 },

    # 5. Image Generation (이미지 생성)
    { "id": 'dall-e-3', "name": 'DALL·E 3', "group": '이미지 생성 (Image Generation)', "sort_order": 170 },
    { "id": 'midjourney-v6', "name": 'Midjourney v6', "group": '이미지 생성 (Image Generation)', "sort_order": 180 },
    { "id": 'stable-diffusion-3', "name": 'Stable Diffusion 3', "group": '이미지 생성 (Image Generation)', "sort_order": 190 },

    # 6. Search & Research (검색 및 리서치)
    { "id": 'perplexity', "name": 'Perplexity', "group": '검색 및 리서치 (Search & Research)', "sort_order": 200 },
]

def migrate():
    # Create table if not exists
    SQLModel.metadata.create_all(engine)
    
    with Session(engine) as session:
        print("Checking existing agents...")
        for agent_data in POPULAR_AGENTS:
            existing = session.get(AiAgent, agent_data["id"])
            if not existing:
                print(f"Creating agent: {agent_data['name']}")
                agent = AiAgent(
                    id=agent_data["id"],
                    name=agent_data["name"],
                    group=agent_data["group"],
                    sort_order=agent_data["sort_order"],
                    is_active=True
                )
                session.add(agent)
            else:
                print(f"Agent exists: {agent_data['name']}, updating...")
                existing.name = agent_data["name"]
                existing.group = agent_data["group"]
                existing.sort_order = agent_data["sort_order"]
                session.add(existing)
                
        session.commit()
        print("Migration complete!")

if __name__ == "__main__":
    migrate()
