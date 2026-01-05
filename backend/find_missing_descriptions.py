from sqlmodel import Session, select
from database import engine
from models import PromptTemplate

def list_missing_descriptions():
    with Session(engine) as session:
        # Select templates where description is null or empty string
        templates = session.exec(select(PromptTemplate)).all()
        missing = [t.name for t in templates if not t.description]
        
        unique_missing = sorted(list(set(missing)))
        
        print(f"Total templates missing description: {len(missing)}")
        print(f"Unique names ({len(unique_missing)}):")
        for name in unique_missing:
            print(f"'{name}',")

if __name__ == "__main__":
    list_missing_descriptions()
