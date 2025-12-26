
import sys
import os
import json
import time
from sqlalchemy import text
from dotenv import load_dotenv

# Add backend directory to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from database import engine

def run_integration_test():
    print("--- Starting Project Crucible Integration Test ---")
    
    with engine.connect() as connection:
        trans = connection.begin()
        try:
            # 1. Cleanup previous test run (optional, for idempotency)
            # connection.execute(text("DELETE FROM prompt_ops.templates WHERE metadata->>'test_id' = 'integration_test_001'"))
            
            # 2. Insert a "Bad" Template
            print("1. Inserting Bad Template...")
            bad_prompt_content = "do this now." # Very short, no context, no persona
            
            result = connection.execute(text("""
                INSERT INTO prompt_ops.templates (content, status, metadata)
                VALUES (:content, 'PENDING', '{"test_id": "integration_test_001"}')
                RETURNING id
            """), {"content": bad_prompt_content})
            template_id = result.fetchone().id
            print(f"   -> Template ID: {template_id}")
            
            # 3. Insert a Low Evaluation (Simulating Module 1)
            print("2. Inserting Low Score Evaluation (Score: 45)...")
            eval_metrics = {
                "readability": {"score": 30},
                "structure": {"score": 20, "missing": ["persona", "context", "output_format"]},
                "security": {"score": 100}
            }
            
            connection.execute(text("""
                INSERT INTO prompt_ops.evaluations (template_id, total_score, metrics)
                VALUES (:tid, 45, :metrics)
            """), {"tid": template_id, "metrics": json.dumps(eval_metrics)})
            print("   -> Evaluation Inserted.")
            
            # 4. Verify Trigger Effects
            print("3. Verifying Trigger Logic...")
            
            # Check Template Status
            res_template = connection.execute(text("""
                SELECT status FROM prompt_ops.templates WHERE id = :tid
            """), {"tid": template_id}).fetchone()
            
            status = res_template.status
            print(f"   -> Template Status: {status} (Expected: FLAGGED)")
            
            if status != 'FLAGGED':
                print("   [!] FAILURE: Template status was not updated to FLAGGED.")
            else:
                print("   [OK] Template correctly FLAGGED.")

            # Check Queue
            # We use pgmq.read to check if message exists (without consuming it fully effectively for test? or just peek?)
            # Since pgmq.read pops it by visibility timeout, we can read it to verify.
            print("4. Checking PGMQ 'optimization_queue'...")
            res_queue = connection.execute(text("SELECT * FROM pgmq.read('optimization_queue', 10, 1)")).fetchone()
            
            if res_queue:
                payload = res_queue.message
                print(f"   -> Message found: {payload}")
                if payload['template_id'] == str(template_id):
                    print("   [OK] Message contains correct Template ID.")
                else:
                    print(f"   [!] Message ID mismatch. Found {payload['template_id']}")
            else:
                print("   [!] FAILURE: No message found in queue.")

            # Commit the changes so the Worker can actually process it later if the user wants
            trans.commit()
            print("\n--- Test Data Seeded Successfully ---")
            print("To complete the flow:")
            print("1. Run the Python Worker: python backend/optimizer_worker/main.py")
            print("2. It should pick up this template, optimize it, and update status to APPROVED.")
            
        except Exception as e:
            trans.rollback()
            print(f"\n[!] Error during test: {e}")
            raise e

if __name__ == "__main__":
    run_integration_test()
