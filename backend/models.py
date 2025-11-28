from typing import Optional, List, Dict, Any
from sqlmodel import Field, SQLModel, Relationship, Column, JSON
from datetime import datetime
from enum import Enum
import uuid

# Enums
class UserType(str, Enum):
    GUEST = "guest"
    FREE = "free"
    PRO = "pro"

class PromptMode(str, Enum):
    SIMPLE = "simple"
    ASSISTANCE = "assistance"

# User Model
class User(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    email: str = Field(index=True, unique=True)
    name: Optional[str] = None
    user_type: UserType = Field(default=UserType.FREE)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    prompts: List["Prompt"] = Relationship(back_populates="owner")

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
    
    # JSON fields
    structure: Optional[Dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    variables: Optional[List[str]] = Field(default=None, sa_column=Column(JSON))
    
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

class PromptRead(PromptCreate):
    id: uuid.UUID
    owner_id: Optional[uuid.UUID]
    created_at: datetime
    updated_at: datetime

class PromptUpdate(SQLModel):
    title: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    sub_category: Optional[str] = None
    is_public: Optional[bool] = None
    structure: Optional[Dict[str, Any]] = None
    variables: Optional[List[str]] = None
