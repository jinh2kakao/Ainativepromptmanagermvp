import sys
import os
import json

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlmodel import Session, select
from database import engine
from models import PromptTemplate, Category

def debug_admin_templates():
    print("Starting Debug for Admin Templates Endpoint Logic...")
    
    with Session(engine) as session:
        # Simulate the query in routers/admin.py: list_templates
        # query = select(PromptTemplate)
        # We will retrieve all to verify serialization
        
        try:
            query = select(PromptTemplate)
            results = session.exec(query).all()
            print(f"Retrieved {len(results)} templates from DB.")
            
            error_count = 0
            for idx, tmpl in enumerate(results):
                try:
                    # Simulate Pydantic validation (accessing fields)
                    data = tmpl.dict()
                    # explicitly check applicable_agents
                    agents = tmpl.applicable_agents
                    if agents is not None and not isinstance(agents, list):
                        print(f"[WARN] Template {tmpl.id}: applicable_agents is {type(agents)}: {agents}")
                    
                    # Try to parse as the Response Model would? 
                    # PromptTemplate IS the response model.
                    PromptTemplate.from_orm(tmpl)
                    
                except Exception as e:
                    print(f"[FAIL] Template {tmpl.id} (Category: {tmpl.category_id}) failed validation: {e}")
                    error_count += 1
                    if error_count > 5:
                        print("Stopping after 5 errors.")
                        break
            
            if error_count == 0:
                print("SUCCESS: All templates passed Pydantic validation.")
            else:
                print(f"FAILURE: {error_count} templates failed validation.")
                
        except Exception as e:
            print(f"CRITICAL SQL ERROR: {e}")

if __name__ == "__main__":
    debug_admin_templates()
