from sqlmodel import select, Session
from database import engine
from models import PromptTemplate, Category
import json

def fetch_templates():
    with Session(engine) as session:
        templates = session.exec(select(PromptTemplate)).all()
        categories = session.exec(select(Category)).all()
        cat_map = {c.id: c.name for c in categories}
        
        output = []
        for t in templates:
            output.append({
                "id": str(t.id),
                "name": t.name,
                "content": t.content,
                "mode": t.mode,
                "category": cat_map.get(t.category_id, "Unknown"),
                "current_description": t.description
            })
            
    print(json.dumps(output, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    fetch_templates()
