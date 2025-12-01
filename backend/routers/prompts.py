from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
import uuid

from database import get_session
from models import Prompt, PromptCreate, PromptRead, PromptUpdate, User
from dependencies import get_current_user

router = APIRouter(
    prefix="/api/prompts",
    tags=["prompts"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=PromptRead, status_code=status.HTTP_201_CREATED)
def create_prompt(
    prompt: PromptCreate,
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
    limit: int = 100,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    statement = select(Prompt).where(Prompt.owner_id == current_user.id).order_by(Prompt.created_at.desc()).offset(skip).limit(limit)
    prompts = session.exec(statement).all()
    return prompts

@router.get("/{prompt_id}", response_model=PromptRead)
def read_prompt(
    prompt_id: uuid.UUID,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    statement = select(Prompt).where(Prompt.id == prompt_id, Prompt.owner_id == current_user.id)
    prompt = session.exec(statement).first()
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    return prompt

@router.patch("/{prompt_id}", response_model=PromptRead)
def update_prompt(
    prompt_id: uuid.UUID,
    prompt_update: PromptUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    statement = select(Prompt).where(Prompt.id == prompt_id, Prompt.owner_id == current_user.id)
    db_prompt = session.exec(statement).first()
    if not db_prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    
    prompt_data = prompt_update.model_dump(exclude_unset=True)
    for key, value in prompt_data.items():
        setattr(db_prompt, key, value)
        
    session.add(db_prompt)
    session.commit()
    session.refresh(db_prompt)
    return db_prompt

@router.delete("/{prompt_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_prompt(
    prompt_id: uuid.UUID,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    statement = select(Prompt).where(Prompt.id == prompt_id, Prompt.owner_id == current_user.id)
    prompt = session.exec(statement).first()
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    
    session.delete(prompt)
    session.commit()
    return None
