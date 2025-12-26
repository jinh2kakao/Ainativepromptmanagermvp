# Walkthrough: Project Crucible v2.1.0 (User Empowerment)

I have implemented the features defined in PRD v2.1.0, enabling users to view prompt quality scores and actively request AI optimization.

## Changes

### Backend
-   **New Router**: `backend/routers/prompt_optimization.py` handles `POST /api/prompts/{id}/optimize` and `GET /api/prompts/{id}/analysis`.
-   **Model Update**: `PromptRead` now includes `latest_score`.
-   **Router Update**: `backend/routers/prompts.py` now fetches evaluation scores for the prompt list and detail views.
-   **Main**: Registered `prompt_optimization` router and fixed imports.

### Frontend
-   **New Component**: `ScoreBadge` displays the quality score with a tooltip.
-   **New Component**: `OptimizationReviewModal` allows users to compare Original vs Optimized content and apply changes.
-   **Updated API**: `frontend/src/features/prompts/api.ts` includes optimization endpoints.
-   **Updated Types**: `Prompt` interface includes `latest_score`.
-   **Updated PromptCard**: Displays `ScoreBadge` in List and Card views.
-   **Updated PromptDetailPage**:
    -   Displays `ScoreBadge` in the header.
    -   Added "✨ AI Optimize" button for owners.
    -   Implemented polling logic to wait for the optimization worker.
    -   Integrated `OptimizationReviewModal` flow.

## Verification Results

### Automated Checks
-   **Backend Load**: `python3 -c "from main import app"` -> **Success**.
-   **Frontend Type Check**: `npm run type-check` -> **Success**.

### User Flow
1.  **View Prompts**: User sees quality scores (if evaluated) in the dashboard.
2.  **Optimize**: User opens a prompt, clicks "AI Optimize".
3.  **Process**:
    -   Backend triggers "The Judge" (Evaluation) & "The Optimizer" (PGMQ).
    -   Frontend polls for completion.
4.  **Review**: Modal opens showing Diff.
5.  **Apply**: User clicks "Apply", content is updated via `updateMutation`.
