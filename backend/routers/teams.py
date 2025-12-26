
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List, Optional
import uuid
from datetime import datetime

from database import get_session
from models import (
    User, UserType, UserRole,
    Team, TeamCreate, TeamRead,
    TeamMember, TeamMemberCreate, TeamMemberRead, TeamRole, Project
)
from dependencies import get_current_user

router = APIRouter(
    prefix="/api/teams",
    tags=["teams"],
    responses={404: {"description": "Not found"}},
)

# 1. Create Team (Enterprise Only)
@router.post("/", response_model=TeamRead)
def create_team(
    team_data: TeamCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    # Check if user is enterprise or pro
    # Check if user is enterprise
    if current_user.user_type != "enterprise": 
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Only Enterprise users can create teams."
        )

    team = Team(
        name=team_data.name,
        owner_id=current_user.id
    )
    session.add(team)
    session.commit()
    session.refresh(team)
    
    # Add owner as member with OWNER role
    member = TeamMember(
        team_id=team.id,
        user_id=current_user.id,
        role=TeamRole.OWNER
    )
    session.add(member)
    session.commit()
    
    return team

# 2. List User's Teams
@router.get("/", response_model=List[TeamRead])
def list_teams(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    # Join TeamMember to find teams where user is a member
    statement = (
        select(Team)
        .join(TeamMember)
        .where(TeamMember.user_id == current_user.id)
    )
    teams = session.exec(statement).all()
    return teams

# 3. List Team Members
@router.get("/{team_id}/members", response_model=List[TeamMemberRead])
def list_team_members(
    team_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    # Check if current user is member of the team
    membership = session.exec(
        select(TeamMember)
        .where(TeamMember.team_id == team_id)
        .where(TeamMember.user_id == current_user.id)
    ).first()
    
    if not membership:
        raise HTTPException(status_code=403, detail="You are not a member of this team.")
    
    # Fetch members with user info
    members = session.exec(
        select(TeamMember, User)
        .join(User, isouter=True) 
        .where(TeamMember.team_id == team_id)
    ).all()
    
    result = []
    for m, u in members:
        # Enriched model
        m_read = TeamMemberRead(
            team_id=m.team_id,
            user_id=m.user_id,
            role=m.role,
            joined_at=m.joined_at,
            user_email=u.email if u else None,
            user_name=u.name if u else None
        )
        result.append(m_read)
        
    return result

# 4. Add Member (Invite)
@router.post("/{team_id}/members", response_model=TeamMemberRead)
def add_team_member(
    team_id: uuid.UUID,
    member_data: TeamMemberCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    # 1. Check requester permissions (Must be Owner or Admin)
    requester_membership = session.exec(
        select(TeamMember)
        .where(TeamMember.team_id == team_id)
        .where(TeamMember.user_id == current_user.id)
    ).first()
    
    if not requester_membership or requester_membership.role not in [TeamRole.OWNER, TeamRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Only Owner or Admin can add members.")
    
    # 2. Find target user by email
    target_user = session.exec(select(User).where(User.email == member_data.user_email)).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found with this email.")
        
    # 3. Check if already member
    existing = session.exec(
        select(TeamMember)
        .where(TeamMember.team_id == team_id)
        .where(TeamMember.user_id == target_user.id)
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="User is already a member.")
        
    # 4. Add Member
    new_member = TeamMember(
        team_id=team_id,
        user_id=target_user.id,
        role=member_data.role
    )
    session.add(new_member)
    session.commit()
    session.refresh(new_member)
    
    return TeamMemberRead(
        team_id=new_member.team_id,
        user_id=new_member.user_id,
        role=new_member.role,
        joined_at=new_member.joined_at,
        user_email=target_user.email,
        user_name=target_user.name
    )

# 5. Update Member Role
@router.patch("/{team_id}/members/{user_id}/role", response_model=TeamMemberRead)
def update_member_role(
    team_id: uuid.UUID,
    user_id: uuid.UUID,
    role: TeamRole,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    # 1. Check requester permissions
    requester_membership = session.exec(
        select(TeamMember)
        .where(TeamMember.team_id == team_id)
        .where(TeamMember.user_id == current_user.id)
    ).first()
    
    if not requester_membership or requester_membership.role not in [TeamRole.OWNER, TeamRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Only Owner or Admin can update roles.")
        
    # 2. Prevent Admin from modifying Owner
    target_membership = session.exec(
        select(TeamMember)
        .where(TeamMember.team_id == team_id)
        .where(TeamMember.user_id == user_id)
    ).first()
    
    if not target_membership:
        raise HTTPException(status_code=404, detail="Member not found.")
        
    if target_membership.role == TeamRole.OWNER:
        if requester_membership.role != TeamRole.OWNER:
             raise HTTPException(status_code=403, detail="Cannot modify Team Owner.")
             
    # 3. Update Role
    target_membership.role = role
    session.add(target_membership)
    session.commit()
    session.refresh(target_membership)
    
    # Fetch user details for response
    user = session.get(User, user_id)
    
    return TeamMemberRead(
        team_id=target_membership.team_id,
        user_id=target_membership.user_id,
        role=target_membership.role,
        joined_at=target_membership.joined_at,
        user_email=user.email if user else None,
        user_name=user.name if user else None
    )

# 6. Remove Member
@router.delete("/{team_id}/members/{user_id}")
def remove_team_member(
    team_id: uuid.UUID,
    user_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    # 1. Check requester permissions
    requester_membership = session.exec(
        select(TeamMember)
        .where(TeamMember.team_id == team_id)
        .where(TeamMember.user_id == current_user.id)
    ).first()
    
    if not requester_membership or requester_membership.role not in [TeamRole.OWNER, TeamRole.ADMIN]:
        # Allow self-leave? Yes.
        if current_user.id != user_id:
             raise HTTPException(status_code=403, detail="Only Owner or Admin can remove members.")
    
    # 2. Get target membership
    target_membership = session.exec(
        select(TeamMember)
        .where(TeamMember.team_id == team_id)
        .where(TeamMember.user_id == user_id)
    ).first()
    
    if not target_membership:
        raise HTTPException(status_code=404, detail="Member not found.")
        
    # 3. Prevent removing Owner (unless deleting team - handled by delete team API)
    if target_membership.role == TeamRole.OWNER and requester_membership.role != TeamRole.OWNER:
         raise HTTPException(status_code=403, detail="Cannot remove Team Owner.")
         
    # 4. If Owner is leaving, they must transfer ownership first (simplification: block owner leaving)
    if target_membership.role == TeamRole.OWNER:
         raise HTTPException(status_code=400, detail="Owner cannot leave team. Delete team or transfer ownership.")

    session.delete(target_membership)
    session.commit()
    
    return {"message": "Member removed successfully"}
