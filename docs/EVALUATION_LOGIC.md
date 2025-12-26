# Prompt Evaluation Logic (APEF v2.0)

This document details the logic, criteria, and metrics used by "The Judge" (Evaluation Service) to score prompts in the AI Native Prompt Manager Project.

## Overview

The system uses a Large Language Model (Google Gemini 1.5 Flash) acting as an expert prompt engineer ("The Judge") to evaluate prompts based on the **Advanced Prompt Evaluation Framework (APEF) v2.0**.

The evaluation process consists of a **Safety Gate** followed by a **Weighted Scoring** system.

## 1. Safety Gate (Semantic Guard)

**Goal**: Detect potential Prompt Injection attacks, Jailbreaks, or System Prompt Leakage attempts.

*   **Logic**: The AI analyzes the intent of the prompt.
*   **Result**:
    *   **SAFE**: Proceed to scoring.
    *   **UNSAFE**: Immediate Score = 0. Evaluation terminates.

## 2. Weighted Scoring Dimensions

If the prompt is Safe, it is evaluated on 4 key dimensions with specific weights:

### A. Structure (40%) - "Framework Compliance"
Evaluates if the prompt contains essential structural components.
*   **Objective (30%)**: Clear action verbs and defined tasks?
*   **Context & Constraints (25%)**: Background info and negative constraints?
*   **Output Format (20%)**: Defined output schema (JSON, Markdown, etc.)?
*   **Persona/Role (15%)**: Specific expert role defined?
*   **Target Audience/Agent (10%)**: Is the intended reader or **Target AI Model** specified? (e.g., "For GPT-4", "For Claude")

### B. Clarity & Precision (30%) - "Ambiguity Removal"
Evaluates if the instructions are precise and unambiguous.
*   **Ambiguity**: Penalizes subjective terms like "short", "funny". Rewards quantitative limits (e.g., "under 200 words").
*   **Logical Coherence**: Checks for contradicting constraints.
*   **Delimiter Usage**: Rewards use of XML tags or separators (`"""`, `---`) to structure input.

### C. Technique (20%) - "Advanced Engineering"
Evaluates the use of performance-enhancing techniques.
*   **Few-Shot Examples (40%)**: input-output examples provided?
*   **Chain of Thought (30%)**: Instructions to "think step-by-step"?
*   **Variable Injection (30%)**: Use of placeholders like `{{input}}`?

### D. Efficiency (10%) - "Token Economy"
Evaluates the information density.
*   Penalizes "fluff" (excessive politeness, irrelevant intros).
*   Rewards concise, high-density instructions.

## 3. Output Schema

The evaluation result is stored in `prompt_ops.evaluations` and returned as a JSON object containing:
*   `total_score` (0-100)
*   `access_safety` (SAFE/UNSAFE)
*   `breakdown` (Detailed scores and missing elements for each dimension)
*   `improvement_suggestions` (Actionable advice in Korean)
