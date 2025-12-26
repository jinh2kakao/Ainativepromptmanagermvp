
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta

from database import get_session
from models import Project, ProjectNode, User, TeamMember, TeamRole, Team
from dependencies import get_current_user

router = APIRouter(
    prefix="/api/projects",
    tags=["projects"],
    responses={404: {"description": "Not found"}},
)

LOCK_TIMEOUT_MINUTES = 30 # Auto-unlock after inactivity (logic to be implemented or just checked)

# --- Helper: Check Permissions ---
def check_project_access(session: Session, project: Project, user: User, required_role: Optional[List[TeamRole]] = None) -> bool:
    """
    Checks if user has access to project.
    - If Personal Project: Must be Owner.
    - If Team Project: Must be Member of Team.
    - If required_role provided: Must have at least that role (or higher).
    """
    # 1. Personal Project
    if not project.team_id:
        if project.owner_id == user.id:
            return True
        return False
        
    # 2. Team Project
    # Fetch membership
    member = session.exec(
        select(TeamMember)
        .where(TeamMember.team_id == project.team_id)
        .where(TeamMember.user_id == user.id)
    ).first()
    
    if not member:
        return False
        
    if required_role:
        if member.role in required_role:
            return True
        # Hierarchy check? For now simplified list check.
        # Owner/Admin usually have all permissions.
        if member.role in [TeamRole.OWNER, TeamRole.ADMIN]:
            return True
        return False
        
    return True # Basic read access

# --- Project CRUD ---

@router.get("/", response_model=List[Project])
def read_projects(
    team_id: Optional[uuid.UUID] = None,
    offset: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    query = select(Project)
    
    if team_id:
        # Check team membership first
        member = session.exec(
            select(TeamMember)
            .where(TeamMember.team_id == team_id)
            .where(TeamMember.user_id == current_user.id)
        ).first()
        if not member:
            return [] # Or raise 403
            
        query = query.where(Project.team_id == team_id)
    else:
        # Personal projects only (or all accessible? simpler to split)
        # "Personal Workspace"
        query = query.where(Project.owner_id == current_user.id).where(Project.team_id == None)
        
    query = query.offset(offset).limit(limit)
    projects = session.exec(query).all()
    return projects

@router.post("/", response_model=Project)
def create_project(
    project_data: Dict[str, Any],
    team_id: Optional[uuid.UUID] = Query(None), # Optional query param to create in team
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    # Check Team Permissions if creating in team
    final_team_id = team_id
    if "team_id" in project_data: # prioritize body
         if project_data["team_id"]:
             final_team_id = uuid.UUID(str(project_data["team_id"]))

    if final_team_id:
        member = session.exec(
            select(TeamMember)
            .where(TeamMember.team_id == final_team_id)
            .where(TeamMember.user_id == current_user.id)
        ).first()
        # Viewers cannot create projects
        if not member or member.role == TeamRole.VIEWER:
            raise HTTPException(status_code=403, detail="Not authorized to create projects in this team")
            
    project = Project(
        title=project_data.get("title"),
        description=project_data.get("description"),
        owner_id=current_user.id,
        team_id=final_team_id,
        data=project_data.get("data")
    )
    session.add(project)
    session.commit()
    session.refresh(project)
    return project

@router.get("/{project_id}", response_model=Dict[str, Any])
def read_project(
    project_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    if not check_project_access(session, project, current_user):
        raise HTTPException(status_code=403, detail="Not authorized to view this project")
    
    nodes = session.exec(select(ProjectNode).where(ProjectNode.project_id == project_id)).all()
    
    # Enriched response with lock status check (expire lock if old?)
    # Simple check-on-read for lock timeout?
    # If locked_at is > 30 mins ago, implied unlocked? 
    # Let's keep it simple: Raw data. Client handles "Last locked 2 hours ago".
    
    return {
        "id": project.id,
        "title": project.title,
        "description": project.description,
        "created_at": project.created_at,
        "updated_at": project.updated_at,
        "owner_id": project.owner_id,
        "team_id": project.team_id,
        "locked_by": project.locked_by,
        "locked_at": project.locked_at,
        "data": project.data,
        "nodes": nodes
    }

@router.patch("/{project_id}", response_model=Project)
def update_project(
    project_id: uuid.UUID,
    project_update: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Permission: Editor+
    if not check_project_access(session, project, current_user, required_role=[TeamRole.EDITOR, TeamRole.ADMIN, TeamRole.OWNER]):
         raise HTTPException(status_code=403, detail="Not authorized to edit this project")
    
    # Lock Check (If Team Project)
    if project.team_id:
        if project.locked_by and project.locked_by != current_user.id:
            # Check timeout? 
            # If strictly locked, deny.
            raise HTTPException(status_code=409, detail=f"Project is currently locked by another user.")
    
    if "title" in project_update:
        project.title = project_update["title"]
    if "description" in project_update:
        project.description = project_update["description"]
    if "data" in project_update:
        project.data = project_update["data"]
    
    project.updated_at = datetime.utcnow()
    session.add(project)
    session.commit()
    session.refresh(project)
    return project

@router.delete("/{project_id}")
def delete_project(
    project_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    # Permission: Owner only for personal, Admin/Owner for Team
    if project.team_id:
        if not check_project_access(session, project, current_user, required_role=[TeamRole.ADMIN, TeamRole.OWNER]):
            raise HTTPException(status_code=403, detail="Only Team Admin/Owner can delete projects")
    else:
        if project.owner_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to delete this project")
    
    session.delete(project)
    session.commit()
    return {"ok": True}

# --- Locking ---

@router.post("/{project_id}/lock", response_model=Dict[str, Any])
def lock_project(
    project_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    if not check_project_access(session, project, current_user, required_role=[TeamRole.EDITOR, TeamRole.ADMIN, TeamRole.OWNER]):
        raise HTTPException(status_code=403, detail="Not authorized to lock (edit) this project")
        
    if project.locked_by and project.locked_by != current_user.id:
        # Check Force Unlock logic or Timeout here if needed
        raise HTTPException(status_code=409, detail="Project is already locked by another user")
        
    project.locked_by = current_user.id
    project.locked_at = datetime.utcnow()
    session.add(project)
    session.commit()
    
    return {"status": "locked", "locked_by": project.locked_by, "locked_at": project.locked_at}

@router.post("/{project_id}/unlock", response_model=Dict[str, Any])
def unlock_project(
    project_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Only Locker or Admin can unlock
    is_locker = (project.locked_by == current_user.id)
    # Check Admin
    is_admin = False
    if project.team_id:
        member = session.exec(select(TeamMember).where(TeamMember.team_id == project.team_id).where(TeamMember.user_id == current_user.id)).first()
        if member and member.role in [TeamRole.ADMIN, TeamRole.OWNER]:
            is_admin = True
            
    if not is_locker and not is_admin:
         raise HTTPException(status_code=403, detail="Cannot unlock project locked by another user (unless Admin)")
         
    project.locked_by = None
    project.locked_at = None
    session.add(project)
    session.commit()
    
    return {"status": "unlocked"}

# --- Publishing ---

@router.post("/{project_id}/publish") # Removed response_model
def publish_project(
    project_id: uuid.UUID,
    team_id: uuid.UUID = Query(...), 
    overwrite: bool = Query(False), # Added overwrite flag
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Clones a personal project to a team.
    If overwrite is True, it will replace an existing project with the same title in the team.
    """
    print(f"DEBUG: Publishing Project {project_id} to Team {team_id} (Overwrite: {overwrite})")
    original_project = session.get(Project, project_id)
    if not original_project:
        raise HTTPException(status_code=404, detail="Original project not found")
        
    # Check ownership of original
    if original_project.owner_id != current_user.id:
         raise HTTPException(status_code=403, detail="You can only publish your own projects")
         
    # Check destination team access (Editor+)
    member = session.exec(
        select(TeamMember)
        .where(TeamMember.team_id == team_id)
        .where(TeamMember.user_id == current_user.id)
    ).first()
    
    if not member or member.role == TeamRole.VIEWER:
         raise HTTPException(status_code=403, detail="You do not have permission to create projects in this team")
    
    # Check for existing project in team
    existing_project = session.exec(
        select(Project)
        .where(Project.team_id == team_id)
        .where(Project.title == original_project.title) # Or use f"{original_project.title} (Published)" logic?
        # Let's assume we want to maintain the same title? Or strictly check for collision?
        # If user wants to overwrite, we assume they mean the project with the same name.
    ).first()

    target_project = None
    
    import copy
    import sys

    # Logic:
    # 1. If existing found:
    #    - If overwrite: Use existing.
    #    - If not overwrite: Error 409 (Conflict) -> Frontend should ask user.
    # 2. If not found: Create new.
    
    if existing_project:
        if overwrite:
            print(f"DEBUG: Overwriting existing project {existing_project.id}")
            target_project = existing_project
            # Update metadata
            target_project.description = original_project.description
            target_project.updated_at = datetime.utcnow()
            
            # Clear existing nodes
            existing_nodes = session.exec(select(ProjectNode).where(ProjectNode.project_id == target_project.id)).all()
            for n in existing_nodes:
                session.delete(n)
        else:
             raise HTTPException(status_code=409, detail="Project with this name already exists in the team")
    else:
        # Create New
        target_project = Project(
            title=original_project.title,
            description=original_project.description,
            owner_id=current_user.id,
            team_id=team_id,
            data=copy.deepcopy(original_project.data) # Initial copy
        )
        session.add(target_project)
    
    session.flush() # Ensure ID
    
    # Clone Nodes and Build Map
    original_nodes = session.exec(select(ProjectNode).where(ProjectNode.project_id == project_id)).all()
    node_id_map = {} # old_id -> new_id
    
    for node in original_nodes:
        # Safe Copy Data
        new_data = copy.deepcopy(node.data) if node.data else {}

        new_node = ProjectNode(
            project_id=target_project.id,
            prompt_id=node.prompt_id,
            type=node.type,
            position_x=node.position_x,
            position_y=node.position_y,
            data=new_data
        )
        session.add(new_node)
        session.flush() # Need new ID
        node_id_map[str(node.id)] = str(new_node.id)
        
    # Update Edges in Project Data
    # Edges are stored in project.data['edges'] usually
    final_data = copy.deepcopy(original_project.data) if original_project.data else {}
    
    if 'edges' in final_data and isinstance(final_data['edges'], list):
        updated_edges = []
        for edge in final_data['edges']:
            # edge structure: { id, source, target, ... }
            new_source = node_id_map.get(edge.get('source'))
            new_target = node_id_map.get(edge.get('target'))
            
            if new_source and new_target:
                new_edge = copy.deepcopy(edge)
                new_edge['source'] = new_source
                new_edge['target'] = new_target
                # Also update edge ID to avoid collision if strict? 
                # React Flow Edge IDs usually just need to be unique in the flow.
                # Transforming ID might be good practice: f"e-{new_source}-{new_target}" or uuid
                new_edge['id'] = f"e-{new_source}-{new_target}" 
                updated_edges.append(new_edge)
            else:
                print(f"WARNING: skipped edge {edge.get('id')} because source/target not found in map")
        
        final_data['edges'] = updated_edges
        
    target_project.data = final_data
    session.add(target_project)
    session.commit()
    session.refresh(target_project)

    resp_data = {
        "id": target_project.id,
        "title": target_project.title,
        "team_id": target_project.team_id,
        "owner_id": target_project.owner_id
    }
    return resp_data
    

# --- Node Management (Updated for Perms) ---

@router.post("/{project_id}/nodes", response_model=ProjectNode)
def create_node(
    project_id: uuid.UUID,
    node_data: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    # Check Edit Perms
    if not check_project_access(session, project, current_user, required_role=[TeamRole.EDITOR, TeamRole.ADMIN, TeamRole.OWNER]):
         raise HTTPException(status_code=403, detail="Not authorized to edit")
         
    # Lock Check
    if project.team_id and project.locked_by and project.locked_by != current_user.id:
         raise HTTPException(status_code=409, detail="Project is locked")

    node = ProjectNode(
        project_id=project_id,
        prompt_id=node_data.get("prompt_id"), 
        type=node_data.get("type", "prompt"),
        position_x=node_data.get("position_x", 0.0),
        position_y=node_data.get("position_y", 0.0),
        data=node_data.get("data", {})
    )
    session.add(node)
    session.commit()
    session.refresh(node)
    return node

@router.patch("/{project_id}/nodes/{node_id}", response_model=ProjectNode)
def update_node(
    project_id: uuid.UUID,
    node_id: uuid.UUID,
    node_update: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    node = session.get(ProjectNode, node_id)
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
    
    project = session.get(Project, project_id)
    # Verify Perms & Lock
    if not check_project_access(session, project, current_user, required_role=[TeamRole.EDITOR, TeamRole.ADMIN, TeamRole.OWNER]):
         raise HTTPException(status_code=403, detail="Not authorized")
    if project.team_id and project.locked_by and project.locked_by != current_user.id:
         raise HTTPException(status_code=409, detail="Project is locked")
        
    if "position_x" in node_update:
        node.position_x = node_update["position_x"]
    if "position_y" in node_update:
        node.position_y = node_update["position_y"]
    if "data" in node_update:
        node.data = node_update["data"]
    if "prompt_id" in node_update:
        node.prompt_id = node_update["prompt_id"]
        
    session.add(node)
    session.commit()
    session.refresh(node)
    return node

@router.delete("/{project_id}/nodes/{node_id}")
def delete_node(
    project_id: uuid.UUID,
    node_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    node = session.get(ProjectNode, node_id)
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
        
    project = session.get(Project, project_id)
    if not check_project_access(session, project, current_user, required_role=[TeamRole.EDITOR, TeamRole.ADMIN, TeamRole.OWNER]):
         raise HTTPException(status_code=403, detail="Not authorized")
    if project.team_id and project.locked_by and project.locked_by != current_user.id:
         raise HTTPException(status_code=409, detail="Project is locked")
        
    session.delete(node)
    session.commit()
    return {"ok": True}

@router.put("/{project_id}/nodes/batch")
def batch_update_nodes(
    project_id: uuid.UUID,
    nodes_data: List[Dict[str, Any]],
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Batch update nodes (mostly for position updates)
    """
    project = session.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
        
    if not check_project_access(session, project, current_user, required_role=[TeamRole.EDITOR, TeamRole.ADMIN, TeamRole.OWNER]):
         raise HTTPException(status_code=403, detail="Not authorized")
    if project.team_id and project.locked_by and project.locked_by != current_user.id:
         raise HTTPException(status_code=409, detail="Project is locked")
        
    updated_nodes = []
    for data in nodes_data:
        node_id = data.get("id")
        if not node_id:
            continue
            
        node = session.get(ProjectNode, node_id)
        if node and node.project_id == project_id:
            if "position" in data:
                node.position_x = data["position"]["x"]
                node.position_y = data["position"]["y"]
            if "data" in data:
                node.data = data["data"]
            session.add(node)
            updated_nodes.append(node)
            
    session.commit()
    return {"ok": True, "count": len(updated_nodes)}
