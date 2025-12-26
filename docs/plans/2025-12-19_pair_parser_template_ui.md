# Implementation Plan - Revert and Fix Parser

## Goal
1. Revert 163 templates from `SIMPLE` back to `ASSISTANCE` mode.
2. Remove `JSON.parse` logic in Frontend (`PromptForm.tsx`).
3. Implement `parsePairPrompt` utility to extract PAIR sections from Markdown text and populate `AssistanceMode` structure.

## 1. Data Revert
- **Script**: `backend/scripts/revert_assistance_fixes.py`
- **Logic**: Select templates where `mode='SIMPLE'` AND content contains specific PAIR headers (e.g., "## Persona", "## Context", "## Instruction"). Update `mode` to `ASSISTANCE`.

## 2. Frontend Parser Implementation
- **File**: `frontend/src/utils/pairParser.ts` (New)
- **Function**: `parsePairPrompt(content: string): Prompt['structure']`
- **Logic**:
    - Regex match sections:
        - `## Persona` -> `persona.profile` / `persona.intent`
        - `## Asset` / `## Context` -> `asset.knowledgeBase`
        - `## Instruction` -> `instruction.task`
    - Fallback: If strict parsing fails, map loosely or keep empty.
- **Update**: `PromptForm.tsx` to use `parsePairPrompt` instead of `JSON.parse`.

## Verification
- **Data**: Check `Assistance` mode count returns to ~165.
- **UI**: Check `PromptForm` in Assistance mode correctly populates fields from the text-based templates without crashing.
