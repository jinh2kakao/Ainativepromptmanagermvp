
import sys
import os
import traceback

# Add project root AND backend to path to mimic Docker / app structure
project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
backend_path = os.path.join(project_root, "backend")

sys.path.append(project_root)
sys.path.append(backend_path)

print(f"Paths added: \n{project_root}\n{backend_path}")

# Forcefully remove GEMINI_API_KEY from env if it exists (for testing resilience)
if "GEMINI_API_KEY" in os.environ:
    del os.environ["GEMINI_API_KEY"]
    print("Forced ID GEMINI_API_KEY removal for testing.")

print("Attempting to import backend.main...")
try:
    # Check if GEMINI_API_KEY is set
    print(f"GEMINI_API_KEY set: {'GEMINI_API_KEY' in os.environ}")
    
    import backend.main
    print("Successfully imported backend.main (Startup Resilience Passed!)")
except Exception as e:
    print("Failed to import backend.main")
    traceback.print_exc()

print("-" * 20)
print("Attempting to import optimizer_worker.optimizer...")
try: 
    import optimizer_worker.optimizer
    print("Successfully imported optimizer_worker.optimizer (Module Load Test Passed!)")
except Exception as e:
    print("Failed to import optimizer_worker.optimizer")
    traceback.print_exc()
