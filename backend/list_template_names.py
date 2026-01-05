from sqlmodel import select, Session
from database import engine
from models import PromptTemplate

def list_names():
    with Session(engine) as session:
        templates = session.exec(select(PromptTemplate)).all()
        for t in templates:
            print(f"Name: {t.name}, Description: {t.description}")

if __name__ == "__main__":
    list_names()
