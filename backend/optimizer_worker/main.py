
# ... existing imports ...
import sys
import os
import time
import json
import threading
from contextlib import asynccontextmanager
from fastapi import FastAPI
import uvicorn
from sqlmodel import Session, select
from sqlalchemy import text
from dotenv import load_dotenv

# Load environment variables immediately
load_dotenv()

# Add backend directory to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from database import engine
from optimizer_worker.optimizer import PromptOptimizer
from models import OptimizationJob, JobStatus, Prompt, PromptEvaluation, PromptOptimization

POLL_INTERVAL = 5  # seconds

def process_job(session: Session, job: OptimizationJob):
    print(f"Processing Job {job.id} for Template {job.template_id}")
    optimizer = PromptOptimizer()
    
    try:
        # 1. Fetch Context
        prompt = session.get(Prompt, job.template_id)
        if not prompt or not prompt.content:
            raise ValueError("Prompt content not found")
            
        evaluation = session.get(PromptEvaluation, job.evaluation_id)
        if not evaluation:
            raise ValueError("Evaluation data not found")
            
        # 2. Optimize
        print(f"Optimizing content: {prompt.content[:50]}...")
        eval_data = {
            "total_score": evaluation.total_score,
            "details": evaluation.metrics
        }
        
        target_agents = "General LLM"
        if prompt.applicable_agents:
            target_agents = ", ".join(prompt.applicable_agents)

        result = optimizer.optimize(prompt.content, eval_data, target_agents=target_agents)
        
        # 3. Save Result to PromptOptimization
        opt_record = PromptOptimization(
            template_id=job.template_id,
            evaluation_id=job.evaluation_id,
            original_content=prompt.content,
            optimized_content=result['optimized_content'],
            optimization_details=result
        )
        session.add(opt_record)
        
        # 4. Update Job Status
        job.status = JobStatus.COMPLETED
        session.add(job)
        session.commit()
        print(f"Job {job.id} COMPLETED.")
        
    except Exception as e:
        print(f"Job {job.id} FAILED: {e}")
        session.rollback() # Rollback any partial changes
        
        # Mark job as failed
        job.status = JobStatus.FAILED
        job.error_message = str(e)
        session.add(job)
        session.commit()

def worker_loop():
    print("Starting Worker Loop (Native SQL Queue)...")
    
# ... (inside worker_loop)
    while True:
        try:
            with Session(engine) as session:
                # Polling with SKIP LOCKED to avoid race conditions
                # We select one PENDING job and mark it PROCESSING atomically
                
                # Note: SQLModel doesn't strictly type return of raw exec easily, 
                # so we get the ID first or use raw update.
                stmt = text("""
                    UPDATE optimizationjob
                    SET status = 'PROCESSING', updated_at = timezone('utc', now())
                    WHERE id = (
                        SELECT id
                        FROM optimizationjob
                        WHERE status = 'PENDING'
                        ORDER BY created_at ASC
                        LIMIT 1
                        FOR UPDATE SKIP LOCKED
                    )
                    RETURNING id
                """)
                
                result = session.exec(stmt).first()
                
                if result:
                    job_id = result[0]
                    # Fetch the full object to work with (now that we own the lock/status)
                    job = session.get(OptimizationJob, job_id)
                    if job:
                        process_job(session, job)
                else:
                    # No jobs, sleep
                    time.sleep(POLL_INTERVAL)
                    
        except Exception as e:
            print(f"Worker Loop Error: {e}")
            time.sleep(POLL_INTERVAL)

# Define FastAPI app for Health Checks
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start the worker loop in a separate thread
    worker_thread = threading.Thread(target=worker_loop, daemon=True)
    worker_thread.start()
    print("Worker thread started.")
    yield

app = FastAPI(lifespan=lifespan)

@app.get("/")
def read_root():
    return {"status": "healthy", "service": "worker-native"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

if __name__ == "__main__":
    # Run Uvicorn
    uvicorn.run("optimizer_worker.main:app", host="0.0.0.0", port=8000)

