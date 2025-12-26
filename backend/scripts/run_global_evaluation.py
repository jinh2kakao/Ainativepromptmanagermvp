
import os
import re
import sys
import uuid
import json
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from sqlmodel import Session, select

# Add backend directory to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

# Fix .env path: Assuming script is in backend/scripts, .env is in backend/.env
# os.path.dirname(__file__) is .../backend/scripts
# .. is .../backend
# .env is inside backend
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '../.env'))

# Import after sys.path and load_dotenv
from database import engine
from models import PromptTemplate

# --- Python Implementation of Module 1 Logic (Mirrored) ---

def count_syllables(word):
    word = word.lower()
    count = 0
    vowels = "aeiouy"
    if word[0] in vowels:
        count += 1
    for i in range(1, len(word)):
        if word[i] in vowels and word[i - 1] not in vowels:
            count += 1
    if word.endswith("e"):
        count -= 1
    if count == 0:
        count += 1
    return count

def calculate_readability(text_content):
    if not text_content: return 0
    sentences = re.split(r'[.!?]+', text_content)
    sentences = [s for s in sentences if s.strip()]
    words = re.findall(r'\b\w+\b', text_content)
    
    num_sentences = len(sentences) or 1
    num_words = len(words) or 1
    num_syllables = sum(count_syllables(w) for w in words)
    
    # Flesch Reading Ease
    score = 206.835 - 1.015 * (num_words / num_sentences) - 84.6 * (num_syllables / num_words)
    return min(max(score, 0), 100)

def security_scan(text_content):
    if not text_content: return 100
    patterns = [
        r"ignore previous instructions",
        r"delete everything",
        r"system override",
        r"admin access",
        r"reveal system prompt"
    ]
    for pattern in patterns:
        if re.search(pattern, text_content, re.IGNORECASE):
            return 0 # Fail
    return 100 # Pass

def structure_scan(text_content):
    if not text_content: return 0, []
    components = []
    text_lower = text_content.lower()
    
    required = {
        "persona": ["persona", "role", "act as", "you are a"],
        "context": ["context", "background", "situation"],
        "task": ["task", "objective", "goal", "please"],
        "constraints": ["constraint", "rule", "limit", "avoid"],
        "format": ["format", "output", "json", "markdown", "table"]
    }
    
    found_count = 0
    missing = []
    
    for key, keywords in required.items():
        if any(k in text_lower for k in keywords):
            found_count += 1
        else:
            missing.append(key)
            
    # Simple scoring: 20 points per component
    score = found_count * 20
    return score, missing

def evaluate_and_sync():
    with Session(engine) as session:
        print("--- Starting Batch Evaluation ---")
        
        # 1. Fetch public templates using SQLModel
        templates = session.exec(select(PromptTemplate)).all()
        print(f"Found {len(templates)} templates to evaluate.")
        
        # Use raw connection for prompt_ops manipulations to avoid defining SQLModel for prompt_ops tables here
        # (Though we could, but raw SQL is fine for this utility script)
        with engine.connect() as conn:
            for t in templates:
                t_id = str(t.id)
                content = t.content or ""
                name = t.name or "Untitled"
                
                if not content.strip():
                    print(f"Skipping empty template: {name} ({t_id})")
                    continue
                    
                # 2. Sync to prompt_ops.templates
                sync_sql = text("""
                    INSERT INTO prompt_ops.templates (id, content, status, created_at, updated_at)
                    VALUES (:id, :content, 'PENDING', NOW(), NOW())
                    ON CONFLICT (id) DO UPDATE SET content = :content
                """)
                conn.execute(sync_sql, {"id": t_id, "content": content})
                conn.commit()
                
                # 3. Evaluate
                readability = calculate_readability(content)
                security = security_scan(content)
                structure, missing = structure_scan(content)
                
                # Weighted Score
                if security == 0:
                    total_score = 0
                else:
                    total_score = (structure * 0.7) + (readability * 0.3)
                    
                total_score = int(min(max(total_score, 0), 100))
                
                metrics = {
                    "readability": readability,
                    "security": security,
                    "structure": structure,
                    "missing_components": missing
                }
                
                print(f"[{name[:20]}...] Score: {total_score} (R:{int(readability)} S:{structure} Sec:{security})")
                
                # 4. Insert Evaluation
                insert_eval = text("""
                    INSERT INTO prompt_ops.evaluations (id, template_id, total_score, metrics)
                    VALUES (:id, :t_id, :score, :metrics)
                """)
                
                conn.execute(insert_eval, {
                    "id": str(uuid.uuid4()),
                    "t_id": t_id,
                    "score": total_score,
                    "metrics": json.dumps(metrics)
                })
                conn.commit()
                
            print("--- Evaluation Complete ---")
            print("Templates with low scores (< 70) should be queued for optimization.")

if __name__ == "__main__":
    evaluate_and_sync()
