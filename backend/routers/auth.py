from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select, SQLModel
from typing import Annotated, Optional
import uuid

from database import get_session
from models import User, Prompt, PromptEvaluation, OptimizationJob
from dependencies import get_current_user
from core.config import AI_LIMITS, DEFAULT_LIMIT
import datetime
import os

router = APIRouter(
    prefix="/api/auth",
    tags=["auth"],
    responses={404: {"description": "Not found"}},
)

@router.post("/migrate", status_code=status.HTTP_200_OK)
def migrate_guest_data(
    guest_id: str,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    """
    Migrate data from a guest user to the currently logged-in user.
    """
    try:
        guest_uuid = uuid.UUID(guest_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid Guest ID format")

    # Verify guest user exists
    guest_user = session.exec(select(User).where(User.id == guest_uuid)).first()
    if not guest_user:
        # If guest user doesn't exist, maybe they never created any data.
        # We can just return success.
        return {"message": "No guest data found to migrate"}

    # Prevent migrating to self (shouldn't happen if logic is correct)
    if guest_user.id == current_user.id:
        return {"message": "Source and target users are the same"}

    migrated_count = 0
    migrated_projects_count = 0
    try:
        # 1. Reassign Prompts
        # Check for title collisions to avoid Unique Constraint violations
        existing_prompt_titles = session.exec(select(Prompt.title).where(Prompt.owner_id == current_user.id)).all()
        existing_prompt_titles_set = set(existing_prompt_titles)

        prompts = session.exec(select(Prompt).where(Prompt.owner_id == guest_uuid)).all()
        migrated_count = len(prompts)
        
        for prompt in prompts:
            # Handle duplicates logic
            if prompt.title in existing_prompt_titles_set:
                original_title = prompt.title
                counter = 1
                new_title = f"{original_title} (Migrated)"
                while new_title in existing_prompt_titles_set:
                    counter += 1
                    new_title = f"{original_title} (Migrated {counter})"
                prompt.title = new_title
                
            # Add to set so we track it for subsequent iterations
            existing_prompt_titles_set.add(prompt.title)
            
            prompt.owner_id = current_user.id
            session.add(prompt)

        # 2. Reassign Projects
        from models import Project
        existing_project_titles = session.exec(select(Project.title).where(Project.owner_id == current_user.id)).all()
        existing_project_titles_set = set(existing_project_titles)
        
        projects = session.exec(select(Project).where(Project.owner_id == guest_uuid)).all()
        migrated_projects_count = len(projects)

        for project in projects:
            # Handle duplicates logic
            if project.title in existing_project_titles_set:
                original_title = project.title
                counter = 1
                new_title = f"{original_title} (Migrated)"
                while new_title in existing_project_titles_set:
                    counter += 1
                    new_title = f"{original_title} (Migrated {counter})"
                project.title = new_title

            existing_project_titles_set.add(project.title)

            project.owner_id = current_user.id
            session.add(project)
        
        session.commit()
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Migration failed during data reassignment: {str(e)}"
        )

    # 3. Delete Guest User (Separate Transaction)
    try:
        session.delete(guest_user)
        session.commit()
    except Exception as e:
        # Log error but don't fail the request since data is already migrated
        print(f"Warning: Failed to delete guest user {guest_uuid}: {e}")
        session.rollback()

    return {
        "message": "Migration successful",
        "migrated_prompts": migrated_count,
        "migrated_projects": migrated_projects_count
    }

@router.get("/me", response_model=User)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/usage")
def get_user_usage(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    today = datetime.datetime.utcnow().date()
    start_of_day = datetime.datetime.combine(today, datetime.time.min)
    
    # 1. Count Evaluations
    eval_statement = (
        select(PromptEvaluation)
        .join(Prompt, Prompt.id == PromptEvaluation.template_id)
        .where(Prompt.owner_id == current_user.id)
        .where(PromptEvaluation.created_at >= start_of_day)
    )
    eval_count = len(session.exec(eval_statement).all())
    
    # 2. Count Optimizations
    opt_statement = (
        select(OptimizationJob)
        .join(Prompt, Prompt.id == OptimizationJob.template_id)
        .where(Prompt.owner_id == current_user.id)
        .where(OptimizationJob.created_at >= start_of_day)
    )
    opt_count = len(session.exec(opt_statement).all())
    
    limit = AI_LIMITS.get(current_user.user_type, DEFAULT_LIMIT)
    
    return {
        "optimizations": {
            "current": opt_count,
            "limit": limit
        },
        "evaluations": {
            "current": eval_count,
            "limit": limit
        }
    }


class EmailCheckRequest(SQLModel):
    email: str

@router.post("/check-email")
def check_email_exists(
    request: EmailCheckRequest,
    session: Session = Depends(get_session)
):
    """
    Check if a user with the given email already exists.
    Used for pre-validation during sign-up to avoid 'silent' Supabase behavior.
    Returns provider info to distinguish Google vs Email users.
    """
    user = session.exec(select(User).where(User.email == request.email)).first()
    if user:
        return {"exists": True, "provider": user.auth_provider}
    else:
        return {"exists": False, "provider": None}


class PasswordResetRequest(SQLModel):
    email: str
    redirect_to: str = "http://localhost:3000/auth/update-password"

@router.post("/reset-password-request")
def request_password_reset(
    request: PasswordResetRequest,
    session: Session = Depends(get_session)
):
    """
    Generate a password recovery link via Supabase Admin and send it via Gmail.
    This bypasses Supabase's default email sender.
    """
    # 1. Verify User Exists
    user = session.exec(select(User).where(User.email == request.email)).first()
    if not user:
        # Security: Don't reveal if user exists, but here we kind of do with the existence check earlier.
        # For this flow, just return success to avoid enumeration if we want, 
        # but since we have a specific check-email endpoint, we can be open or generic.
        # Let's return generic success to be safe-ish, or 404 if we want to be strict.
        # Given the UX, we probably checked before calling this.
        return {"message": "If the email exists, a reset link has been sent."}
    
    print("DEBUG: Entered request_password_reset")
    # 2. Initialize Supabase Admin
    from dotenv import load_dotenv
    load_dotenv() # Force reload to be sure
    
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    print(f"DEBUG: Credentials loaded. URL: {bool(supabase_url)}, Key: {bool(supabase_key)}")

    if not supabase_url or not supabase_key:
        raise HTTPException(status_code=500, detail="Server misconfiguration: Missing Supabase Credentials")
    
    from supabase import create_client, Client
    print("DEBUG: Creating Supabase Client...")
    try:
        supabase: Client = create_client(supabase_url, supabase_key)
        print("DEBUG: Supabase Client Created.")
    except Exception as e:
        print(f"DEBUG: Supabase Init Error: {e}")
        raise e
    
    # 3. Generate Link
    try:
        response = supabase.auth.admin.generate_link({
            "type": "recovery",
            "email": request.email,
            "options": {
                "redirect_to": request.redirect_to
            }
        })
        
        # Handle Supabase GenerateLinkResponse
        action_link = None
        if hasattr(response, "properties"):
             # response.properties is likely an object, try attribute access first
             if hasattr(response.properties, "action_link"):
                 action_link = response.properties.action_link
             elif isinstance(response.properties, dict):
                 action_link = response.properties.get("action_link")
        elif isinstance(response, dict):
             action_link = response.get("action_link")
        else:
             action_link = getattr(response, "action_link", None)
             
        if not action_link:
             print(f"Failed to get action_link from response: {response}")
             raise Exception("Failed to generate recovery link")

    except Exception as e:
        print(f"Supabase Admin Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate recovery link")
        
    # 4. Send Email via GmailService
    try:
        from services.email.gmail import GmailService
        gmail_service = GmailService()
        
        subject = "[Promit] 비밀번호 재설정 안내"
        
        text_content = f"""
안녕하세요, Promit입니다.

비밀번호 재설정을 요청하셔서 보내드리는 메일입니다.
아래 링크를 클릭하여 새로운 비밀번호를 설정해주세요.

{action_link}

본인이 요청하지 않았다면 이 메일을 무시해주세요.

감사합니다.
Promit 팀 드림
        """
        
        gmail_service.send_email(request.email, subject, text_content)
        
    except Exception as e:
        print(f"Gmail Send Error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")

    return {"message": "Reset link sent"}

class WithdrawRequest(SQLModel):
    reason: Optional[str] = None
    confirm: bool

@router.post("/withdraw")
def withdraw_account(
    request: WithdrawRequest,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
):
    """
    Withdraw account:
    1. Create WithdrawnUser record (Archive)
    2. Soft delete Prompts & Projects (is_deleted = True)
    3. Delete User record
    """
    if not request.confirm:
        raise HTTPException(status_code=400, detail="Confirmation required")
        
    try:
        from models import WithdrawnUser, Project
        
        # 1. Archive User Data
        # Count resources for statistics
        prompt_count = len(session.exec(select(Prompt).where(Prompt.owner_id == current_user.id)).all())
        project_count = len(session.exec(select(Project).where(Project.owner_id == current_user.id)).all())
        
        withdrawn_user = WithdrawnUser(
            original_user_id=current_user.id,
            email=current_user.email,
            original_joined_at=current_user.created_at,
            withdrawn_at=datetime.datetime.utcnow(),
            reason=request.reason,
            prompt_count=prompt_count,
            project_count=project_count
        )
        session.add(withdrawn_user)
        
        # 2. Soft Delete Resources
        # Update Prompts
        prompts = session.exec(select(Prompt).where(Prompt.owner_id == current_user.id)).all()
        for p in prompts:
            p.is_deleted = True
            p.is_public = False # Unpublish
            p.owner_id = None # Remove link to deleted user
            session.add(p)
            
        # Update Projects
        projects = session.exec(select(Project).where(Project.owner_id == current_user.id)).all()
        for p in projects:
            p.is_deleted = True
            p.owner_id = None # Remove link to deleted user
            # If it's a team project, this might leave the team project without an owner shown?
            # But the team logic might rely on Team.owner_id.
            # Team.owner_id is also FK to User. We need to handle Teams too if they own any.
            session.add(p)

        # Handle Teams where user is owner
        # If user is owner of a team, we should probably transfer or soft delete the team?
        # For now, just set owner to None if possible, but Team.owner_id might be mandatory.
        # Let's check Team model.
        # Line 181: owner_id: uuid.UUID = Field(foreign_key="user.id") -> Mandatory.
        # If we delete User, Team deletion will fail or cascade.
        # Since we are "Soft Deleting" the user via "Hard Delete User + Created WithdrawnUser",
        # We must handle ALL FKs.
        
        # Teams owned by user:
        from models import Team
        teams = session.exec(select(Team).where(Team.owner_id == current_user.id)).all()
        for t in teams:
             # Logic for team owner withdrawal?
             # For MVP, let's just delete the team? Or keep it?
             # PRD says "탈퇴 회원이 오너십을 가지고 있는 프로젝트는 다른 유저에게서 보이지 않도록 처리"
             # It doesn't explicitly mention Teams themselves.
             # But if I delete the user, I MUST handle this.
             # I will delete the TEAM for now to avoid FK error, assuming personal teams.
             session.delete(t)
             
        # 3. Delete User from local DB
        session.delete(current_user)
        session.commit()
        
        # 4. Delete User from Supabase Auth (to allow re-signup)
        try:
            from dotenv import load_dotenv
            load_dotenv()
            supabase_url = os.getenv("SUPABASE_URL")
            supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
            
            if supabase_url and supabase_key:
                from supabase import create_client
                supabase_admin = create_client(supabase_url, supabase_key)
                supabase_admin.auth.admin.delete_user(str(current_user.id))
                print(f"Deleted user {current_user.id} from Supabase Auth")
        except Exception as supabase_error:
            # Log but don't fail - local DB is already cleaned
            print(f"Warning: Could not delete from Supabase Auth: {supabase_error}")
        
        return {"message": "User withdrawn successfully"}
        
    except Exception as e:
        session.rollback()
        print(f"Withdrawal Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to withdraw account")

