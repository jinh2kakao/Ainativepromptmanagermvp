
import sys
import os
import requests
import json
from datetime import datetime

# Add parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlmodel import Session, select
from database import engine
from models import PromptTemplate, PromptMode, Category

# PROD_API_URL = "https://api.promptlib.co.kr"
# Use localhost for now if we can't hit prod, but user said "compare with production".
# Assuming the user can run this script and it connects to real prod.
# If I am in an isolated env, I might fail to hit the domain.
PROD_API_URL = "https://api.promptlib.co.kr" # Corrected based on test_prod_api.py

def sync_prod_templates():
    print(f"Fetching from {PROD_API_URL}...")
    
    # Try public endpoint first, or admin endpoint if known
    # Based on routers/admin.py, it's /api/admin/templates
    # Based on routers/templates.py, it might be /api/templates
    
    # Try admin first as per test script
    url = f"{PROD_API_URL}/api/admin/templates?skip=0&limit=1000"
    
    try:
        # 1. Fetch Categories first to build a ID->Value map
        print("Fetching categories from Prod...")
        cat_url = f"{PROD_API_URL}/api/admin/categories"
        cat_response = requests.get(cat_url, timeout=10)
        
        prod_cat_id_to_value = {}
        if cat_response.status_code == 200:
            prod_cats = cat_response.json()
            for c in prod_cats:
                prod_cat_id_to_value[c['id']] = c['value']
            print(f"Fetched {len(prod_cats)} categories from Prod.")
        else:
            print(f"Failed to fetch categories. Status: {cat_response.status_code}")
            # Fallback: maybe public categories endpoint?
            cat_url = f"{PROD_API_URL}/api/categories"
            cat_response = requests.get(cat_url, timeout=10)
            if cat_response.status_code == 200:
                prod_cats = cat_response.json()
                for c in prod_cats:
                    prod_cat_id_to_value[c['id']] = c['value']
                print(f"Fetched {len(prod_cats)} categories from Prod (Public).")
            else:
                print("Could not fetch categories. Sync might fail for UUID mismatch.")

        # 2. Fetch Templates
        response = requests.get(url, timeout=10)
        if response.status_code != 200:
             # Fallback to public endpoint
             url = f"{PROD_API_URL}/api/templates?skip=0&limit=1000"
             response = requests.get(url, timeout=10)
             
        if response.status_code != 200:
            print(f"Failed to fetch templates. Status: {response.status_code}")
            return

        prod_templates = response.json()
        print(f"Fetched {len(prod_templates)} templates from production.")
        if len(prod_templates) > 0:
            print("Sample Template Structure:")
            print(json.dumps(prod_templates[0], indent=2, ensure_ascii=False))
        
        # Filter for Assistance Mode
        assistance_templates = [t for t in prod_templates if t.get('mode') == 'assistance' or t.get('mode') == 'ASSISTANCE']
        print(f"Found {len(assistance_templates)} Assistance Mode templates in Prod.")
        
        with Session(engine) as session:
            # Get local categories map (Value -> ID)
            categories = session.exec(select(Category)).all()
            local_cat_value_to_id = {cat.value: cat.id for cat in categories}
            
        with Session(engine) as session:
            # Get local categories map (Value -> ID)
            categories = session.exec(select(Category)).all()
            local_cat_value_to_id = {cat.value: cat.id for cat in categories}
            
            # Pre-load local templates' content for comparison
            # Structure: { category_id: [content_json_str, ...] }
            # To compare robustly, we'll store parsed JSON or normalized strings if possible.
            # But deep comparison of large list is expensive.
            # Let's verify standard assistance template structure (list of groups).
            
            local_templates = session.exec(select(PromptTemplate).where(PromptTemplate.mode == PromptMode.ASSISTANCE)).all()
            local_content_map = {} # cat_id -> set of json_dumps(normalized)
            
            def normalize_content(content_str):
                try:
                    obj = json.loads(content_str)
                    return json.dumps(obj, sort_keys=True)
                except:
                    return content_str
            
            for t in local_templates:
                if t.category_id:
                    normalized = normalize_content(t.content)
                    if t.category_id not in local_content_map:
                        local_content_map[t.category_id] = set()
                    local_content_map[t.category_id].add(normalized)
            
            added_count = 0
            
            for pt in assistance_templates:
                prod_cat_id = pt.get('category_id')
                target_cat_id = None
                
                # Map Category
                if prod_cat_id and prod_cat_id in prod_cat_id_to_value:
                    cat_value = prod_cat_id_to_value[prod_cat_id]
                    if cat_value in local_cat_value_to_id:
                        target_cat_id = local_cat_value_to_id[cat_value]
                
                if target_cat_id:
                     prod_content = pt.get('content', '')
                     normalized_prod = normalize_content(prod_content)
                     
                     # Check if this content exists in local category
                     existing_contents = local_content_map.get(target_cat_id, set())
                     
                     if normalized_prod not in existing_contents:
                         # Insert
                         cat_name = prod_cat_id_to_value.get(prod_cat_id)
                         print(f"Adding new template to '{cat_name}'")
                         
                         # Handle Title/Name
                         title = pt.get('title')
                         name = pt.get('name') or 'Assistance Template'
                         
                         if not title or title.strip() == "":
                             # Fallback title logic
                             if name and name != "Assistance Template":
                                 title = name
                             else:
                                 # Maybe derive from category?
                                 title = f"{cat_name} Template"
                         
                         new_t = PromptTemplate(
                             category_id=target_cat_id,
                             mode=PromptMode.ASSISTANCE,
                             title=title,
                             name=name,
                             content=prod_content,
                             is_default=False, # New imports shouldn't be default unless critical, simpler to set False
                             applicable_agents=pt.get('applicable_agents')
                         )
                         session.add(new_t)
                         
                         # Update local map to prevent duplicates if Prod has duplicates
                         if target_cat_id not in local_content_map:
                             local_content_map[target_cat_id] = set()
                         local_content_map[target_cat_id].add(normalized_prod)
                         
                         added_count += 1
            
            if added_count > 0:
                session.commit()
                print(f"Synced {added_count} new templates.")
            else:
                print("No missing templates found (based on Content comparison).")

            print("-" * 30)
            current_local_count = len(session.exec(select(PromptTemplate).where(PromptTemplate.mode == PromptMode.ASSISTANCE)).all())
            print(f"Local Assistance Templates after Sync: {current_local_count}")
            print("-" * 30)

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    sync_prod_templates()
