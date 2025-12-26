
import dspy
import os
import google.generativeai as genai
from dspy.teleprompt import MIPROv2

# Custom Adapter for Google Generative AI (Bypassing Litellm/DSPy built-in if flaky)

# Custom Adapter for Google Generative AI (Bypassing Litellm/DSPy built-in if flaky)
class GeminiLM(dspy.LM):
    def __init__(self, model_name="models/gemini-1.5-flash", api_key=None):
        super().__init__(model=model_name)
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        
        # Lazy Check: Don't raise here to allow instantiation
        if self.api_key:
             genai.configure(api_key=self.api_key)
             self.genai_model = genai.GenerativeModel(model_name)
        else:
             self.genai_model = None
             
        self.provider = "google"


    # Override simple basic_request is not enough if base class calls litellm in request()
    def __call__(self, prompt=None, **kwargs):
        if not self.genai_model:
             print("Gemini Error: API Key not configured.")
             # Raise error here so the optimization job fails gracefully instead of app crash
             raise ValueError("GEMINI_API_KEY is not set. Cannot perform optimization.")

        # Handle cases where prompt is passed as keyword or positional
        if prompt is None:
            prompt = kwargs.get("prompt")
            # If still None, maybe 'messages'?
            if prompt is None and "messages" in kwargs:
                # Convert messages to string or pass to gemini chat?
                # For basic optimization, we assume string prompt.
                # Just take the last message content or join them?
                msgs = kwargs["messages"]
                if isinstance(msgs, list):
                    # Robustly handle list of messages (User/Assistant/User)
                    # For basic optimization, we just want the last user message or concatenate context?
                    # DSPy usually sends a list of dicts or strings.
                    # Let's concatenate them safely.
                    content_parts = []
                    for m in msgs:
                        if isinstance(m, dict) and 'content' in m:
                            content_parts.append(str(m['content']))
                        else:
                            content_parts.append(str(m))
                    prompt = "\\n\\n".join(content_parts)
                else:
                    prompt = str(msgs)
        
        if not prompt:
            print("GeminiLM Warning: No prompt found.")
            return []

        try:
            response = self.genai_model.generate_content(prompt)
            return [response.text]
        except Exception as e:
            print(f"Gemini Error: {e}")
            return []

# NOTE: Removed global dspy.configure to prevent startup crash if key missing


# Gold Set / Bootstrap Data for MIPROv2
GOLD_SET = [
    dspy.Example(
        original_prompt="Summarize this text.",
        analysis_feedback="Missing Persona, Context, Output Format.",
        optimized_prompt="You are an expert editor. Please summarize the following text for a general audience. The summary should be concise, capturing the main points in 3-5 bullet points. Output format: Markdown list.",
        reasoning="Added Persona (Expert Editor), Context (General Audience), and specific Output Format request."
    ).with_inputs("original_prompt", "analysis_feedback"),
    
    dspy.Example(
        original_prompt="Write code for a login page.",
        analysis_feedback="Vague instruction. No tech stack specified. No security constraints.",
        optimized_prompt="Act as a Senior Frontend Developer. Create a secure login page component using React and TailwindCSS. Include input validation for email format and password strength. Ensure the form handles submission states and displays error messages clearly.",
        reasoning="Specified Role, Tech Stack (React/Tailwind), and added constraints (Validation, Error Handling)."
    ).with_inputs("original_prompt", "analysis_feedback"),
    
    dspy.Example(
        original_prompt="Translate to Korean.",
        analysis_feedback="No context on tone or domain.",
        optimized_prompt="You are a professional translator. Translate the following business email into formal Korean (Honorifics/Jondaemal). Ensure the tone remains polite and professional suitable for corporate communication.",
        reasoning="Clarified Tone (Formal/Professional) and Domain (Business Email)."
    ).with_inputs("original_prompt", "analysis_feedback"),
    
    dspy.Example(
        original_prompt="Explain Quantum Physics.",
        analysis_feedback="Too broad. Needs a target audience.",
        optimized_prompt="Explain the basic principles of Quantum Physics to a 10-year-old child. Use simple analogies (like a spinning coin) to explain superposition. Avoid complex jargon.",
        reasoning="Target Audience set to '10-year-old'. Added instruction to use Analogies."
    ).with_inputs("original_prompt", "analysis_feedback"),
    
    dspy.Example(
        original_prompt="Generate a SQL query.",
        analysis_feedback="Missing schema info and goal.",
        optimized_prompt="Act as a Database Administrator. Write a PostgreSQL query to select the top 10 users by 'spending_amount' from the 'users' table. Include only active users (is_active = true). Return the result ordered by spending_amount descending.",
        reasoning="Added Role, DB constraints (PostgreSQL), specific Table/Column names, and Filtering logic."
    ).with_inputs("original_prompt", "analysis_feedback")
]

class OptimizePromptSignature(dspy.Signature):
    """
    Optimize a given prompt to drastically improve its quality based on the 'APEF v2.0' (Advanced Prompt Evaluation Framework).
    
    You MUST address the specific 'analysis_feedback' provided.
    
    Your goal is to maximize the score in these 4 dimensions:
    1. Structure (40%): Ensure clear Personas, Context, Task, Constraints, and Output Format.
    2. Clarity (30%): Remove ambiguity, use precise verbs, and ensure logical flow.
    3. Technique (20%): Apply advanced prompt engineering (Few-shot, Chain-of-Thought, Delimiters).
    4. Efficiency (10%): Be concise but comprehensive.

    If the feedback mentions 'Missing Persona', you MUST add a specific role (e.g., 'Act as a Senior Python Developer').
    If the feedback mentions 'Missing Output Format', you MUST specify how the output should look (e.g., 'Markdown table', 'JSON').
    """
    original_prompt = dspy.InputField(desc="The original prompt text that needs optimization")
    analysis_feedback = dspy.InputField(desc="Critical feedback from 'The Judge' highlighting missing elements (Structure, Clarity, etc). YOU MUST FIX THESE.")
    target_agents = dspy.InputField(desc="List of AI models this prompt is intended for (e.g., 'GPT-4', 'Claude'). Optimization should respect their specific strengths (XML for Claude, etc).")
    
    optimized_prompt = dspy.OutputField(desc="The fully optimized prompt that resolves ALL issues in the feedback")
    reasoning = dspy.OutputField(desc="Step-by-step explanation of how you addressed each feedback point (e.g., 'Added Persona: Data Scientist', 'Clarified Output: CSV format')")
    recommended_agents = dspy.OutputField(desc="List of 1-3 AI agents best suited for this optimized prompt (e.g., ['gpt-4o', 'claude-3-5-sonnet']). Base this on complexity and format.")

class PromptOptimizer:
    def __init__(self):
        # Lazy Configuration of DSPy
        # Try to configure if not already configured or just re-configure safely
        try:
             gemini_flash = GeminiLM(model_name="gemini-flash-latest")
             # Only configure if we have a valid model (and key) - but GeminiLM now always returns object
             # Check if key is present via private attribute or just configure
             # dspy.configure is lightweight, safe to call multiple times or overwrite
             dspy.configure(lm=gemini_flash)
        except Exception as e:
             print(f"Warning: DSPy configuration failed (likely no API KEY). Optimization will fail if attempted. Error: {e}")

        # Using ChainOfThought initially
        self.cot = dspy.ChainOfThought(OptimizePromptSignature)
        
        # MIPROv2 Optimization (Bootstrap with Examples)
        self.optimizer_program = self.cot
        self.optimizer_program.demos = GOLD_SET

    def optimize(self, original_prompt: str, feedback: dict, **kwargs) -> dict:
        """
        Optimizes the prompt using DSPy.
        feedback dictionary is expected to come from the Judge module.
        kwargs can contain 'target_agents' (str of comma-separated agents).
        """
        # Convert feedback dict to a string summary
        feedback_str = self._format_feedback(feedback)
        
        try:
            
            # Run the chain
            # Since we loaded demos (examples), this acts as a Few-Shot COT.
            prediction = self.optimizer_program(
                original_prompt=original_prompt,
                analysis_feedback=feedback_str,
                target_agents=kwargs.get('target_agents', "General LLM")
            )
            
            # Validate output (dspy sometimes returns object with keys, sometimes Prediction object)
            # ChainOfThought returns Prediction where attributes match OutputFields
            opt_content = getattr(prediction, 'optimized_prompt', '') or ""
            reasoning = getattr(prediction, 'reasoning', '') or ""
            recommended_agents_raw = getattr(prediction, 'recommended_agents', []) or []
            
            # Normalize recommended_agents to list
            recommended_agents = []
            if isinstance(recommended_agents_raw, list):
                recommended_agents = recommended_agents_raw
            elif isinstance(recommended_agents_raw, str):
                # Try to clean string "[a, b]" or "a, b"
                cleaned = recommended_agents_raw.replace("[", "").replace("]", "").replace("'", "").replace('"', "")
                recommended_agents = [x.strip() for x in cleaned.split(",") if x.strip()]

            if not opt_content:
                 print(f"Warning: Optimization returned empty content. Prediction: {prediction}")
                 # Fallback: Just return original if empty
                 opt_content = original_prompt

            return {
                "optimized_content": opt_content,
                "reasoning": reasoning,
                "recommended_agents": recommended_agents
            }
        except Exception as e:
            print(f"Error during optimization: {e}")
            import traceback
            traceback.print_exc()
            return {
                "optimized_content": original_prompt,
                "reasoning": f"Optimization failed: {str(e)}"
            }

    def _format_feedback(self, feedback: dict) -> str:
        """Helper to create a readable string from the JSON feedback (APEF v2.0 aware)"""
        summary = []
        if isinstance(feedback, str):
            return feedback
            
        if 'total_score' in feedback:
            summary.append(f"Current Score: {feedback['total_score']}/100.")
            
        metrics = feedback.get('details', {}) # In main.py, we pass evaluation.metrics as 'details' key
        if not metrics and 'metrics' in feedback:
             metrics = feedback['metrics']

        # APEF v2.0 Support
        if 'breakdown' in metrics:
            breakdown = metrics['breakdown']
            
            # Structure Missing
            missing_structure = breakdown.get('structure', {}).get('missing_elements', [])
            if missing_structure:
                summary.append(f"Missing Structure: {', '.join(missing_structure)}.")
            
            # Clarity Warnings
            ambiguity = breakdown.get('clarity', {}).get('ambiguity_warnings', [])
            if ambiguity:
                 summary.append(f"Ambiguity Warnings: {', '.join(ambiguity)}.")
                 
            # Efficiency
            efficiency_comment = breakdown.get('efficiency', {}).get('comment', "")
            if efficiency_comment:
                summary.append(f"Efficiency: {efficiency_comment}.")

        # Fallback for Old Schema
        elif 'missing_components' in metrics: # Helper check
            summary.append(f"Missing elements: {', '.join(metrics['missing_components'])}.")
        else:
             # Deep nested old check
             missing = metrics.get('structure', {}).get('missing', [])
             if missing:
                 summary.append(f"Missing structural elements: {', '.join(missing)}.")

        # Improvement Suggestions (APEF v2.0)
        suggestions = metrics.get('improvement_suggestions', [])
        if suggestions:
            summary.append("Suggestions: " + " ".join(suggestions))
            
        return " ".join(summary)
