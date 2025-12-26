from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
import uuid

from database import get_session
from models import Notice, NoticeCreate, NoticeUpdate, User
from dependencies import get_current_admin

router = APIRouter(tags=["notices"])

# Public
@router.get("/api/notices", response_model=List[Notice])
def get_notices(session: Session = Depends(get_session)):
    statement = select(Notice).where(Notice.is_published == True).order_by(Notice.is_pinned.desc(), Notice.created_at.desc())
    return session.exec(statement).all()

# Admin
@router.get("/api/admin/notices", response_model=List[Notice])
def get_admin_notices(session: Session = Depends(get_session), admin: User = Depends(get_current_admin)):
    statement = select(Notice).order_by(Notice.created_at.desc())
    return session.exec(statement).all()

@router.post("/api/admin/notices", response_model=Notice)
def create_notice(notice: NoticeCreate, session: Session = Depends(get_session), admin: User = Depends(get_current_admin)):
    db_notice = Notice(**notice.model_dump(), author_id=admin.id)
    session.add(db_notice)
    session.commit()
    session.refresh(db_notice)
    return db_notice

@router.patch("/api/admin/notices/{notice_id}", response_model=Notice)
def update_notice(notice_id: uuid.UUID, notice_update: NoticeUpdate, session: Session = Depends(get_session), admin: User = Depends(get_current_admin)):
    db_notice = session.get(Notice, notice_id)
    if not db_notice:
        raise HTTPException(status_code=404, detail="Notice not found")
    
    notice_data = notice_update.model_dump(exclude_unset=True)
    for key, value in notice_data.items():
        setattr(db_notice, key, value)
        
    session.add(db_notice)
    session.commit()
    session.refresh(db_notice)
    return db_notice

@router.delete("/api/admin/notices/{notice_id}")
def delete_notice(notice_id: uuid.UUID, session: Session = Depends(get_session), admin: User = Depends(get_current_admin)):
    db_notice = session.get(Notice, notice_id)
    if not db_notice:
        raise HTTPException(status_code=404, detail="Notice not found")
    session.delete(db_notice)
    session.commit()
    return {"ok": True}
