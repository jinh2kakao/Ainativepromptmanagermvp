
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List, Optional
from database import get_session
from models import AiAgent, User, UserRole
from routers.auth import get_current_user

router = APIRouter(prefix="/api/admin/agents", tags=["admin-agents"])

# Check admin permission
def check_admin(user: User = Depends(get_current_user)):
    if user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Admin permission required")
    return user

@router.get("/", response_model=List[AiAgent])
def get_agents(session: Session = Depends(get_session)):
    """Get all agents, ordered by sort_order"""
    statement = select(AiAgent).order_by(AiAgent.sort_order, AiAgent.id)
    agents = session.exec(statement).all()
    return agents

@router.post("/", response_model=AiAgent)
def create_agent(agent: AiAgent, user: User = Depends(check_admin), session: Session = Depends(get_session)):
    """Create a new agent"""
    existing = session.get(AiAgent, agent.id)
    if existing:
        raise HTTPException(status_code=400, detail="Agent ID already exists")
    
    session.add(agent)
    session.commit()
    session.refresh(agent)
    return agent

@router.put("/{agent_id}", response_model=AiAgent)
def update_agent(agent_id: str, agent_update: AiAgent, user: User = Depends(check_admin), session: Session = Depends(get_session)):
    """Update an existing agent"""
    existing = session.get(AiAgent, agent_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    # Update fields
    existing.name = agent_update.name
    existing.group = agent_update.group
    existing.is_active = agent_update.is_active
    existing.sort_order = agent_update.sort_order
    
    session.add(existing)
    session.commit()
    session.refresh(existing)
    return existing

@router.delete("/{agent_id}")
def delete_agent(agent_id: str, user: User = Depends(check_admin), session: Session = Depends(get_session)):
    """Delete an agent"""
    existing = session.get(AiAgent, agent_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    session.delete(existing)
    session.commit()
    return {"message": "Agent deleted"}
