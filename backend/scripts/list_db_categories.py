from dotenv import load_dotenv
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlmodel import select, Session, create_engine
from models import Category

load_dotenv()
engine = create_engine(os.getenv("DATABASE_URL"))

with Session(engine) as session:
    categories = session.exec(select(Category)).all()
    print(f"Total Categories: {len(categories)}")
    for c in categories:
        print(f"{c.name}: {c.value}")
