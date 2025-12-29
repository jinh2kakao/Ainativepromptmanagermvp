from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlmodel import Session, select
from typing import List
from sqlalchemy import text
import uuid

from database import get_session
from models import Prompt, PromptCreate, PromptRead, PromptUpdate, User, UserRole, PromptEvaluation
from dependencies import get_current_user

router = APIRouter(
    prefix="/api/prompts",
    tags=["prompts"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=PromptRead, status_code=status.HTTP_201_CREATED)
def create_prompt(
    prompt: PromptCreate,
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    db_prompt = Prompt.model_validate(prompt)
    db_prompt.owner_id = current_user.id
    session.add(db_prompt)
    session.commit()
    session.refresh(db_prompt)

    return db_prompt

@router.get("/", response_model=List[PromptRead])
def read_prompts(
    skip: int = 0,
    limit: int = 1000, # Increased limit
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    from sqlmodel import or_

    # User request: Should ONLY see their own prompts in "My Prompts" view
    # Public prompts should be fetched via a separate Discovery/Community endpoint if needed.
    statement = select(Prompt).where(
        Prompt.owner_id == current_user.id
    ).order_by(Prompt.created_at.desc()).offset(skip).limit(limit)
    
    prompts = session.exec(statement).all()
    
    # Enrich with latest scores using SQLModel
    scores_map = {}
    if prompts:
        prompt_ids = [p.id for p in prompts]
        # Fetch evaluations for these prompts
        evals_query = select(PromptEvaluation).where(PromptEvaluation.template_id.in_(prompt_ids)).order_by(PromptEvaluation.created_at.asc())
        evals = session.exec(evals_query).all()
        
        # Process in python
        for e in evals:
             scores_map[str(e.template_id)] = e.total_score

    result = []
    for p in prompts:
        # Convert to PromptRead explicitly to add extra field
        p_read = PromptRead.model_validate(p)
        p_read.latest_score = scores_map.get(str(p.id))
        result.append(p_read)
        
    return result

@router.get("/{prompt_id}", response_model=PromptRead)
def read_prompt(
    prompt_id: uuid.UUID,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    from sqlmodel import or_
    
    if current_user.role == UserRole.ADMIN:
        statement = select(Prompt).where(Prompt.id == prompt_id)
    else:
        # For individual prompt view, we still allow seeing public prompts
        # This supports sharing links
        statement = select(Prompt).where(
            Prompt.id == prompt_id,
            or_(Prompt.owner_id == current_user.id, Prompt.is_public == True)
        )
        
    prompt = session.exec(statement).first()
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
        
    # Enrich with score
    p_read = PromptRead.model_validate(prompt)
    
    # Correctly query PromptEvaluation using SQLModel
    latest_eval = session.exec(
        select(PromptEvaluation)
        .where(PromptEvaluation.template_id == prompt.id)
        .order_by(PromptEvaluation.created_at.desc())
    ).first()
    
    if latest_eval:
        p_read.latest_score = latest_eval.total_score
        
    return p_read

@router.patch("/{prompt_id}", response_model=PromptRead)
def update_prompt(
    prompt_id: uuid.UUID,
    prompt_update: PromptUpdate,
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == UserRole.ADMIN:
        statement = select(Prompt).where(Prompt.id == prompt_id)
    else:
        statement = select(Prompt).where(Prompt.id == prompt_id, Prompt.owner_id == current_user.id)
        
    db_prompt = session.exec(statement).first()
    if not db_prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    
    prompt_data = prompt_update.model_dump(exclude_unset=True)
    
    # DEBUG: Log incoming update data
    print(f"[DEBUG] Updating prompt {prompt_id}")
    print(f"[DEBUG] Raw payload: {prompt_data}")
    print(f"[DEBUG] applicable_agents in payload: {prompt_data.get('applicable_agents')}")
    
    for key, value in prompt_data.items():
        setattr(db_prompt, key, value)
        
    session.add(db_prompt)
    session.commit()
    session.refresh(db_prompt)
    
    # DEBUG: Log saved state
    print(f"[DEBUG] Saved prompt applicable_agents: {db_prompt.applicable_agents}")

    # Trigger Evaluation if content changed - REMOVED per user request
    # if "content" in prompt_data and prompt_data["content"]:
    #      from services.evaluation import run_evaluation
    #      background_tasks.add_task(run_evaluation, db_prompt.id, db_prompt.content)

    return db_prompt

@router.delete("/{prompt_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_prompt(
    prompt_id: uuid.UUID,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == UserRole.ADMIN:
        statement = select(Prompt).where(Prompt.id == prompt_id)
    else:
        statement = select(Prompt).where(Prompt.id == prompt_id, Prompt.owner_id == current_user.id)
        
    prompt = session.exec(statement).first()
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    
    # Manually delete dependent records to avoid Foreign Key violations
    # 1. Delete PromptOptimizations
    from models import PromptOptimization, PromptEvaluation, OptimizationJob, ProjectNode
    session.exec(text(f"DELETE FROM promptoptimization WHERE template_id = '{prompt_id}'"))
    
    # 2. Delete PromptEvaluations
    session.exec(text(f"DELETE FROM promptevaluation WHERE template_id = '{prompt_id}'"))

    # 3. Delete OptimizationJobs
    session.exec(text(f"DELETE FROM optimizationjob WHERE template_id = '{prompt_id}'"))

    # 4. Unlink ProjectNodes (Set prompt_id to NULL)
    session.exec(text(f"UPDATE projectnode SET prompt_id = NULL WHERE prompt_id = '{prompt_id}'"))

    session.delete(prompt)
    session.commit()
    return None
