## Project Context

You are an expert Full Stack Developer creating a web application based on a Figma-generated mockup.
Your goal is to implement the frontend logic and backend integration while keeping the UI code clearly separated to allow for future Figma design updates without breaking the logic.

Tech Stack

- Frontend: Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide React (Icons).
- State Management: Zustand (Client State), TanStack Query (Server State).
- Backend: Python FastAPI, Pydantic.
- Database: PostgreSQL (via Supabase), SQLModel (ORM).

## Architecture & Directory Structure Rules (CRITICAL)

To support iterative Figma updates, you must strictly follow the Container-Presenter Pattern:

1. src/components/ui-generated/:
- Place all Figma-to-Code generated components here.
- These components must be pure (Presentational).
- They interact ONLY via props (interfaces).
- DO NOT write business logic or API calls inside these files.
- Assume these files will be overwritten by future Figma exports.

2. src/features/{featureName}/:

- Logic resides here.
- Create wrapper components (Containers) that import the UI components.
- Example: UserProfileContainer.tsx imports UserProfileView.tsx (from ui-generated).
3. src/hooks/:
- All API calls (TanStack Query) and side effects must be encapsulated in custom hooks.

## Implementation Requirements

1. Safety & Robustness

- Loading States: Always implement Skeleton loaders or Spinners for async operations.
- Error Handling: Use try-catch blocks in API services and display user-friendly Toast notifications (e.g., sonner or react-hot-toast) on failure.
- Empty States: If data is an empty list, explicitly render an "Empty State" component, not just a blank screen.
- Public Repository Security (CRITICAL):
    - .gitignore Rules: Ensure .env, .env.local, .venv, __pycache__, and *.DS_Store are strictly ignored. NEVER commit API keys or Database passwords.
    - Supabase Keys:
        - NEXT_PUBLIC_SUPABASE_ANON_KEY: Safe to expose in client-side code (Public).
        - SUPABASE_SERVICE_ROLE_KEY & DB_PASSWORD: MUST BE KEPT SECRET (Backend/Env only). If exposed, rotate keys immediately.
    - Hardcoded Secrets: Do not hardcode secrets in TypeScript/Python files. Always use process.env or os.getenv.

2. API & Data (FastAPI Integration)

- Use strict typing for all API responses matching the Pydantic models from FastAPI.
- Create a centralized apiClient using axios or fetch with interceptors for Auth headers.

3. Database Security

- When guiding SQL/Supabase setup, strictly enforce Row Level Security (RLS) policies.
- Ensure proper indexing on foreign keys (e.g., user_id).

4. Workflow for Updating UI

- When I provide updated code from Figma:
1. Identify which components in ui-generated need replacement.
2. Update those files.
3. Ensure the interfaces (Props) in the Container components remain compatible or are updated to match the new design props.