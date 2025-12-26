from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime

from database import get_session
from models import PromptTemplate, ProjectTemplate, User, UserRole, Category
from dependencies import get_current_user, get_current_admin

router = APIRouter(
    prefix="/api/templates",
    tags=["templates"],
    responses={404: {"description": "Not found"}},
)

# --- Prompt Templates ---

@router.get("/", response_model=List[PromptTemplate])
def list_templates(
    category_id: Optional[uuid.UUID] = None,
    sub_category_value: Optional[str] = Query(None, alias="subCategory"),
    mode: Optional[str] = None,
    session: Session = Depends(get_session)
):
    query = select(PromptTemplate)
    
    if sub_category_value:
        # Find category by value
        category = session.exec(select(Category).where(Category.value == sub_category_value)).first()
        if category:
            category_id = category.id
    
    if category_id:
        query = query.where(PromptTemplate.category_id == category_id)

    if mode:
        query = query.where(PromptTemplate.mode == mode)

    return session.exec(query).all()

@router.get("/default", response_model=Optional[PromptTemplate])
def get_default_template(
    category_id: uuid.UUID,
    session: Session = Depends(get_session)
):
    # Logic: Get default=True. If multiple, get latest updated_at.
    query = select(PromptTemplate).where(
        PromptTemplate.category_id == category_id,
        PromptTemplate.is_default == True
    ).order_by(PromptTemplate.updated_at.desc())
    
    template = session.exec(query).first()
    
    # If no default is set, maybe return the latest one? Or None.
    # PRD says: "If only one template exists, apply it automatically".
    # But here we just return the default one.
    
    if not template:
        # Fallback: check if there is only one template
        all_templates = session.exec(select(PromptTemplate).where(PromptTemplate.category_id == category_id)).all()
        if len(all_templates) == 1:
            return all_templates[0]
            
    return template

@router.post("/{template_id}/set-default")
def set_default_template(
    template_id: uuid.UUID,
    current_user: User = Depends(get_current_admin),
    session: Session = Depends(get_session)
):
    template = session.get(PromptTemplate, template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    # Unset other defaults in the same category
    if template.category_id:
        others = session.exec(select(PromptTemplate).where(
            PromptTemplate.category_id == template.category_id,
            PromptTemplate.id != template_id
        )).all()
        for other in others:
            other.is_default = False
            session.add(other)
            
    template.is_default = True
    template.updated_at = datetime.utcnow()
    session.add(template)
    session.commit()
    return {"ok": True}

# --- Project Templates ---

@router.get("/projects", response_model=List[ProjectTemplate])
def list_project_templates(
    category_id: Optional[uuid.UUID] = None,
    session: Session = Depends(get_session)
):
    query = select(ProjectTemplate)
    if category_id:
        query = query.where(ProjectTemplate.category_id == category_id)
    return session.exec(query).all()

@router.post("/projects", response_model=ProjectTemplate)
def create_project_template(
    template: ProjectTemplate,
    current_user: User = Depends(get_current_admin),
    session: Session = Depends(get_session)
):
    session.add(template)
    session.commit()
    session.refresh(template)
    return template
