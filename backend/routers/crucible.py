
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from typing import List, Optional
from database import get_session
import uuid

# We need to access both the standard models (PromptTemplate) 
# and the new schema tables (via direct SQL or new SQLModels).
# For simplicity and speed, we'll define new SQLModels for the prompt_ops schema here or just use raw SQL.
# Using raw SQL for the prompt_ops schema to avoid complex setup if they are not in models.py yet.
from sqlalchemy import text

router = APIRouter(prefix="/api/crucible", tags=["project_crucible"])

@router.get("/optimizations")
def get_optimizations(limit: int = 50, session: Session = Depends(get_session)):
    """
    Get a list of recent optimizations.
    """
    try:
        query = text("""
            SELECT 
                o.id, 
                o.template_id, 
                o.original_content, 
                o.optimized_content, 
                o.optimization_details, 
                o.created_at,
                t.status as template_status,
                e.total_score as initial_score
            FROM prompt_ops.optimizations o
            JOIN prompt_ops.templates t ON o.template_id = t.id
            LEFT JOIN prompt_ops.evaluations e ON o.evaluation_id = e.id
            ORDER BY o.created_at DESC
            LIMIT :limit
        """)
        
        result = session.exec(query, params={"limit": limit}).all()
        
        # Convert to dict list
        optimizations = []
        for row in result:
            optimizations.append({
                "id": str(row.id),
                "template_id": str(row.template_id),
                "original_content": row.original_content,
                "optimized_content": row.optimized_content,
                "details": row.optimization_details, # JSONB comes as dict
                "created_at": row.created_at,
                "template_status": row.template_status,
                "initial_score": row.initial_score
            })
            
        return optimizations
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/scores/{template_ids}")
def get_scores_for_templates(template_ids: str, session: Session = Depends(get_session)):
    """
    Get scores for a list of template IDs (comma separated).
    This assumes that the 'id' in prompt_ops.templates MATCHES the 'id' in public.prompt_template 
    OR that we are looking for prompts by content hash? 
    
    Actually, for this project, we might have a disconnect. 
    The 'seed_test' created a NEW template in prompt_ops.templates.
    But the Admin UI shows 'PromptTemplate' (public.prompt_template).
    
    If the user wants to show scores on the EXISTING Admin Templates page,
    we need to evaluate THOSE templates.
    
    For now, let's just return scores for IDs that exist in prompt_ops.evaluations.
    """
    ids = template_ids.split(',')
    
    # We select the LATEST evaluation for each template
    # (Assuming simpler 1-to-1 or latest wins)
    query = text("""
        SELECT DISTINCT ON (template_id) template_id, total_score, created_at
        FROM prompt_ops.evaluations
        WHERE template_id::text = ANY(:ids)
        ORDER BY template_id, created_at DESC
    """)
    
    try:
        result = session.exec(query, params={"ids": ids}).all()
        scores_map = {str(row.template_id): row.total_score for row in result}
        return scores_map
    except Exception as e:
        print(f"Error fetching scores: {e}")
        return {}

