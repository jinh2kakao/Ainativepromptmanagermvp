# Changelog

All notable changes to this project will be documented in this file.

## [2025-12-01] UI/UX Improvements & Bug Fixes
- **Changed**:
  - `frontend/src/components/ui-generated/PromptModal.tsx`: Fixed "Object is possibly 'undefined'" error by adding safe navigation and fallback for profile check.
  - `frontend/src/utils/promptUtils.ts`: Updated `assemblePrompt` to support both nested (Assistance Mode) and flat data structures.
  - `frontend/src/features/prompts/PromptListContainer.tsx`: 
    - Connected "Pro Upgrade" button in Header to `PricingModal`.
    - Connected "Settings" button in Header to `SettingsPage`.
    - Implemented state management for modal visibility.
- **Reason**: To improve application stability and complete navigation flows for Pricing and Settings.
- **Impact**: Users can now safely use Assistance Mode without crashes and navigate to Pricing and Settings pages from the Header.

## [2025-12-01] Deployment Setup & Bug Fixes
- **Changed**:
  - `frontend/next.config.ts`: Configured for GitHub Pages export (`output: 'export'`, `basePath`).
  - `.github/workflows/deploy.yml`: Added GitHub Actions workflow for automated deployment.
  - `frontend/src/features/prompts/api.ts`: Added data mapping to convert backend `snake_case` to frontend `camelCase`.
  - `frontend/src/app/prompts/[id]/page.tsx`: Removed unused `useUserStore` import.
- **Reason**: Enable static site deployment and fix private prompt visibility issues for authors.
- **Impact**: Automated deployment to GitHub Pages and correct access control for private prompts.

## [2025-12-01] Fix Runtime Errors & Update Validation
- **Changed**:
  - `frontend/src/components/ui-generated/PromptModal.tsx`: Fixed `jobCategories` map error and updated validation logic for Assistance Mode.
  - `frontend/src/components/ui-generated/AssistanceMode.tsx`: Fixed undefined config error.
  - `frontend/src/utils/promptUtils.ts`: Updated `getJobConfig` and `assemblePrompt` to support nested structures and shared data.
- **Reason**: Resolved runtime crashes due to data structure mismatches and improved form validation.
- **Impact**: Assistance Mode now works correctly with proper validation and prompt generation.

## [2025-12-01] Fix Type Mismatch in PromptListContainer
- **Changed**: `frontend/src/features/prompts/PromptListContainer.tsx`
- **Reason**: Fixed type error where `deleteMutation.mutate` was receiving a `number` instead of `string`. Removed unnecessary `Number()` casting.
- **Impact**: Ensures prompt deletion works correctly and resolves TypeScript build errors.

## [2025-12-01] Refactoring & Type Definitions
- **Changed**: 
  - `frontend/src/features/auth/AuthContainer.tsx`: Removed wrapper divs to fix layout issues.
  - `frontend/src/types/index.ts`: Centralized `Prompt` type definition.
  - `frontend/src/features/prompts/PromptListContainer.tsx`: Updated imports to use `@/types`.
- **Reason**: Improved code organization and fixed UI layout conflicts in Auth page.
- **Impact**: Cleaner architecture and correct full-page rendering for login screen.

## [2025-12-01] Phase 2: Prompt CRUD Implementation
- **Changed**:
  - Backend: Added API Router for prompts.
  - Frontend: Created `features/prompts` directory.
  - Frontend: Implemented `usePromptHooks` (React Query).
  - Frontend: Created `PromptListContainer` for listing and managing prompts.
- **Reason**: Implementation of core feature (Prompt Management).
- **Impact**: Users can now Create, Read, Update, and Delete prompts.

## [2025-11-30] Phase 1: Authentication System
- **Changed**:
  - Backend: Created `dependencies.py` for Auth Guardian (`get_current_user`).
  - Frontend: Set up `features/auth` and Supabase client (`utils/supabase/client.ts`).
  - Frontend: Integrated Login UI with Supabase Auth.
- **Reason**: Initial setup of secure user authentication.
- **Impact**: Enabled secure login/logout functionality and user session management.
