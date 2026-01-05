from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select, func, desc, SQLModel
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime

from database import get_session
from models import PromptTemplate, ProjectTemplate, User, UserRole, Category, TemplateUsage
from dependencies import get_current_user, get_current_admin

router = APIRouter(
    prefix="/api/templates",
    tags=["templates"],
    responses={404: {"description": "Not found"}},
)

# Response Models
from models import CategoryRead, PromptMode

class PromptTemplateRead(SQLModel):
    id: uuid.UUID
    category_id: Optional[uuid.UUID]
    mode: PromptMode
    title: Optional[str]
    name: str
    description: Optional[str] = None
    content: str
    applicable_agents: Optional[List[str]]
    preview_image_url: Optional[str]
    is_default: bool
    created_at: datetime
    updated_at: datetime
    category: Optional[CategoryRead] = None

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

@router.get("/stats/popular", response_model=List[PromptTemplate])
def get_popular_templates(
    limit: int = 6,
    session: Session = Depends(get_session)
):
    # 1. Get IDs from TemplateUsage sorted by count desc
    subquery = (
        select(TemplateUsage.template_id, func.count(TemplateUsage.id).label("count"))
        .group_by(TemplateUsage.template_id)
        .order_by(desc("count"))
        .limit(limit)
    )
    results = session.exec(subquery).all()
    
    popular_ids = [r.template_id for r in results]
    popular_templates = []
    
    if popular_ids:
        # Fetch actual template objects
        # To preserve order of popularity, we can't just use IN clause blindly without re-sorting
        fetched = session.exec(select(PromptTemplate).where(PromptTemplate.id.in_(popular_ids))).all()
        fetched_map = {t.id: t for t in fetched}
        for pid in popular_ids:
            if pid in fetched_map:
                popular_templates.append(fetched_map[pid])
    
    # 2. If we need more, fetch by created_at desc (excluding already found)
    if len(popular_templates) < limit:
        remaining = limit - len(popular_templates)
        query = select(PromptTemplate).order_by(desc(PromptTemplate.created_at)).limit(remaining)
        
        if popular_ids:
            query = query.where(PromptTemplate.id.notin_(popular_ids))
            
        others = session.exec(query).all()
        popular_templates.extend(others)
            
    return popular_templates

@router.get("/stats/recent", response_model=List[PromptTemplate])
def get_recent_templates(
    limit: int = 4,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    # Get distinct template_ids used by user, ordered by most recent use
    # Query TemplateUsage
    query = (
        select(TemplateUsage.template_id)
        .where(TemplateUsage.user_id == current_user.id)
        .order_by(TemplateUsage.created_at.desc())
        .limit(limit * 2) # Fetch more to filter duplicates in app logic if needed (though distinct is better)
    )
    
    # Distinct is tricky with order by in some SQL dialects, but here we can just fetch usages
    usages = session.exec(select(TemplateUsage).where(TemplateUsage.user_id == current_user.id).order_by(TemplateUsage.created_at.desc()).limit(20)).all()
    
    seen = set()
    template_ids = []
    for u in usages:
        if u.template_id not in seen:
            seen.add(u.template_id)
            template_ids.append(u.template_id)
            if len(template_ids) >= limit:
                break
                
    if not template_ids:
        return []
        
    templates = session.exec(select(PromptTemplate).where(PromptTemplate.id.in_(template_ids))).all()
    # Sort
    templates_map = {t.id: t for t in templates}
    return [templates_map[tid] for tid in template_ids if tid in templates_map]

@router.post("/{template_id}/track")
def track_template_usage(
    template_id: uuid.UUID,
    action: str = "view", # view, copy, run
    current_user: Optional[User] = Depends(get_current_user), # Optional for guests? PRD says guest tracking for simple stats okay, need logic
    session: Session = Depends(get_session)
):
    # If action is 'copy' or 'run', tracking is valuable. 'view' maybe excessive.
    user_id = current_user.id if current_user else None
    
    usage = TemplateUsage(
        template_id=template_id,
        user_id=user_id,
        action_type=action,
        created_at=datetime.utcnow()
    )
    session.add(usage)
    session.commit()
    return {"ok": True}

    session.add(usage)
    session.commit()
    return {"ok": True}

@router.get("/{template_id}", response_model=PromptTemplateRead)
def get_template_detail(
    template_id: uuid.UUID,
    session: Session = Depends(get_session)
):
    # Eager load category
    statement = select(PromptTemplate).where(PromptTemplate.id == template_id)
    # in SQLModel/SQLAlchemy 2.0 style?
    # Usually: statement = select(PromptTemplate).options(selectinload(PromptTemplate.category)).where(...)
    # But need to import selectinload.
    # Or just fetch and let lazy loading happen? Pydantic validation might trigger it if session is active.
    # But async/sync session matters. Here it's sync.
    # If I just get it, accessing .category will trigger load.
    template = session.exec(statement).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    return template

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
