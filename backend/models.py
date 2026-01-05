from typing import Optional, List, Dict, Any
from sqlmodel import Field, SQLModel, Relationship, Column, JSON
from sqlalchemy import String
from datetime import datetime
from enum import Enum
import uuid

# Enums
# Enums
class UserType(str, Enum):
    GUEST = "GUEST"
    FREE = "FREE"
    PRO = "PRO"
    ENTERPRISE = "enterprise"

class PromptMode(str, Enum):
    SIMPLE = "simple"
    ASSISTANCE = "assistance"


class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"

class TeamRole(str, Enum):
    OWNER = "owner"
    ADMIN = "admin"
    EDITOR = "editor"
    VIEWER = "viewer"

# User Model
class User(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    email: str = Field(index=True, unique=True)
    name: Optional[str] = None
    user_type: str = Field(default=UserType.FREE, sa_column=Column(String))
    role: UserRole = Field(default=UserRole.USER, sa_column=Column(String))
    is_active: bool = Field(default=True)
    auth_provider: Optional[str] = Field(default=None) # 'google', 'email', etc.
    subscription_end_date: Optional[datetime] = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    prompts: List["Prompt"] = Relationship(back_populates="owner")
    
    # We might want to back-populate projects too if needed
    # We might want to back-populate projects too if needed
    projects: List["Project"] = Relationship(
        back_populates="owner",
        sa_relationship_kwargs={
            "primaryjoin": "User.id==Project.owner_id", 
            "lazy": "select"
        }
    )
    
    # Cascade delete for team memberships
    team_memberships: List["TeamMember"] = Relationship(
        back_populates="user", 
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )
    
    # Cascade delete for other content
    audit_logs: List["AuditLog"] = Relationship(back_populates="admin", sa_relationship_kwargs={"cascade": "all, delete-orphan"})
    notices: List["Notice"] = Relationship(back_populates="author", sa_relationship_kwargs={"cascade": "all, delete-orphan"})
    inquiries: List["Inquiry"] = Relationship(back_populates="user", sa_relationship_kwargs={"cascade": "all, delete-orphan"})
    inquiry_comments: List["InquiryComment"] = Relationship(back_populates="author", sa_relationship_kwargs={"cascade": "all, delete-orphan"})

class WithdrawnUser(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True) # New unique ID for archive record
    original_user_id: uuid.UUID # Store the original User ID
    email: str # Store original email (hashed if needed, but for MVP plain/masked)
    migrated_email: Optional[str] = None # If we want to store a unique placeholder
    original_joined_at: datetime
    withdrawn_at: datetime = Field(default_factory=datetime.utcnow)
    reason: Optional[str] = None
    prompt_count: int = 0
    project_count: int = 0
    backup_data: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))


class UserRead(SQLModel):
    id: uuid.UUID
    email: str
    name: Optional[str] = None
    user_type: UserType
    role: UserRole
    is_active: bool
    subscription_end_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    prompt_count: int = 0
    project_count: int = 0

# Prompt Model
class Prompt(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    title: str
    mode: PromptMode = Field(default=PromptMode.SIMPLE)
    content: Optional[str] = Field(default=None, sa_column=Column(JSON)) # Storing content as text, but structure might be JSON? No, content is string in frontend.
    # Correction: content is string in frontend. structure is JSON.
    # Let's redefine content as Text
    
    content: Optional[str] = Field(default=None) # Markdown content
    
    category: Optional[str] = None
    sub_category: Optional[str] = None
    is_public: bool = Field(default=False)
    is_deleted: bool = Field(default=False) # Soft delete flag

    
    # JSON fields
    structure: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    variables: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))
    applicable_agents: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))
    
    # Foreign Key
    owner_id: Optional[uuid.UUID] = Field(default=None, foreign_key="user.id")
    owner: Optional[User] = Relationship(back_populates="prompts")
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# API Schemas (Pydantic models for Request/Response)
class PromptCreate(SQLModel):
    title: str
    mode: PromptMode
    content: Optional[str] = None
    category: Optional[str] = None
    sub_category: Optional[str] = None
    is_public: bool = False
    structure: Optional[Dict[str, Any]] = None
    variables: Optional[List[str]] = []
    applicable_agents: Optional[List[str]] = []

class PromptRead(PromptCreate):
    id: uuid.UUID
    owner_id: Optional[uuid.UUID]
    owner_email: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    latest_score: Optional[int] = None

class PromptUpdate(SQLModel):
    title: Optional[str] = None
    mode: Optional[PromptMode] = None
    content: Optional[str] = None
    category: Optional[str] = None
    sub_category: Optional[str] = None
    is_public: Optional[bool] = None
    structure: Optional[Dict[str, Any]] = None
    variables: Optional[List[str]] = None
    applicable_agents: Optional[List[str]] = None

# Admin & Advanced Features Models

class Category(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    parent_id: Optional[uuid.UUID] = Field(default=None, foreign_key="category.id")
    name: str
    value: str
    order: int = Field(default=0)
    config_json: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
    children: List["Category"] = Relationship(
        sa_relationship_kwargs={
            "cascade": "all",
            "remote_side": "Category.id"
        }
    )

class CategoryRead(SQLModel):
    id: uuid.UUID
    parent_id: Optional[uuid.UUID]
    name: str
    value: str
    order: int
    config_json: Optional[Dict[str, Any]] = None

class PromptTemplate(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    category_id: Optional[uuid.UUID] = Field(default=None, foreign_key="category.id")
    mode: PromptMode = Field(default=PromptMode.SIMPLE)
    title: Optional[str] = Field(default=None) # Added title field
    name: str = Field(default="Default Template") # Added name
    description: Optional[str] = Field(default=None) # [NEW] Added description
    content: str # JSON string or plain text depending on mode
    applicable_agents: Optional[List[str]] = Field(default=None, sa_column=Column(JSON)) # Added field for applicable agents
    preview_image_url: Optional[str] = Field(default=None) # [NEW] v3.5.0
    is_default: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    category: Optional["Category"] = Relationship()

class TemplateUsage(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: Optional[uuid.UUID] = Field(default=None, foreign_key="user.id") # Optional for guest usage tracking if needed, but usually logged in.
    template_id: uuid.UUID = Field(foreign_key="prompttemplate.id")
    action_type: str # 'copy', 'view', 'run'
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AuditLog(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    admin_id: uuid.UUID = Field(foreign_key="user.id")
    admin: Optional["User"] = Relationship(back_populates="audit_logs")
    action: str
    target_id: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class Team(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str
    owner_id: uuid.UUID = Field(foreign_key="user.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    members: List["TeamMember"] = Relationship(back_populates="team", sa_relationship_kwargs={"cascade": "all, delete-orphan"})
    projects: List["Project"] = Relationship(back_populates="team")

class TeamMember(SQLModel, table=True):
    team_id: uuid.UUID = Field(foreign_key="team.id", primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", primary_key=True)
    role: TeamRole = Field(default=TeamRole.VIEWER)
    joined_at: datetime = Field(default_factory=datetime.utcnow)

    team: Team = Relationship(back_populates="members")
    user: Optional["User"] = Relationship(back_populates="team_memberships")


# Project Models
class Project(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    title: str
    description: Optional[str] = None
    owner_id: Optional[uuid.UUID] = Field(default=None, foreign_key="user.id")
    owner: Optional["User"] = Relationship(
        back_populates="projects",
        sa_relationship_kwargs={
            "foreign_keys": "Project.owner_id"
        }
    )
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_deleted: bool = Field(default=False) # Soft delete flag

    
    # v3.0.0 Team & Locking
    team_id: Optional[uuid.UUID] = Field(default=None, foreign_key="team.id")
    locked_by: Optional[uuid.UUID] = Field(default=None, foreign_key="user.id")
    locked_at: Optional[datetime] = Field(default=None)

    # Store project-level data like edges, viewport, etc.
    data: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
    nodes: List["ProjectNode"] = Relationship(back_populates="project", sa_relationship_kwargs={"cascade": "all, delete-orphan"})
    team: Optional[Team] = Relationship(back_populates="projects")


class ProjectNode(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    project_id: uuid.UUID = Field(foreign_key="project.id")
    prompt_id: Optional[uuid.UUID] = Field(default=None, foreign_key="prompt.id")
    type: str = Field(default="prompt") # prompt, note, etc.
    position_x: float = Field(default=0.0)
    position_y: float = Field(default=0.0)
    data: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON)) # Store connections or other metadata
    
    project: Optional[Project] = Relationship(back_populates="nodes")
    prompt: Optional[Prompt] = Relationship()

class ProjectTemplate(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name: str
    description: Optional[str] = None
    category_id: Optional[uuid.UUID] = Field(default=None, foreign_key="category.id")
    content: Dict[str, Any] = Field(sa_column=Column(JSON)) # JSON structure defining nodes and edges
    is_default: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# AI Optimization & Worker Models

class JobStatus(str, Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class OptimizationJob(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    template_id: uuid.UUID
    evaluation_id: Optional[uuid.UUID] = None
    status: JobStatus = Field(default=JobStatus.PENDING)
    
    payload: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    error_message: Optional[str] = None
    
    optimized_content: Optional[str] = None
    optimization_details: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# Team API Schemas
class TeamCreate(SQLModel):
    name: str

class TeamRead(SQLModel):
    id: uuid.UUID
    name: str
    owner_id: uuid.UUID
    created_at: datetime
    updated_at: datetime

class TeamMemberCreate(SQLModel):
    user_email: str # Used for inviting
    role: TeamRole = TeamRole.VIEWER

class TeamMemberRead(SQLModel):
    team_id: uuid.UUID
    user_id: uuid.UUID
    role: TeamRole
    joined_at: datetime
    user_email: Optional[str] = None # Enriched
    user_name: Optional[str] = None # Enriched

    updated_at: datetime = Field(default_factory=datetime.utcnow)

class PromptEvaluation(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    template_id: uuid.UUID = Field(foreign_key="prompt.id") # Use Prompt table as source of truth for template_id
    total_score: int
    readability_score: int = Field(default=0)
    security_score: int = Field(default=0)
    metrics: Dict[str, Any] = Field(default={}, sa_column=Column(JSON))
    
    created_at: datetime = Field(default_factory=datetime.utcnow)

# AiAgent Model for dynamic management
class AiAgent(SQLModel, table=True):
    id: str = Field(primary_key=True) # e.g. 'gpt-4o'
    name: str # Display Name
    group: str # Category/Group
    is_active: bool = Field(default=True)
    sort_order: int = Field(default=0)

class PromptOptimization(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    template_id: uuid.UUID = Field(foreign_key="prompt.id")
    evaluation_id: Optional[uuid.UUID] = Field(default=None, foreign_key="promptevaluation.id")
    
    original_content: str
    optimized_content: str
    optimization_details: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    

    created_at: datetime = Field(default_factory=datetime.utcnow)

# Community Features Models (v3.3.0)

class Notice(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    title: str
    content: str # Rich text or markdown
    is_published: bool = Field(default=False)
    is_pinned: bool = Field(default=False)
    author_id: uuid.UUID = Field(foreign_key="user.id")
    author: Optional["User"] = Relationship(back_populates="notices")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationship to User (optional, avoiding circular dep if User doesn't back_populate)
    # author: Optional[User] = Relationship()

class FAQ(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    category: str
    question: str
    answer: str
    display_order: int = Field(default=0)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class InquiryStatus(str, Enum):
    PENDING = "PENDING"
    ANSWERED = "ANSWERED"
    CLOSED = "CLOSED"

class InquiryBase(SQLModel):
    title: str
    content: str
    category: Optional[str] = None
    status: InquiryStatus = Field(default=InquiryStatus.PENDING)

class Inquiry(InquiryBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id")
    user: Optional["User"] = Relationship(back_populates="inquiries")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    comments: List["InquiryComment"] = Relationship(back_populates="inquiry", sa_relationship_kwargs={"cascade": "all, delete-orphan"})

class InquiryCommentBase(SQLModel):
    content: str

class InquiryComment(InquiryCommentBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    inquiry_id: uuid.UUID = Field(foreign_key="inquiry.id")
    author_id: uuid.UUID = Field(foreign_key="user.id")
    author: Optional["User"] = Relationship(back_populates="inquiry_comments")
    is_staff_reply: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    inquiry: Inquiry = Relationship(back_populates="comments")

class NoticeCreate(SQLModel):
    title: str
    content: str
    is_published: bool = False
    is_pinned: bool = False

class NoticeUpdate(SQLModel):
    title: Optional[str] = None
    content: Optional[str] = None
    is_published: Optional[bool] = None
    is_pinned: Optional[bool] = None

class FAQCreate(SQLModel):
    category: str
    question: str
    answer: str
    display_order: int = 0

class FAQUpdate(SQLModel):
    category: Optional[str] = None
    question: Optional[str] = None
    answer: Optional[str] = None
    display_order: Optional[int] = None

class InquiryCreate(InquiryBase):
    pass

class InquiryCommentCreate(InquiryCommentBase):
    pass

class InquiryReadWithUser(InquiryBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    user_email: str
    user_name: Optional[str] = None
