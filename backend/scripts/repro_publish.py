import sys
import os
import uuid
from sqlmodel import Session, select, create_engine
from datetime import datetime

# Adjust path to import backend modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from models import User, Project, ProjectNode, Team, TeamMember, TeamRole, ProjectNode
from database import engine

def test_publish_copy():
    with Session(engine) as session:
        # 1. Setup Data
        owner_id = uuid.uuid4()
        user = User(id=owner_id, email=f"test_owner_{owner_id}@example.com", name="Test Owner")
        session.add(user)
        session.commit() # Commit User first

        
        team_id = uuid.uuid4()
        team = Team(id=team_id, name="Test Team", owner_id=owner_id)
        session.add(team)
        
        member = TeamMember(team_id=team_id, user_id=owner_id, role=TeamRole.OWNER)
        session.add(member)
        
        project_id = uuid.uuid4()
        project = Project(
            id=project_id, 
            title="Original Project", 
            owner_id=owner_id,
            team_id=None # Personal
        )
        session.add(project)
        
        node_data = {
            "label": "Important Node",
            "promptTitle": "Cached Title",
            "promptSummary": "Cached Summary"
        }
        
        node = ProjectNode(
            project_id=project_id,
            type="prompt",
            position_x=100,
            position_y=100,
            data=node_data
        )
        session.add(node)
        session.commit()
        
        print(f"Original Node Data: {node.data}")
        
        # 2. Simulate Publish (Clone)
        # Logic from routers/projects.py
        
        new_project = Project(
            title=f"{project.title} (Published)",
            description=project.description,
            owner_id=owner_id,
            team_id=team_id,
            data=project.data
        )
        session.add(new_project)
        session.commit()
        session.refresh(new_project)
        
        # Clone Nodes
        # Use a fresh select to ensure we get what DB has
        original_nodes = session.exec(select(ProjectNode).where(ProjectNode.project_id == project_id)).all()
        
        for n in original_nodes:
            # COPY LOGIC HERE
            # import copy
            # data_copy = copy.deepcopy(n.data) if n.data else {}
            
            new_node = ProjectNode(
                project_id=new_project.id,
                prompt_id=n.prompt_id,
                type=n.type,
                position_x=n.position_x,
                position_y=n.position_y,
                data=n.data # match production code
            )
            session.add(new_node)
        
        session.commit()
        
        # 3. Verify
        new_nodes = session.exec(select(ProjectNode).where(ProjectNode.project_id == new_project.id)).all()
        print(f"New Project ID: {new_project.id}")
        for nn in new_nodes:
            print(f"New Node Data: {nn.data}")
            if nn.data == node_data:
                print("SUCCESS: Data preserved.")
            else:
                print("FAILURE: Data lost or mismatch.")
                print(f"Expected: {node_data}")
                print(f"Actual:   {nn.data}")

if __name__ == "__main__":
    try:
        test_publish_copy()
    except Exception as e:
        print(f"Error: {e}")
