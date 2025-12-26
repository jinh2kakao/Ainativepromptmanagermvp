# Feature: Template Selection UI & PAIR Parser

## Overview
Implemented a unified "Green Box" template selection UI and a robust text-based PAIR parser for Assistance Mode templates.

### Changes
#### Frontend
- **UI Unification**: `PromptForm.tsx` now uses the consistent "Green Box" style for template selection in the Basic Settings area. Headers were cleaned up in `AssistanceMode.tsx`.
- **Text Parser**: Replaced `JSON.parse` with `src/utils/pairParser.ts` for Assistance Mode. This allows templates to be stored as Markdown (e.g., `## Persona`, `## Instruction`) and still populate the structured UI correctly.

#### Backend / Data
- **Data Integrity**: 
    - Initially identified 163 templates marked as `ASSISTANCE` but containing text. 
    - Created and ran `revert_assistance_fixes.py` to ensure these remain `ASSISTANCE` mode (after an initial attempt to move them to `SIMPLE`).
    - The new Frontend Parser handles these Markdown templates correctly.

#### Documentation
- **Updated**: `CHANGELOG.md` (v3.3.0), `master_prompt.md` (Parser logic), `DEPLOY.md` (Migration note).

### Verification
- [x] UI: "Green Box" selector visible and functional.
- [x] Logic: Selecting a Markdown-based Assistance template correctly fills the persona/instruction fields.
- [x] Cleanup: Deleted temporary verification scripts (`backend/scripts/verify_*.py`, etc.).
