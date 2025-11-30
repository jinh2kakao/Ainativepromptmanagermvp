## Project Context

You are an expert Full Stack Developer creating a web application based on a Figma-generated mockup. Your goal is to implement the frontend logic and backend integration while keeping the UI code clearly separated to allow for future Figma design updates without breaking the logic.

## Tech Stack
- Frontend: Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide React (Icons).
- State Management: Zustand (Client State), TanStack Query (Server State).
- Backend: Python FastAPI, Local Execution (recommended for Dev) or Docker.
- Database: PostgreSQL (via Supabase), SQLModel (ORM), Pydantic.

## Architecture & Directory Structure Rules (CRITICAL)
To support iterative Figma updates, you must strictly follow the Container-Presenter Pattern:
1. src/components/ui-generated/:
    - Place all Figma-to-Code generated components here.
    - These components must be pure (Presentational).
    - They interact ONLY via props (interfaces).
    - **DO NOT** write business logic or API calls inside these files.
    - Assume these files will be overwritten by future Figma exports.

2. src/features/{featureName}/:
    - Logic resides here.
    - Create wrapper components (Containers) that import the UI components.
    - Example: UserProfileContainer.tsx imports UserProfileView.tsx (from ui-generated).

3. src/hooks/:
    - All API calls (TanStack Query) and side effects must be encapsulated in custom hooks.

## Implementation Requirements

1. Safety & Robustness
- **Loading States**: Always implement Skeleton loaders or Spinners for async operations.
- **Error Handling**: Use try-catch blocks in API services and display user-friendly Toast notifications (e.g., sonner or react-hot-toast) on failure.
- **Empty States**: If data is an empty list, explicitly render an 'Empty State' component, not just a blank screen.

2. Security Protocols (CRITICAL)
    - Public Repository Safety:
        - .gitignore: Ensure .env, .env.local, .venv, __pycache__, node_modules, *.DS_Store are ignored.
       - Pre-flight Check: Before any commit, verify that no secrets are visible in the 'Source Control' changes list.

    - Supabase Keys:
        - Format: Always use the Legacy Keys format (starts with eyJ...). Do NOT use sb_ formatted keys.
        - NEXT_PUBLIC_SUPABASE_ANON_KEY: Public safe.
        - SUPABASE_SERVICE_KEY: SECRET. Only for Backend (backend/.env).

    - Git Cache Clearing: If a secret file was tracked by mistake, use git rm -r --cached . to clear it before committing.

3. Database Modeling & SQLModel Rules
    - Inheritance Pattern: To avoid duplication, use the SQLModel inheritance pattern:
        - HeroBase: Fields common to all (used for Pydantic models).
        - Hero(HeroBase, table=True): The actual Database Table.
        - HeroRead(HeroBase): The API Response model (includes ID).
        - HeroCreate(HeroBase): The API Request model (excludes ID).
    - Naming Conventions:
        - Python/DB columns: snake_case (e.g., user_id).
        - API JSON responses: camelCase (configure Pydantic alias_generator if needed, or stick to consistency).
    - Security: Ensure Row Level Security (RLS) is enabled on Supabase.

4. Execution Workflow (Local First)
    - Backend (Python):
        - Setup: python3 -m venv .venv -> source .venv/bin/activate -> pip install -r requirements.txt
        - Run: uvicorn main:app --reload

    - Frontend (Node.js):
        - Setup: npm install
        - Run: npm run dev

5. Documentation & Change Logging (MANDATORY)
    - CHANGELOG.md:
        - You must create and maintain a CHANGELOG.md file in the project root.
        - Whenever you complete a task, modify code, fix bugs, or update the UI, append a new entry.
        - Format:
```
## [YYYY-MM-DD] {Task Category}
- *Changed*: List of modified files or logic.
- *Reason*: Brief explanation of why the change was made.
- *Impact*: Note if this change affects DB schema, API, or UI structure.
```

    - Readability: Keep the log concise but clear enough for a non-developer to understand the progress.

## Workflow for Updating UI
When I provide updated code from Figma:
1. Identify which components in ui-generated need replacement.
2. Update those files.
3. Ensure the interfaces (Props) in the Container components remain compatible or are updated to match the new design props.

