
import asyncio
import os
import sys
import uuid
from dotenv import load_dotenv

# Add backend to path
BACKEND_DIR = os.path.join(os.getcwd(), 'backend')
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

print(f"DEBUG: PYTHONPATH: {sys.path[:3]}")

# Load environment
load_dotenv()

try:
    from services.evaluation import run_evaluation
    print("DEBUG: Successfully imported run_evaluation")
except ImportError as e:
    print(f"DEBUG: ImportError: {e}")
    # Try to see what's in 'backend'
    print(f"DEBUG: Contents of {BACKEND_DIR}: {os.listdir(BACKEND_DIR)}")
    sys.exit(1)

async def test_evaluation():
    print("Testing Native Python Evaluation...")
    dummy_id = uuid.uuid4()
    content = "You are a helpful assistant. Please answer questions clearly."
    
    # We expect this to run with current GEMINI_API_KEY from environment
    # and print 'Running Native Python Evaluation for prompt {dummy_id}'
    result = await run_evaluation(dummy_id, content)
    
    if result:
        print("\nSuccess! Evaluation Result:")
        print(f"Total Score: {result.get('total_score')}")
        print(f"Safety: {result.get('safety_status')}")
    else:
        print("\nEvaluation failed or GEMINI_API_KEY missing.")

if __name__ == "__main__":
    asyncio.run(test_evaluation())
