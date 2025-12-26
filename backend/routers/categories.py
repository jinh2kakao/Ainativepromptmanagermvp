from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select, text
import uuid

from database import get_session
from models import Category, PromptTemplate, PromptMode, CategoryRead

import logging

router = APIRouter(
    prefix="/api/categories",
    tags=["categories"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=List[CategoryRead])
def list_categories(session: Session = Depends(get_session)):
    """
    Get all categories.
    Frontend can build the tree structure from parent_id.
    """
    return session.exec(select(Category).order_by(Category.order)).all()

@router.get("/{category_id}/template", response_model=List[PromptTemplate])
def get_category_template(
    category_id: uuid.UUID,
    mode: PromptMode = Query(..., description="Prompt mode (simple or assistance)"),
    session: Session = Depends(get_session)
):
    """
    Get all templates for a specific category and mode.
    """
    statement = select(PromptTemplate).where(
        PromptTemplate.category_id == category_id,
        PromptTemplate.mode == mode
    )
    templates = session.exec(statement).all()
    
    if not templates:
        # Return empty list instead of 404 to handle cases with no templates gracefully
        return []
    
    return templates
