from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlmodel import Session, select
from database import get_session
from models import User, Prompt, Category, PromptTemplate, AuditLog, UserRole, PromptMode, UserRead, PromptRead, Project, UserType, WithdrawnUser, PromptTemplateUpdate, CategoryTemplateLink

# ... (Previous code remains)



# ... (Rest of the file)

from dependencies import get_current_admin
import uuid
from datetime import datetime

router = APIRouter(
    prefix="/api/admin",
    tags=["admin"],
    dependencies=[Depends(get_current_admin)]
)

# --- User Management ---

@router.get("/users", response_model=List[UserRead])
def list_users(
    skip: int = 0, 
    limit: int = 100, 
    email: Optional[str] = None,
    role: Optional[UserRole] = None,
    session: Session = Depends(get_session)
):
    query = select(User)
    if email:
        query = query.where(User.email.contains(email))
    if role:
        query = query.where(User.role == role)
    
    users = session.exec(query.offset(skip).limit(limit)).all()
    
    # Enrich with counts
    user_reads = []
    for user in users:
        # Count prompts
        prompt_count = session.exec(select(Prompt).where(Prompt.owner_id == user.id)).all()
        # Count projects
        project_count = session.exec(select(Project).where(Project.owner_id == user.id)).all()
        
        user_dict = user.dict()
        # user_type is already correct (Uppercase from DB/Enum)
        # if isinstance(user_dict.get("user_type"), str):
        #    user_dict["user_type"] = user_dict["user_type"].lower()
            
        user_dict["prompt_count"] = len(prompt_count)
        user_dict["project_count"] = len(project_count)
        user_dict["project_count"] = len(project_count)
        user_reads.append(UserRead(**user_dict))
    
    return user_reads

@router.get("/users/withdrawn", response_model=List[WithdrawnUser])
def list_withdrawn_users(
    skip: int = 0,
    limit: int = 100,
    session: Session = Depends(get_session)
):
    """
    List withdrawn users from archive
    """
    query = select(WithdrawnUser).offset(skip).limit(limit).order_by(WithdrawnUser.withdrawn_at.desc())
    return session.exec(query).all()


@router.patch("/users/{user_id}/role", response_model=UserRead)
def update_user_role(user_id: uuid.UUID, role: UserRole, session: Session = Depends(get_session)):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.role = role
    session.add(user)
    session.commit()
    session.refresh(user)
    session.refresh(user)
    return user

@router.patch("/users/{user_id}/grade", response_model=UserRead)
def update_user_grade(
    user_id: uuid.UUID, 
    user_type: UserType,
    duration: Optional[str] = None, # "1m" or "1y"
    end_date: Optional[datetime] = None, # Manual end date
    session: Session = Depends(get_session)
):
    try:
        user = session.get(User, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        user.user_type = user_type
        
        if user_type in [UserType.PRO, UserType.ENTERPRISE]:
            if end_date:
                user.subscription_end_date = end_date
            elif duration:
                from datetime import timedelta
                now = datetime.utcnow()
                if duration == "1m":
                    user.subscription_end_date = now + timedelta(days=30)
                elif duration == "1y":
                    user.subscription_end_date = now + timedelta(days=365)
        elif user_type == UserType.FREE:
            user.subscription_end_date = None
            
        session.add(user)
        session.commit()
        session.refresh(user)
        return user
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/users/{user_id}")
def delete_user(user_id: uuid.UUID, session: Session = Depends(get_session)):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    # Soft delete logic: set is_active = False (assuming added) or hard delete
    # Since we added is_active:
    user.is_active = False
    session.add(user)
    session.commit()
    return {"message": "User deactivated"}

@router.post("/users/{user_id}/reset-password")
def reset_user_password(user_id: uuid.UUID, session: Session = Depends(get_session)):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Generate temp password (mock)
    temp_password = "temp_password_123"
    # In real app, hash this password and send email
    # user.hashed_password = hash(temp_password)
    # send_email(user.email, temp_password)
    
    # For MVP, just return the temp password
    return {"message": f"Password reset to: {temp_password}"}

# --- Prompt Management ---

@router.get("/prompts", response_model=List[PromptRead])
def list_prompts(
    skip: int = 0, 
    limit: int = 100, 
    report_count: Optional[int] = None,
    owner_id: Optional[uuid.UUID] = None,
    owner_email: Optional[str] = None,
    session: Session = Depends(get_session)
):
    query = select(Prompt, User.email).join(User, Prompt.owner_id == User.id, isouter=True)
    
    if owner_id:
        query = query.where(Prompt.owner_id == owner_id)
        
    if owner_email:
        query = query.where(User.email.contains(owner_email))
        
    results = session.exec(query.offset(skip).limit(limit)).all()
    
    prompts = []
    for prompt, email in results:
        # Create a dictionary from the prompt model
        prompt_dict = prompt.dict()
        # Add owner_email
        prompt_dict["owner_email"] = email
        prompts.append(PromptRead(**prompt_dict))
        
    return prompts

@router.delete("/prompts/{prompt_id}")
def delete_prompt(prompt_id: uuid.UUID, session: Session = Depends(get_session)):
    prompt = session.get(Prompt, prompt_id)
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    session.delete(prompt)
    session.commit()
    return {"message": "Prompt deleted"}

# --- Category Management ---

@router.get("/categories", response_model=List[Category])
def list_categories(session: Session = Depends(get_session)):
    # Return all categories, frontend can build the tree
    return session.exec(select(Category).order_by(Category.order)).all()

@router.post("/categories", response_model=Category)
def create_category(category: Category, session: Session = Depends(get_session)):
    session.add(category)
    session.commit()
    session.refresh(category)
    return category

@router.put("/categories/{category_id}", response_model=Category)
def update_category(category_id: uuid.UUID, category_data: Category, session: Session = Depends(get_session)):
    category = session.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    category_data_dict = category_data.dict(exclude_unset=True)
    for key, value in category_data_dict.items():
        setattr(category, key, value)
        
    session.add(category)
    session.commit()
    session.refresh(category)
    return category

@router.delete("/categories/{category_id}")
def delete_category(category_id: uuid.UUID, session: Session = Depends(get_session)):
    category = session.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    session.delete(category)
    session.commit()
    return {"message": "Category deleted"}

@router.post("/categories/sync")
def sync_categories(session: Session = Depends(get_session)):
    # Define the category structure (mirrors jobCategories.ts)
    JOB_CATEGORIES = [
      {
        "value": '서비스 & 프로덕트 기획',
        "label": '서비스 & 프로덕트 기획',
        "subCategories": [
          { "value": '비즈니스 모델(BM) 수립', "label": '비즈니스 모델(BM) 수립' },
          { "value": '사용자 리서치(UX Research)', "label": '사용자 리서치(UX Research)' },
          { "value": '기능 명세 및 정책', "label": '기능 명세 및 정책' },
          { "value": '화면 설계(IA)', "label": '화면 설계(IA)' },
          { "value": '프로젝트 관리(PM/PO)', "label": '프로젝트 관리(PM/PO)' }
        ]
      },
      {
        "value": 'UI/UX & 크리에이티브 디자인',
        "label": 'UI/UX & 크리에이티브 디자인',
        "subCategories": [
          { "value": 'UI 구조 및 레이아웃', "label": 'UI 구조 및 레이아웃' },
          { "value": '디자인 시스템', "label": '디자인 시스템' },
          { "value": 'UX 라이팅', "label": 'UX 라이팅' },
          { "value": '그래픽 & 브랜딩', "label": '그래픽 & 브랜딩' },
          { "value": '디자인 리뷰', "label": '디자인 리뷰' }
        ]
      },
      {
        "value": '소프트웨어 개발 & 엔지니어링',
        "label": '소프트웨어 개발 & 엔지니어링',
        "subCategories": [
          { "value": '프론트엔드 개발', "label": '프론트엔드 개발' },
          { "value": '백엔드 & API', "label": '백엔드 & API' },
          { "value": '코드 품질 & 리팩토링', "label": '코드 품질 & 리팩토링' },
          { "value": '데브옵스 & 인프라', "label": '데브옵스 & 인프라' },
          { "value": 'QA & 테스팅', "label": 'QA & 테스팅' },
          { "value": '기술 문서', "label": '기술 문서' }
        ]
      },
      {
        "value": '데이터 분석 & AI',
        "label": '데이터 분석 & AI',
        "subCategories": [
          { "value": '데이터 쿼리(SQL)', "label": '데이터 쿼리(SQL)' },
          { "value": '데이터 시각화', "label": '데이터 시각화' },
          { "value": '데이터 분석 보고', "label": '데이터 분석 보고' },
          { "value": 'AI 모델링', "label": 'AI 모델링' }
        ]
      },
      {
        "value": '마케팅 & 그로스',
        "label": '마케팅 & 그로스',
        "subCategories": [
          { "value": '카피라이팅(Ads)', "label": '카피라이팅(Ads)' },
          { "value": '콘텐츠 마케팅', "label": '콘텐츠 마케팅' },
          { "value": '소셜 미디어(SNS)', "label": '소셜 미디어(SNS)' },
          { "value": 'CRM & 이메일', "label": 'CRM & 이메일' },
          { "value": '브랜드 스토리텔링', "label": '브랜드 스토리텔링' }
        ]
      },
      {
        "value": '유튜브 & 영상 미디어',
        "label": '유튜브 & 영상 미디어',
        "subCategories": [
          { "value": '숏폼 시나리오', "label": '숏폼 시나리오' },
          { "value": '롱폼 영상 기획', "label": '롱폼 영상 기획' },
          { "value": '영상 메타데이터', "label": '영상 메타데이터' },
          { "value": '스토리보드 묘사', "label": '스토리보드 묘사' }
        ]
      },
      {
        "value": '비즈니스 일반 & 영업',
        "label": '비즈니스 일반 & 영업',
        "subCategories": [
          { "value": '비즈니스 이메일', "label": '비즈니스 이메일' },
          { "value": '문서 및 보고서', "label": '문서 및 보고서' },
          { "value": '발표 및 스피치', "label": '발표 및 스피치' },
          { "value": '협상 및 커뮤니케이션', "label": '협상 및 커뮤니케이션' }
        ]
      },
      {
        "value": '인사 & 조직문화',
        "label": '인사 & 조직문화',
        "subCategories": [
          { "value": '채용(Recruiting)', "label": '채용(Recruiting)' },
          { "value": '온보딩 & 교육', "label": '온보딩 & 교육' },
          { "value": '평가 & 피드백', "label": '평가 & 피드백' }
        ]
      },
      {
        "value": '고객 경험 & 지원 (CS/CX)',
        "label": '고객 경험 & 지원 (CS/CX)',
        "subCategories": [
          { "value": '고객 응대', "label": '고객 응대' },
          { "value": '챗봇 시나리오', "label": '챗봇 시나리오' },
          { "value": '설문조사', "label": '설문조사' }
        ]
      }
    ]

    count = 0
    for i, cat_data in enumerate(JOB_CATEGORIES):
        # Check if parent category exists
        parent = session.exec(select(Category).where(Category.name == cat_data["label"])).first()
        
        if not parent:
            parent = Category(
                name=cat_data["label"],
                value=cat_data["value"],
                order=i
            )
            session.add(parent)
            session.commit()
            session.refresh(parent)
            count += 1
        
        # Process subcategories
        if "subCategories" in cat_data:
            for j, sub_data in enumerate(cat_data["subCategories"]):
                sub = session.exec(select(Category).where(Category.name == sub_data["label"], Category.parent_id == parent.id)).first()
                
                if not sub:
                    sub = Category(
                        name=sub_data["label"],
                        value=sub_data["value"],
                        parent_id=parent.id,
                        order=j
                    )
                    session.add(sub)
                    count += 1
    
    session.commit()
    return {"message": f"Categories synced. {count} new categories created."}

@router.get("/categories/{category_id}/templates", response_model=List[PromptTemplate])
def list_category_onboarding_templates(
    category_id: uuid.UUID,
    session: Session = Depends(get_session)
):
    """
    Get templates explicitly linked to this category for onboarding recommendations.
    Uses the CategoryTemplateLink join table.
    """
    category = session.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
        
    return category.onboarding_templates


@router.post("/categories/{category_id}/templates/{template_id}")
def link_template_to_category_onboarding(
    category_id: uuid.UUID, 
    template_id: uuid.UUID, 
    session: Session = Depends(get_session)
):
    """
    Link a template to a category for Onboarding recommendations.
    does NOT change the template's physical category_id.
    """
    link = session.exec(
        select(CategoryTemplateLink)
        .where(
            CategoryTemplateLink.category_id == category_id,
            CategoryTemplateLink.template_id == template_id
        )
    ).first()
    
    if not link:
        new_link = CategoryTemplateLink(category_id=category_id, template_id=template_id)
        session.add(new_link)
        session.commit()
        
    return {"message": "Template linked for onboarding"}

@router.delete("/categories/{category_id}/templates/{template_id}")
def unlink_template_from_category_onboarding(
    category_id: uuid.UUID, 
    template_id: uuid.UUID, 
    session: Session = Depends(get_session)
):
    """
    Unlink a template from a category's Onboarding recommendations.
    Does NOT delete the template.
    """
    link = session.exec(
        select(CategoryTemplateLink)
        .where(
            CategoryTemplateLink.category_id == category_id,
            CategoryTemplateLink.template_id == template_id
        )
    ).first()
    
    if not link:
        raise HTTPException(status_code=404, detail="Link not found")
        
    session.delete(link)
    session.commit()
    return {"message": "Template unlinked from onboarding"}

# --- Template Management ---

@router.get("/templates", response_model=List[PromptTemplate])
def list_templates(
    skip: int = 0, 
    limit: int = 50,
    category_id: Optional[uuid.UUID] = None,
    sub_category_value: Optional[str] = Query(None, alias="subCategory"),
    mode: Optional[PromptMode] = None,
    search: Optional[str] = None,
    has_image: Optional[bool] = Query(None, alias="hasImage"),
    uncategorized: Optional[bool] = Query(None),
    session: Session = Depends(get_session)
):
    query = select(PromptTemplate)
    
    if sub_category_value:
        # Find category by value
        category = session.exec(select(Category).where(Category.value == sub_category_value)).first()
        if category:
            category_id = category.id
    
    if uncategorized:
        query = query.where(PromptTemplate.category_id == None)
    elif category_id:
        # Check if it's a parent category and include children if so
        # We need to query Category table
        children = session.exec(select(Category.id).where(Category.parent_id == category_id)).all()
        
        if children:
            # It has children, so include them in the filter
            # children is a list of IDs because we selected Category.id
            target_ids = list(children)
            target_ids.append(category_id)
            query = query.where(PromptTemplate.category_id.in_(target_ids))
        else:
            # No children, just filter by this ID
            query = query.where(PromptTemplate.category_id == category_id)
        
    if mode:
        query = query.where(PromptTemplate.mode == mode)
        
    if search:
        query = query.where(PromptTemplate.content.contains(search))
    
    if has_image is not None:
        if has_image:
            query = query.where(PromptTemplate.preview_image_url != None, PromptTemplate.preview_image_url != "")
        else:
            query = query.where((PromptTemplate.preview_image_url == None) | (PromptTemplate.preview_image_url == ""))
        
    return session.exec(query.offset(skip).limit(limit)).all()

@router.post("/templates", response_model=PromptTemplate)
def create_template(template: PromptTemplate, session: Session = Depends(get_session)):
    if template.is_default and template.category_id:
        # Unset other defaults
        others = session.exec(select(PromptTemplate).where(
            PromptTemplate.category_id == template.category_id,
            PromptTemplate.is_default == True
        )).all()
        for other in others:
            other.is_default = False
            session.add(other)
            
    session.add(template)
    session.commit()
    session.refresh(template)
    return template

@router.put("/templates/{template_id}", response_model=PromptTemplate)
def update_template(template_id: uuid.UUID, template_data: PromptTemplateUpdate, session: Session = Depends(get_session)):
    template = session.get(PromptTemplate, template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    template_data_dict = template_data.dict(exclude_unset=True)
    
    # Check if setting to default
    if template_data_dict.get("is_default") and template.category_id:
        others = session.exec(select(PromptTemplate).where(
            PromptTemplate.category_id == template.category_id,
            PromptTemplate.is_default == True,
            PromptTemplate.id != template_id
        )).all()
        for other in others:
            other.is_default = False
            session.add(other)

    for key, value in template_data_dict.items():
        setattr(template, key, value)
        
    session.add(template)
    session.commit()
    session.refresh(template)
    return template

@router.delete("/templates/{template_id}")
def delete_template(template_id: uuid.UUID, session: Session = Depends(get_session)):
    template = session.get(PromptTemplate, template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    session.delete(template)
    session.commit()
    return {"message": "Template deleted"}

# --- Project Management ---

@router.get("/projects")
def list_projects(
    skip: int = 0, 
    limit: int = 100, 
    session: Session = Depends(get_session)
):
    # Fetch projects with owner info
    # SQLModel doesn't support joinedload easily in simple select for Pydantic response without defining a specific Read model with relationships.
    # For simplicity, we'll fetch projects and manually attach owner email or use a custom query.
    
    projects = session.exec(select(Project).offset(skip).limit(limit)).all()
    
    # Enrich with owner info
    result = []
    for p in projects:
        owner = session.get(User, p.owner_id)
        result.append({
            "id": p.id,
            "title": p.title,
            "description": p.description,
            "owner_email": owner.email if owner else "Unknown",
            "owner_name": owner.name if owner else "Unknown",
            "node_count": len(p.nodes) if p.nodes else 0,
            "created_at": p.created_at,
            "updated_at": p.updated_at
        })
        
    return result

@router.delete("/projects/{project_id}")
def delete_project(project_id: uuid.UUID, session: Session = Depends(get_session)):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    session.delete(project)
    session.commit()
    return {"message": "Project deleted"}
