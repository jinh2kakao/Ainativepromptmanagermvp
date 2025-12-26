import sys
import os
import asyncio
import json
import logging
from typing import List, Dict, Any

# Add parent directory to path to allow importing backend modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
from sqlmodel import Session, select
from database import engine
from models import PromptTemplate, Category, PromptMode
import google.generativeai as genai

# Setup Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load Env
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    logger.error("GEMINI_API_KEY is missing!")
    sys.exit(1)

genai.configure(api_key=GEMINI_API_KEY)

GENERATION_INSTRUCTION = """
You are an Expert Prompt Engineer and Product Manager.
Your task is to generate 3 distinct "Simple Mode" Prompt Templates for a specific Job Category.

**Requirements:**
1. **Target Audience**: Professionals in the given category.
2. **Format**: Follow the "Advanced Prompt Evaluation Framework (APEF)" structure (Context, Objective, format, etc.) but keep it accessible ("Simple Mode").
3. **Variations**:
   - **Template 1 (Default)**: The standard, most commonly used template for this category. High utility.
   - **Template 2 (Deep/Detailed)**: A more detailed, step-by-step reasoning template (Chain-of-Thought).
   - **Template 3 (Creative/Alternative)**: A template focusing on creative ideation or a different angle.

**Output Schema (JSON List)**:
[
  {
    "name": "Standard [Category] Template",
    "title": "Standard Task",
    "content": "Full prompt content...",
    "applicable_agents": ["gpt-4o", "claude-3-5-sonnet"],
    "description": "Standard template for general tasks."
  },
  ...
]

**Constraint**: Response must be valid JSON only.
"""

async def generate_templates_for_category(category_name: str) -> List[Dict[str, Any]]:
    try:
        model = genai.GenerativeModel('gemini-flash-latest') # Use Flash for reliability
        prompt = f"""
        Category: {category_name}
        
        Generate 3 templates (Standard, Detailed, Creative) for this category.
        Make sure the content is in Korean (User Language).
        The 'title' and 'name' should be in Korean.
        """
        
        response = await model.generate_content_async(
            [GENERATION_INSTRUCTION, prompt],
            generation_config={"response_mime_type": "application/json"}
        )
        return json.loads(response.text)
    except Exception as e:
        logger.error(f"Generation failed for {category_name}: {e}")
        return []

async def main():
    logger.info("Starting Batch Generation for Simple Mode Templates...")
    
    with Session(engine) as session:
        # Fetch all categories
        categories = session.exec(select(Category)).all()
        logger.info(f"Found {len(categories)} categories.")
        
        for idx, cat in enumerate(categories):
            logger.info(f"[{idx+1}/{len(categories)}] Processing Category: {cat.name}")
            
            # Check existing simple templates
            existing = session.exec(select(PromptTemplate).where(PromptTemplate.category_id == cat.id).where(PromptTemplate.mode == PromptMode.SIMPLE)).all()
            if len(existing) >= 3:
                logger.info(f"  > Skipping (Already has {len(existing)} templates)")
                continue
                
            # Generate
            logger.info("  > Generating templates...")
            templates_data = await generate_templates_for_category(cat.name)
            
            if not templates_data:
                logger.warning("  > No data generated. Skipping.")
                continue
                
            for i, tmpl_data in enumerate(templates_data):
                # Ensure we don't duplicate logic if partial exists? 
                # For now just append.
                
                is_default = (i == 0) and (not existing) # Default if first generated AND no existing
                
                new_template = PromptTemplate(
                    category_id=cat.id,
                    mode=PromptMode.SIMPLE,
                    name=tmpl_data.get("name", "Default Template"),
                    title=tmpl_data.get("title", tmpl_data.get("name")),
                    content=tmpl_data.get("content", ""),
                    applicable_agents=tmpl_data.get("applicable_agents", []),
                    is_default=is_default
                )
                session.add(new_template)
            
            session.commit()
            logger.info(f"  > Added {len(templates_data)} templates.")
            
            # Rate limiting / polite delay
            await asyncio.sleep(1)

    logger.info("Batch Generation Completed.")

if __name__ == "__main__":
    asyncio.run(main())
