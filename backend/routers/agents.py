from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from typing import List

from database import get_session
from models import AiAgent

router = APIRouter(tags=["agents"])

@router.get("/api/agents", response_model=List[AiAgent])
def get_public_agents(session: Session = Depends(get_session)):
    """Get public list of active agents"""
    statement = select(AiAgent).where(AiAgent.is_active == True).order_by(AiAgent.sort_order, AiAgent.id)
    return session.exec(statement).all()
