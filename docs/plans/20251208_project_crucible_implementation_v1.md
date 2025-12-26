# Project Crucible Implementation History (v1.0)
**Date**: 2025-12-08
**Project**: Project Crucible (SaaS Template Marketplace & Workflow Engine)

## Overview
This document records the implementation details of "Project Crucible", a system designed to evaluate and verify prompt quality (The Judge) and automatically optimize them using LLMs (The Optimizer).

## 1. Architecture Principles
-   **Cost Efficiency**: Module 1 (The Judge) uses purely static analysis (Regex/Flesch-Kincaid) to avoid LLM costs during initial evaluation.
-   **Event-Driven**: Optimization (Module 2) is triggered asynchronously via `pgmq` only when a prompt is flagged (Low Score).
-   **Supabase Native**: Utilizes Supabase Auth, Database, Edge Functions, and PGMQ.

## 2. Implemented Components

### Step 1: Database & Infrastructure
-   **Schema**: Created `prompt_ops` schema to isolate Crucible logic from public tables.
-   **Tables**:
    -   `prompt_ops.templates`: Stores raw content and status (`PENDING`, `FLAGGED`, `APPROVED`).
    -   `prompt_ops.evaluations`: Stores evaluation scores (Readability, Security, Structure).
    -   `prompt_ops.optimizations`: Stores optimization results and reasoning.
-   **Triggers**:
    -   `trigger_optimization_if_needed`: Fires on `INSERT` to `evaluations`. If `total_score < 70`, updates template status to `FLAGGED` and enqueues a message to `optimization_queue` (PGMQ).

### Step 2: Module 1 (The Judge) - Supabase Edge Function
-   **Path**: `supabase/functions/evaluate-prompt/`
-   **Logic**:
    -   `ReadabilityCalculator.ts`: Implements Flesch Reading Ease algorithm.
    -   `SecurityScanner.ts`: Detects prompt injection patterns using Regex. Returns 0 if detected.
    -   `StructureScanner.ts`: Checks for existence of Persona, Context, Instruction, etc.
    -   `index.ts`: Aggregates scores using `Deno.serve`.

### Step 3: Module 2 (The Optimizer) - Python Worker
-   **Path**: `backend/optimizer_worker/`
-   **Logic**:
    -   `main.py`: Periodically queries `pgmq.read('optimization_queue')`.
    -   `optimizer.py`: Uses **DSPy** `ChainOfThought` signature to rewrite prompts based on the evaluation feedback.
    -   Upon success, inserts into `prompt_ops.optimizations` and updates template status to `APPROVED`.

### Step 4: Integration Testing
-   **Script**: `backend/scripts/seed_crucible_test.py`
-   **Scenario**:
    1.  Inserts a "Bad Prompt".
    2.  Inserts a "Low Score Evaluation" (Score: 45).
    3.  Verifies DB Trigger changed status to `FLAGGED`.
    4.  Verifies PGMQ contains the message.

### Step 5: Admin UI & API
-   **Backend**: `backend/routers/crucible.py` exposes endpoints for fetching optimizations and scores.
-   **Frontend**:
    -   `frontend/src/app/admin/optimizations/page.tsx`: Dashboard to view Original vs Optimized content logs.
    -   `frontend/src/app/admin/templates/page.tsx`: Updated to display "Score" badges for templates.

## 3. Files Created
1.  `backend/project_crucible_schema.sql` (DB Schema)
2.  `supabase/functions/evaluate-prompt/{index,readability,security,structure}.ts` (Edge Function)
3.  `backend/optimizer_worker/{main,optimizer,requirements}.txt` (Python Worker)
4.  `backend/scripts/seed_crucible_test.py` (Test Script)
5.  `backend/routers/crucible.py` (API Router)
6.  `frontend/src/app/admin/optimizations/page.tsx` (New Page)

## 4. Next Steps
-   Deployment of Python Worker to a persistent container service (e.g., Render Background Worker, Fly.io).
-   Deploy Edge Function (`supabase functions deploy`).
-   Refine DSPy prompt signatures for better optimization quality.
