# QA Report: AI Optimization Fixes

**Date:** 2025-12-09
**Author:** Antigravity (Assistant)

## Problem Summary
The AI Optimization feature was returning identical content to the original prompt. Debugging revealed that the backend worker was failing to communicate with the Gemini API due to an incorrect model name configuration (`gemini-1.5-flash`), resulting in a 404 error from Google's API.

## Root Cause Analysis
- **Error Log**: `Gemini Error: 404 models/gemini-1.5-flash is not found`
- **Cause**: The API key in use does not have access to the exact model alias `gemini-1.5-flash`, or the alias is deprecated/unavailable in the current region/tier.
- **Verification**: Ran `check_google_models.py` which confirmed available models include `models/gemini-flash-latest` but not `gemini-1.5-flash`.

## Fix Implemented
- **File**: `backend/optimizer_worker/optimizer.py`
- **Change**: Updated `GeminiLM` initialization to use `models/gemini-flash-latest`.

## Additional Improvements
1.  **Optimization Review UI**: Increased modal width to 95% and replaced custom `ScrollArea` with native scrolling for better usability.
2.  **Auto Re-evaluation**: Implemented logic in `backend/routers/prompts.py` to automatically trigger `run_evaluation` whenever a prompt's content is updated (e.g., after applying optimization).

## Verification Steps
1.  **Stop Worker**: `Ctrl + C` in the worker terminal.
2.  **Start Worker**: `python3 backend/optimizer_worker/main.py`
3.  **Test**: Trigger "AI Optimize" on the frontend.
4.  **Expected Result**:
    - Worker log should show `DEBUG: Gemini Response: ...` with actual content.
    - Frontend should verify status `APPROVED` (or `COMPLETED`) and show modified text.
