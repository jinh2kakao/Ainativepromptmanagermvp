from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
import uuid
import datetime

from database import get_session
from models import Inquiry, InquiryCreate, InquiryComment, InquiryCommentCreate, User, UserRole, InquiryStatus, InquiryReadWithUser
from dependencies import get_current_user, get_current_admin

router = APIRouter(tags=["inquiries"])

# User Endpoints
@router.get("/api/inquiries", response_model=List[Inquiry])
def get_my_inquiries(session: Session = Depends(get_session), user: User = Depends(get_current_user)):
    statement = select(Inquiry).where(Inquiry.user_id == user.id).order_by(Inquiry.updated_at.desc())
    return session.exec(statement).all()

@router.post("/api/inquiries", response_model=Inquiry)
def create_inquiry(inquiry: InquiryCreate, session: Session = Depends(get_session), user: User = Depends(get_current_user)):
    db_inquiry = Inquiry(**inquiry.model_dump(), user_id=user.id)
    session.add(db_inquiry)
    session.commit()
    session.refresh(db_inquiry)
    return db_inquiry

@router.get("/api/inquiries/{inquiry_id}", response_model=InquiryReadWithUser)
def get_inquiry(inquiry_id: uuid.UUID, session: Session = Depends(get_session), user: User = Depends(get_current_user)):
    statement = select(Inquiry, User).join(User).where(Inquiry.id == inquiry_id)
    result = session.exec(statement).first()
    
    if not result:
        raise HTTPException(status_code=404, detail="Inquiry not found")
        
    db_inquiry, db_user = result
    
    # Permission check: Owner or Admin
    if db_inquiry.user_id != user.id and user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Access denied")
        
    return InquiryReadWithUser(
        **db_inquiry.model_dump(),
        user_email=db_user.email,
        user_name=db_user.name
    )

@router.get("/api/inquiries/{inquiry_id}/comments", response_model=List[InquiryComment])
def get_inquiry_comments(inquiry_id: uuid.UUID, session: Session = Depends(get_session), user: User = Depends(get_current_user)):
    # Verify access first
    statement = select(Inquiry).where(Inquiry.id == inquiry_id)
    db_inquiry = session.exec(statement).first()
    if not db_inquiry:
         raise HTTPException(status_code=404, detail="Inquiry not found")
         
    if db_inquiry.user_id != user.id and user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Access denied")
        
    comments_stmt = select(InquiryComment).where(InquiryComment.inquiry_id == inquiry_id).order_by(InquiryComment.created_at.asc())
    return session.exec(comments_stmt).all()


@router.post("/api/inquiries/{inquiry_id}/comments", response_model=InquiryComment)
def create_comment(
    inquiry_id: uuid.UUID, 
    comment: InquiryCommentCreate, 
    session: Session = Depends(get_session), 
    user: User = Depends(get_current_user)
):
    # Verify access
    statement = select(Inquiry).where(Inquiry.id == inquiry_id)
    db_inquiry = session.exec(statement).first()
    if not db_inquiry:
        raise HTTPException(status_code=404, detail="Inquiry not found")
        
    if db_inquiry.user_id != user.id and user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Access denied")
    
    is_staff = (user.role == UserRole.ADMIN) and (db_inquiry.user_id != user.id)
    
    db_comment = InquiryComment(
        inquiry_id=inquiry_id,
        author_id=user.id,
        content=comment.content,
        is_staff_reply=is_staff
    )
    session.add(db_comment)
    
    # Update inquiry status/updated_at
    db_inquiry.updated_at = datetime.datetime.utcnow()
    if is_staff:
        db_inquiry.status = InquiryStatus.ANSWERED
    else:
        # If user replies and it was ANSWERED or CLOSED, maybe re-open or pending?
        # Let's set to PENDING to alert admin
        if db_inquiry.status != InquiryStatus.PENDING:
            db_inquiry.status = InquiryStatus.PENDING

    session.add(db_inquiry)
    session.commit()
    session.refresh(db_comment)
    return db_comment


# Admin Endpoints (Inbox)
@router.get("/api/admin/inquiries", response_model=List[InquiryReadWithUser])
def get_admin_inquiries(
    status: InquiryStatus = None, 
    session: Session = Depends(get_session), 
    admin: User = Depends(get_current_admin)
):
    query = select(Inquiry, User).join(User).where(Inquiry.user_id == User.id)
    if status:
        query = query.where(Inquiry.status == status)
    
    query = query.order_by(Inquiry.updated_at.desc())
    results = session.exec(query).all()
    
    return [
        InquiryReadWithUser(
            **inquiry.model_dump(),
            user_email=user.email,
            user_name=user.name
        ) for inquiry, user in results
    ]

# Admin can manually close inquiry
@router.patch("/api/admin/inquiries/{inquiry_id}/status")
def update_inquiry_status(
    inquiry_id: uuid.UUID, 
    status: InquiryStatus, 
    session: Session = Depends(get_session), 
    admin: User = Depends(get_current_admin)
):
    db_inquiry = session.get(Inquiry, inquiry_id)
    if not db_inquiry:
         raise HTTPException(status_code=404, detail="Inquiry not found")
    
    db_inquiry.status = status
    session.add(db_inquiry)
    session.commit()
    return {"ok": True}
