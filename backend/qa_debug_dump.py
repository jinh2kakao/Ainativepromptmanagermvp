
from sqlmodel import Session, select
from database import engine
from models import Category, PromptTemplate, PromptMode

def dump_data():
    with Session(engine) as session:
        # Fetch Categories
        categories = session.exec(select(Category)).all()
        cat_map = {c.id: c for c in categories}
        
        print(f"Total Categories: {len(categories)}")
        
        # Fetch Templates
        templates = session.exec(select(PromptTemplate)).all()
        
        # Group by Category
        templates_by_cat = {} # cat_id -> {'simple': [], 'assistance': []}
        
        for t in templates:
            if t.category_id not in templates_by_cat:
                templates_by_cat[t.category_id] = {'simple': [], 'assistance': []}
            
            t_name = t.name
            if t.title:
                 t_name = f"{t.name} ({t.title})"
            
            if t.mode == PromptMode.SIMPLE:
                templates_by_cat[t.category_id]['simple'].append(t_name)
            elif t.mode == PromptMode.ASSISTANCE:
                templates_by_cat[t.category_id]['assistance'].append(t_name)
                
        # Sort categories by order or name? DB has 'order'.
        categories.sort(key=lambda x: x.order)
        
        for c in categories:
            print(f"\n[Category: {c.name}] (Value: {c.value})")
            
            data = templates_by_cat.get(c.id, {'simple': [], 'assistance': []})
            simple_list = data['simple']
            assist_list = data['assistance']
            
            print(f"  General Mode: {len(simple_list)} templates")
            for name in simple_list:
                print(f"    - {name}")
                
            print(f"  Assistance Mode: {len(assist_list)} templates")
            for name in assist_list:
                print(f"    - {name}")

if __name__ == "__main__":
    dump_data()
