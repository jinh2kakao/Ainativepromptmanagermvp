from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
import uuid

from database import get_session
from models import FAQ, FAQCreate, FAQUpdate, User
from dependencies import get_current_admin

router = APIRouter(tags=["faqs"])

# Public
@router.get("/api/faqs", response_model=List[FAQ])
def get_faqs(session: Session = Depends(get_session)):
    statement = select(FAQ).order_by(FAQ.display_order, FAQ.created_at.desc())
    return session.exec(statement).all()

# Admin
@router.get("/api/admin/faqs", response_model=List[FAQ])
def get_admin_faqs(session: Session = Depends(get_session), admin: User = Depends(get_current_admin)):
    statement = select(FAQ).order_by(FAQ.display_order, FAQ.created_at.desc())
    return session.exec(statement).all()

@router.post("/api/admin/faqs", response_model=FAQ)
def create_faq(faq: FAQCreate, session: Session = Depends(get_session), admin: User = Depends(get_current_admin)):
    db_faq = FAQ.model_validate(faq)
    session.add(db_faq)
    session.commit()
    session.refresh(db_faq)
    return db_faq

@router.patch("/api/admin/faqs/{faq_id}", response_model=FAQ)
def update_faq(faq_id: uuid.UUID, faq_update: FAQUpdate, session: Session = Depends(get_session), admin: User = Depends(get_current_admin)):
    db_faq = session.get(FAQ, faq_id)
    if not db_faq:
        raise HTTPException(status_code=404, detail="FAQ not found")
    
    faq_data = faq_update.model_dump(exclude_unset=True)
    for key, value in faq_data.items():
        setattr(db_faq, key, value)
        
    session.add(db_faq)
    session.commit()
    session.refresh(db_faq)
    return db_faq

@router.delete("/api/admin/faqs/{faq_id}")
def delete_faq(faq_id: uuid.UUID, session: Session = Depends(get_session), admin: User = Depends(get_current_admin)):
    db_faq = session.get(FAQ, faq_id)
    if not db_faq:
        raise HTTPException(status_code=404, detail="FAQ not found")
    session.delete(db_faq)
    session.commit()
    return {"ok": True}
