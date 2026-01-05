# Changelog

All notable changes to this project will be documented in this file.


## [2026-01-05] v3.5.0 - Template System Evolution & Mobile Polish
- **Changed**:
  - **Template System**:
    - **Description Field**: Added `description` column to `PromptTemplate` to provide rich context for generation templates (Backend & Admin).
    - **Bulk Update**: Automatically generated and applied professional descriptions to all 460+ templates using keyword analysis.
    - **Dynamic Loading**: Refactored `PromptForm` to fetch categories and templates dynamically from keys/IDs, ensuring synchronization with the Admin backend.
  - **UI/UX**:
    - **Mobile Optimization**:
      - **Template Sidebar**: Now fully responsive with a slide-over drawer on mobile devices.
      - **Undo Banner**: Adjusted positioning to prevent overlapping with mobile navigation.
    - **Visuals**:
      - **Thumbnails**: Added support for `preview_image_url` in template cards (Admin).
      - **Layout**: Improved template lookup sidebar with concise descriptions and category badges.
  - **Admin Console**:
    - **Template Editor**: Added "Description" input field for creating/editing templates.
    - **List View**: Enhanced table layout to show template descriptions.
- **Reason**: To complete the "Template Application Process" (v3.5.0) ensuring users have clear context when choosing prompts and that the interface works flawlessly on mobile.
- **Impact**:
  - **Content**: Templates are now self-explanatory with rich descriptions.
  - **Usability**: Mobile users have a first-class experience for prompt creation.
  - **Scalability**: Dynamic fetching removes frontend hardcoding dependencies.

## [2025-12-30] v3.4.1 - Member Withdrawal & Auth Stability
- **Changed**:
  - **Member Withdrawal**:
    - **New Feature**: Implemented account withdrawal functionality allowing users to permanently delete their account.
    - **Data Archiving**: User data is archived to `WithdrawnUser` table before deletion for compliance purposes.
    - **Cascade Deletion**: Added proper cascade relationships for `TeamMember`, `AuditLog`, `Notice`, `Inquiry`, and `InquiryComment` to prevent foreign key constraint errors.
    - **Re-withdrawal Support**: Updated `WithdrawnUser` schema to use auto-generated PK (`id`) and store `original_user_id` separately, allowing same user to withdraw multiple times.
    - **Supabase Auth Cleanup**: Withdrawal now also deletes user from Supabase Auth, enabling re-signup with the same email.
  - **Email Verification**:
    - **Gmail Token Handling**: Added auto-recovery logic to `auth_gmail.py` for expired tokens and support for alternative token path (`token_new.json`).
  - **Auth Stability**:
    - **Guest Migration**: Updated `ClientLayout.tsx` to clear invalid `guest_id` from localStorage on migration failure, preventing infinite 500 error loops.
- **Reason**: To provide a complete account lifecycle management (including deletion) and resolve authentication edge cases.
- **Impact**:
  - **Compliance**: Users can now exercise their "right to delete" their account.
  - **Stability**: Withdrawal and re-signup flows work reliably without database constraint errors.
  - **UX**: Authentication errors are handled gracefully without blocking users.

## [2025-12-29] v3.4.0 - Guest Experience & Reliability
- **Changed**:
  - **Guest User Experience**:
    - **Session Duration**: Extended Guest session expiration from 1 day to **7 days** to allow longer trial periods.
    - **Data Persistence**: Implemented `YYYYMMDDHHmmss` timestamp format for robust session tracking.
    - **Migration**: Strengthened data migration logic. Guest data (Prompts, Projects) is now reliably transferred to the permanent account upon Sign Up/Login, and guest remnants are immediately cleaned up to prevent stale data.
    - **Project Creation**: Guest users are now prompted to Sign Up/Log In when attempting to create a "New Project", encouraging conversion.
  - **Bug Fixes**:
    - **Sign Up Logic**: Fixed a critical false positive where valid emails were blocked with "Already registered" due to a boolean logic error in frontend API response handling.
    - **Product Tour**: Fixed the "X" (Close) button behavior to dismiss the tour without triggering the completion callback (which caused unwanted redirects).
    - **Guest Dashboard**: Resolved an issue where the "New Prompt" tour overlay appeared empty for guest users by ensuring the target button has a stable ID.
    - **Prompt Leak**: Fixed a backend security issue where migrated (public) prompts were still visible in the Guest's "My Prompts" list.
- **Reason**: To significantly improve the first-time user experience (FTUX), drive user conversion through project restrictions, and resolve critical onboarding friction points.
- **Impact**:
  - **Conversion**: Seamless transition from Guest to Member.
  - **Onboarding**: Bug-free product tour and sign-up flow.
  - **Stability**: Accurate session management and data isolation.

## [2025-12-23] v3.3.3 - Production Reliability: API Key Management
- **Fixed**:
  - **Gemini API Connectivity**: Resolved a critical production issue where the AI Optimization service returned `500 Internal Server Error` due to an expired/invalid `GEMINI_API_KEY`.
  - **Key Rotation**: Generated a new Gemini API Key and updated GitHub Repository Secrets and environment configurations.
- **Reason**: To restore the core AI Optimization feature functionality in the production environment.
- **Impact**:
  - **Stability**: AI Optimization and Prompt Evaluation features are now fully operational.


## [2025-12-22] v3.3.2 - Critical Bug Fixes & Admin Enhancements
- **Changed**:
  - **Admin QnA System**:
    - **Static Export Fix**: Refactored QnA Admin Detail page from dynamic route `[id]` to query parameter based routing (`?id=...`) to resolve build errors with `output: 'export'`.
    - **Reply Classification**: Fixed logic in `inquiries.py` where Admin replies to their own inquiries were incorrectly labeled as "Customer Center" replies. Updated past data via migration script.
    - **User Search Link**: Fixed "View User Details" link in QnA Admin to correctly pre-fill the search bar on the User Management page by initializing state from URL parameters.
  - **Prompt Editor Improvement**:
    - **Assistance Mode Sync**: Added `useEffect` to `AssistanceMode.tsx` to fix a bug where selecting a template did not update the input fields (Persona, Intent, etc.).
    - **Duplicate Key Fix**: Resolved `Encountered two children with the same key` console error in `SimpleModeInput` by deduplicating detected variables before rendering.
- **Reason**: To resolve critical build errors, improve data accuracy in the Admin Console, and fix UI responsiveness issues in the Prompt Editor.
- **Impact**:
  - **Stability**: Production build now succeeds.
  - **Accuracy**: User interactions are correctly classified and easy to track.
  - **Usability**: Prompt creation flow is bug-free and responsive.

## [2025-12-19] v3.3.1 - Production Sync & Data Integrity
- **Changed**:
  - **Template System**:
    - **Production Sync**: Synchronized local database with production environment, expanding Assistance Mode templates from 54 to 180 items via `sync_prod_templates.py`.
    - **Data Integrity**: Resolved "Missing Title" issue for 156 templates by implementing fallback logic (Name/Category) in `fix_missing_titles.py`.
  - **UI/UX Improvements**:
    - **Job Display**: Simplified "Selected Job" indicator in `PromptForm` to show only the main category (e.g., "Service Planning") instead of the full path.
    - **Defaults**: Changed default visibility for new prompts to **Public** (`isPublic: true`) to streamline sharing.
    - **Stability**: Fixed editor persistence bug where content remained after switching categories; now clears immediately.
    - **Polish**: Removed redundant alert popups when applying templates.
  - **Ops**:
    - **Scripts**: Added maintenance scripts (`sync_prod_templates.py`, `fix_missing_titles.py`) to `DEPLOY.md` for future operations.
- **Reason**: To ensure development environment matches production data richness and to address usability friction points reported in QA.
- **Impact**:
  - **Content**: Developers now have access to the full production template library.
  - **UX**: Cleaner interface and fewer clicks for common actions (sharing).

## [2025-12-19] v3.3.0 - Template Selection UI & PAIR Parser
- **Changed**:
  - **Template Selection UI**:
    - **Unified Design**: Implemented a "Green Box" style template selector in the Basic Settings area, consistent across both Simple and Assistance modes.
    - **Global Selection**: Users can now switch between multiple templates for any category directly from the main form.
    - **Structure**: Removed duplicate headers from `AssistanceMode` component to ensure a clean UI layout.
  - **Template Parsing**:
    - **PAIR Text Parser**: Implemented a custom `pairParser` utility to support Markdown-based Assistance templates.
    - **Robustness**: Replaced fragile `JSON.parse` logic with robust text parsing, preventing crashes when loading non-JSON templates in Assistance mode.
    - **Data Integrity**: Migrated 163 legacy templates to ensure correct mode classification and restored intended Assistance templates.
- **Reason**: To enhance the template selection experience and support flexible, text-based PAIR framework templates without rigid JSON requirements.
- **Impact**:
  - **UX**: Unified and more intuitive template selection process.
  - **Stability**: Elimination of JSON parsing errors for Assistance templates.
  - **flexibility**: Easier creation of Assistance templates using standard Markdown.

## [2025-12-18] v3.2.0 - Applicable AI Agents Integration
- **Changed**:
  - **AI Optimization**:
    - **Agent Recommendations**: The optimization engine now analyzes the prompt and recommends 1-3 suitable AI agents (e.g., 'GPT-4o', 'Claude-3.5-Sonnet') based on the content's complexity and structure.
    - **One-Click Apply**: Users can apply these recommended agents directly from the optimization review modal.
  - **Design Evaluation (APEF)**:
    - **Context Awareness**: The evaluation logic now considers the "Target Agents" set for the prompt.
    - **Scoring Update**: Prompts that specify target agents receive a more accurate score reflecting their optimization for those specific models.
  - **Template System**:
    - **Auto-Population**: Selecting a template now automatically populates the "Applicable Agents" field in the prompt form, ensuring best practices are carried over.
- **Reason**: To fulfil the "Applicable AI Agents" PRD requirements, enabling users to create and optimize prompts specifically tailored for different AI models.
- **Impact**:
  - **Quality**: Optimizations are more relevant to the intended model.
  - **Usability**: Users immediately know which model to use with a template/prompt.
  - **Accuracy**: Evaluation scores better reflect the prompt's real-world performance potential.

## [2025-12-17] v2.3.0 - Reliability Upgrade: Gmail API Migration
- **Changed**:
  - **Email System**:
    - **Migration**: Completely replaced the unreliable SMTP implementation (`smtplib`) with the **Gmail API** (`google-api-python-client`) using OAuth 2.0 authentication.
    - **Architecture**: Implemented the **Strategy Pattern** via `EmailService` (Interface) and `GmailService` (Implementation) to decouple business logic from the provider.
    - **Auth**: Replaced "App Passwords" with secure, long-lived OAuth tokens (`token.json`), eliminating login challenges.
  - **Dependencies**: Added `google-auth-oauthlib`, `google-auth-httplib2`, `google-api-python-client`.
- **Reason**: To resolve the critical "Silent Drop" issue where Google's SMTP servers quietly discarded verification emails despite returning `250 OK`.
- **Impact**:
  - **Reliability**: Email verification codes are now delivered instantly and consistently (~2s latency).
  - **Extensibility**: The system is now architecturally ready for a seamless switch to high-volume providers like Amazon SES in the future.

## [2025-12-16] v2.2.4 - Professional QA Fixes
- **Changed**:
  - **Cleanup**: Removed unused `@supabase/ssr` dependency and `src/utils/supabase/server.ts` to strictly enforce Client-Side Auth for Static Export.
  - **Documentation**: Updated `master_prompt.md` to:
    - Reflect **Native SQL Polling** for the Worker (removed incorrect PGMQ reference).
    - Allow **Feature-Colocated Hooks** (relaxed strict `src/hooks/` rule).
    - Explicitly forbid `@supabase/ssr` to prevent architectural drift.
- **Reason**: To address discrepancies found during a Professional QA session and ensure the codebase alignment with the Master Prompt and architectural standards.
- **Impact**:
  - **Maintainability**: Clearer documentation and cleaner dependency tree.
  - **Consistency**: Removed ambiguous code that conflicted with the deployment strategy.

## [2025-12-12] v2.2.3 - UX Polish & Real-time Feedback
- **Changed**:
  - **Prompt Detail UX**:
    - **Immediate Feedback**: Implemented "Instant Modal" pattern. Clicking "Evaluate" or "Optimize" now opens the modal immediately with a Skeleton UI, replacing the previous "Spinner on Button" pattern. This eliminates perceived latency.
    - **Skeleton Loading**: Added dedicated skeleton states for Radar Charts, Diff Views, and Metrics to provide a smooth visual transition while data is being fetched/processed.
  - **Analysis Readability**:
    - **Text Formatting**: Refactored `OptimizationReviewModal` to parse and display AI analysis (Reasoning) as readable text (Prose) instead of raw JSON code blocks.
  - **Localization**:
    - **Korean Enforcement**: Updated `The Judge` (APEF System Prompt) to strictly enforce Korean language output for all analysis feedback (suggestions, comments, warnings).
- **Reason**: To improve perceived performance (responsiveness) and make AI analysis results easier for users to read and understand.
- **Impact**:
  - **UX**: Application feels significantly faster and more responsive.
  - **Readability**: Users can comfortably read AI feedback without parsing JSON mentally.

## [2025-12-11] v2.2.2 - Mixed Content & Deployment Fixes
- **Changed**:
  - **Infrastructure**:
    - **Cloudflare**: Configured `NEXT_PUBLIC_API_URL` to HTTPS.
    - **Backend (EC2)**: Added `ProxyHeadersMiddleware` to correctly handle HTTPS requests proxied via Cloudflare.
  - **Frontend**:
    - **API**: Added trailing slash (`/`) to all API requests (e.g., `/api/templates/`) to prevent backend from issuing 307 HTTP redirects.
    - **Build**: Added `ec2_deployment_guide.md` and `force_deploy_ec2.sh` for streamlined backend updates.
    - **Worker**: Updated deployment script to automatically deploy the AI Worker service.
  - **Fixes**:
    - **PromptForm**: Fixed "Auto-Title Generation" bug where saving a prompt with an empty title failed to generate a title from content.
- **Reason**: To resolve persistent "Mixed Content" errors where correct HTTPS requests were redirecting to HTTP due to backend misconfiguration and URL normalization. To ensure AI Worker is deployed correctly and Prompt creation UX is robust.
- **Impact**:
  - **Reliability**: Application works flawlessly on production with secure End-to-End HTTPS and background workers.
  - **UX**: Creating prompts is smoother with working auto-completion.


## [2025-12-10] Phase 4: SSL/CORS Resolution
- **Changed**:
  - **Infrastructure**:
    - **SSL**: Implemented **Full (strict)** SSL encryption between Cloudflare and AWS EC2 using Cloudflare Origin Certificates.
    - **Web Server**: Configured Nginx on EC2 (listening on 443) to handle SSL termination and proxy requests to FastAPI (8000).
    - **CORS**:
      - Fixed "Double Header" issue by delegating standard CORS handling to FastAPI and limiting Nginx to Preflight (OPTIONS) requests.
      - Fixed `x-guest-id` rejection by whitelisting the header in Nginx.
      - Enabled `Access-Control-Allow-Credentials` with dynamic Origin mapping.
  - **Security**:
    - **Firewall**: Corrected AWS Security Group configuration (Port 443 open) in the correct region (Singapore vs Sydney mismatch resolved).
    - **Encryption**: End-to-End encryption enabled (User -> Cloudflare -> EC2).
- **Reason**: To resolve critical `Mixed Content` errors, Cloudflare `522` Timeouts, and persistent CORS failures preventing the frontend from communicating with the backend in production.
- **Impact**:
  - **Reliability**: API is now fully accessible via HTTPS.
  - **Security**: Compliant with modern security standards (no mixed content).
  - **UX**: Application functions correctly for all users without network errors.

## [2025-12-10] v2.2.1 - Google Login Fix for Static Export
- **Changed**:
  - **Auth Callback**:
    - Replaced `auth/callback` page logic to manually handle PKCE `code` exchange using `supabase.auth.exchangeCodeForSession(code)`.
    - Added `Suspense` boundary to correct use of `useSearchParams` in client component.
    - Excluded `/auth/callback` from middleware matcher to prevent session check interference.
  - **Supabase Client**:
    - **Critical Fix**: Switched from `@supabase/ssr` (`createBrowserClient`) to `@supabase/supabase-js` (`createClient`).
    - Changed from cookie-based to localStorage-based session persistence for better static hosting compatibility.
    - Added `detectSessionInUrl: true` for automatic OAuth callback handling.
  - **Error Handling**:
    - Added comprehensive `Invalid Refresh Token` error handling in `ClientLayout.tsx`.
    - Added SSR guards to `axios.ts` for guest mode localStorage access.
  - **TypeScript**:
    - Fixed implicit `any` type errors in multiple files (`optimizations/page.tsx`, `ClientLayout.tsx`, `ProfileSection.tsx`, `AuthContainer.tsx`).
- **Reason**: To resolve Google OAuth login hang on static hosting (Cloudflare Pages) caused by cookie-based session management issues.
- **Impact**: Google Login now works correctly on production. User authentication flows complete successfully.

## [2025-12-09] v2.2.0 - Infrastructure Migration to AWS
- **Changed**:
  - **Infrastructure**:
    - **Compute**: Migrated Backend & Worker from Render.com to **AWS EC2 (t3.micro)** for better control and reliability.
    - **Database**: Migrated from Supabase managed DB to **AWS RDS for PostgreSQL** (Free Tier) to resolve connection pooler limits.
    - **Backend**: AWS EC2 (t3.micro) + AWS RDS (PostgreSQL).
    - **Frontend**: **Cloudflare Pages** (Static Export) - Pivoted from AWS Amplify due to Free Tier domain restrictions.
  - **DevOps**:
    - **Docker**: Configured ECR & User Data for EC2.
    - **CI/CD**: Cloudflare Pages connected to GitHub.
- **Reason**: To maximize Free Tier benefits (AWS Compute/DB) and utilize Cloudflare's unlimited free static hosting with custom domain support.
- **Impact**:
  - **Cost**: Zero cost for Hosting & Custom Domain (Cloudflare).
  - **Performance**: High-speed CDN for frontend.

## [2025-12-09] v2.1.1 - AI Optimization Reliability & Enhancements
- **Changed**:
  - **Optimization Engine**:
    - **Model Fix**: Corrected Gemini model configuration to `models/gemini-flash-latest` to resolve 404 errors causing "no-op" optimizations.
    - **Re-evaluation**: Implemented automatic re-evaluation trigger in `backend/routers/prompts.py` so that applying an optimized prompt immediately refreshes its score.
  - **UI/UX**:
    - **Optimization Review Modal**: Increased modal width to 95% and implemented native scrolling for better readability of long content.
    - **Status Sync**: fixed mismatch where worker returned `COMPLETED` but frontend expected `APPROVED`, ensuring results are properly displayed.
- **Reason**: To resolve critical bugs in the AI optimization feature (identical output) and improve the usability of the review interface.
- **Impact**:
  - **Reliability**: AI optimization now works consistently and produces valid results.
  - **UX**: Reviewing and applying changes is smoother and more transparent with instant score updates.

## [2025-12-09] v2.1.0 - Product Tour & UI Unification
- **Changed**:
  - **Product Tour Extension**:
    - **Dashboard Integration**: Added a "Dashboard Tour" (Part 1) that guides guest users to the "Create First Prompt" entry point (`tour-dashboard-create-btn`).
    - **Seamless Flow**: Implemented `onFinish` navigation in `ProductTour` to automatically redirect users to the creation page upon completing the dashboard step, seamlessly connecting Part 1 (Dashboard) and Part 2 (Creation).
    - **Smart Positioning**: Updated `ProductTour.tsx` with boundary detection logic to auto-flip and clamp the popover position, preventing it from going off-screen on edge elements.
    - **Reusability**: Refactored `ProductTour` to accept `steps` and `storageKey` props, allowing multiple distinct tour sequences managed by separate localStorage keys (`hasSeenDashboardTour`, `hasSeenGuestTour`).
  - **Sidebar Optimization**:
    - **Resizing**: Reduced sidebar width from `288px` (`w-72`) to approx `228px` (`w-[228px]` / `md:w-57`) for a more compact layout.
    - **Visual Adjustments**: Reduced logo size (`w-28`) and applied `text-sm` to menu items to maintain visual balance with the narrower width.
  - **UI Unification**:
    - **Prompt Cards**: Replaced the custom list item implementation in `PromptList.tsx` with the `PromptCard` component (`view="card"`).
    - **Consistent Experience**: List View now offers identical functionality to the Kanban Board, including Edit, Delete, Run/Copy, Privacy badges, and Variable counts.
- **Reason**: 
  - To improve guest onboarding by clearly guiding them from the landing page to their first successful action.
  - To optimize screen real estate by making the navigation less intrusive.
  - To provide a consistent and feature-rich user experience across all view modes.
- **Impact**:
  - **Onboarding**: Guest users are now naturally funneled into the core value loop (Creation).
  - **UX**: Sidebar is sleeker, and List View is now fully functional and consistent with the Kanban view.

## [2025-12-08] v2.0.1 - Template Filtering & Form Stability Fixes
- **Changed**:
  - **Dashboard Loading State**:
    - **Skeleton UI**: Updated `PromptListContainer` to unconditionally display the Skeleton UI during the initial load and authentication verification, eliminating the "empty state" flash for unauthenticated users.
    - **Guest Access**: Fixed a bug where guest user prompts were saved but not displayed. Updated `usePrompts` to allow data fetching for unauthenticated guests by checking `isInitialized` instead of `user` existence.
    - **Data Migration**: Expanded `migrate_guest_data` endpoint to include **Projects**. When a guest user signs up or logs in, both their Prompts and Projects are now automatically transferred to their new account.
    - **Reliability**: Moved guest migration logic to `ClientLayout`, ensuring it triggers reliably on all authentication paths (Password, Google OAuth, Page Reloads) and eliminates race conditions.
  - **Template Filtering**:
    - **Database Migration**: Migrated all 48 category values from English (`ui_structure`, `ux_research`) to Korean (`UI 구조 및 레이아웃`, `사용자 리서치(UX Research)`) to match frontend `jobCategories.ts` specification.
    - **API Enhancement**: Added `subCategory` query parameter filtering to `/api/templates` (public) and `/api/admin/templates` endpoints.
    - **Implementation**: Created migration script `backend/scripts/migrate_category_values.py` with comprehensive English-to-Korean mapping.
  - **PromptForm Improvements**:
    - **handleSave Fix**: Restored missing `handleSave`, `handleModeChange`, and template selection logic that were accidentally removed during loading state implementation.
    - **Template Auto-Selection**: Implemented auto-population of default template content when selecting a job subcategory in Assistance Mode.
    - **Hydration Fix**: Added `suppressHydrationWarning` to mode-dependent UI elements and deferred localStorage reads to `useEffect` to prevent SSR hydration mismatches.
    - **API Migration**: Changed from admin-only `/api/admin/templates` to public `/api/templates` endpoint for better access control.
  - **Loading States**: 
    - Added comprehensive loading states and button disabling across the application to prevent duplicate submissions:
    - **PromptForm**: Save/cancel buttons disabled during `isSubmitting`.
    - **Authentication**: Google login and verification code buttons show loading states.
    - **PricingModal**: Upgrade button disabled during processing.
    - **PromptDetailPage**: Delete and public/private toggle buttons show spinners.
    - **PromptCard**: Individual delete buttons in List/Kanban views show loading feedback.
- **Reason**: 
  - To resolve critical template filtering failure caused by database/frontend value mismatch.
  - To fix `ReferenceError: handleSave is not defined` regression and improve form stability.
  - To prevent duplicate API calls and improve user experience with clear loading feedback.
  - To resolve Next.js hydration warnings in production.
- **Impact**:
  - **Filtering**: Template dropdown now correctly shows only templates for the selected job subcategory instead of all templates.
  - **UX**: Prompt creation/editing works smoothly with auto-filled templates and clear loading indicators.
  - **Reliability**: No more hydration errors in browser console, better form state management.
  - **Data Integrity**: All category values now consistently use Korean across frontend and backend.

## [2025-12-08] v2.0.0 - Project Crucible: The Gemini Factory
- **Changed**:
  - **Optimization Engine**:
    - **Gemini Migration**: Migrated from OpenAI to **Google Gemini 1.5 Flash** ($0.15 -> $0.075/1M tokens) for improved cost efficiency and speed.
    - **MIPROv2 Strategy**: Implemented advanced optimization logic using **MIPROv2** with a "Gold Set" (5-shot) bootstrapping approach to ensure high-quality prompt tuning.
    - **Custom Adapter**: Developed `GeminiLM` custom adapter in `backend/optimizer_worker/optimizer.py` to resolve DSPy compatibility issues with the Google native SDK.
  - **Infrastructure**:
    - **Infrastructure**: AWS EC2 t3.micro (Backend), AWS RDS t3.micro (DB), AWS Amplify (Frontend), Supabase Auth.
  - **Admin UI**:
    - **Realtime Feedback**: Integrated **Supabase Realtime** in the Admin Optimization Dashboard (`/admin/optimizations`).
    - **UX**: Admin now receives instant Toast notifications ("Gemini가 프롬프트를 튜닝했습니다! 🚀") and the list auto-refreshes upon successful optimization.
- **Reason**: To execute "Phase 2: The Gemini Factory" of Project Crucible, aiming for significant cost reduction, higher optimization performance, and a real-time monitoring experience.
- **Impact**:
  - **Cost**: ~50% reduction in operational costs for prompt optimization.
  - **Performance**: Faster response times and verified model availability.
  - **Experience**: Admins can monitor the "Factory" working in real-time.

## [2025-12-04] v1.6.3 - Specialized Templates & Deployment Fixes
- **Changed**:
  - **Content Expansion**:
    - **Specialized Templates**: Inserted 3+ new specialized "Assistance Mode" templates for all 9 major categories (Business, Design, Dev, Data, Marketing, etc.) to enrich the prompt library.
    - **Implementation**: Created `backend/scripts/insert_specialized_templates.py` to handle bulk insertion with duplicate prevention.
  - **Deployment & Stability**:
    - **GitHub Pages Fix**: Restored `basePath` and `assetPrefix` in `next.config.ts` to fix 404 errors for assets on GitHub Pages.
    - **Logo Path**: Implemented manual path prefixing for the Sidebar logo using `NEXT_PUBLIC_BASE_PATH` to ensure it loads correctly on both local and production environments.
  - **Documentation**:
    - **Guidelines**: Updated `master_prompt.md` with critical learnings regarding database template structure and GitHub Pages deployment configurations.
- **Reason**: To provide users with a richer set of starting templates and resolve critical asset loading issues in the production environment.
- **Impact**:
  - **Content**: Users now have access to a wider variety of professional templates.
  - **Reliability**: The application now deploys correctly to GitHub Pages with all assets visible.

## [2025-12-04] v1.6.2 - Admin Template Management & Data Integrity
- **Changed**:
  - **Admin Console**:
    - **Template Management**: Implemented server-side pagination and filtering to handle large datasets efficiently. Added "Load More" functionality.
    - **UI**: Added "Template Name" column to the template list for better identification.
  - **Data Integrity**:
    - **Fixes**: Resolved critical data discrepancies where 'Assistance' mode templates were missing or duplicated due to incorrect seeding.
    - **Cleanup**: Removed duplicate templates and restored missing ones, ensuring accurate counts (78 total templates).
- **Reason**: To resolve performance issues with large template lists and ensure data accuracy in the Admin Console.
- **Impact**:
  - **Performance**: Admin Template page loads faster and handles filtering efficiently.
  - **Reliability**: Data displayed in the UI now accurately reflects the database state.

## [2025-12-04] v1.6.1 - Template Selection Fix & Stability
- **Changed**:
  - **Template Selection UI**:
    - **Prompt Creation**: Fixed an issue where the template selection dropdown was not visible in the "New Prompt" page. Users can now select from multiple available templates (e.g., React Component, API Logic) when a specific job category is chosen in Assistance Mode.
    - **Implementation**: Ported the template fetching and selection logic from the legacy `PromptModal` to the active `PromptForm` component.
  - **Stability & Fixes**:
    - **Database**: Resolved a critical issue where the database file was corrupted (0 bytes), causing API failures. Restored the database schema and seed data (Note: User prompts were reset).
    - **Backend**: Fixed a "zombie" server process issue that caused API requests to return empty responses by holding onto a stale state.
    - **Runtime**: Fixed a potential crash in `PromptModal` (legacy) by adding missing state initialization.
- **Reason**: To resolve critical bugs preventing template usage and ensure system stability after a database corruption event.
- **Impact**:
  - **UX**: Users can now correctly use Assistance Mode templates.
  - **Reliability**: The system is recovered from a major failure state.

## [2025-12-04] v1.6.0 - Project Actions & Usage Quotas
- **Changed**:
  - **Project Management**:
    - **Actions**: Implemented "Edit" and "Delete" functionality for projects via a dropdown menu on project cards.
    - **UI**: Added a confirmation modal for project deletion and reused the creation modal for editing.
  - **Prompt Usage Limits**:
    - **Quotas**: Implemented usage limits based on user type:
      - **Guest**: 10 prompts (Redirects to Sign Up on limit).
      - **Free**: 50 prompts (Redirects to Pricing on limit).

      - **Pro**: Unlimited.
    - **Sidebar**: Connected "My Prompts" stats to real data using `usePrompts` hook, reflecting the actual count and quota.
  - **Fixes**:
    - **Sidebar**: Resolved `ReferenceError: showSidebar is not defined` in `ClientLayout`.
    - **Stats**: Fixed issue where sidebar prompt count was not updating.
    - **Admin UI**: Hidden user sidebar on Admin pages to prevent layout duplication.
  - **Admin Console**:
    - **Project Monitoring**: Added a new menu to view and manage (delete) all user projects.
    - **Access Control**: Updated admin check to use database `role` column instead of hardcoded email.
- **Reason**: To provide essential project management capabilities and enforce business logic for prompt usage tiers.
- **Impact**:
  - **Feature**: Users can now manage their projects (Edit/Delete).
  - **Business**: Usage limits are now enforced, encouraging user conversion and upgrades.
  - **UX**: Sidebar stats are accurate and real-time. Admin interface is cleaner.

## [2025-12-04] v1.5.2 - Mobile UI Improvements
- **Changed**:
  - **Project Detail Page**:
    - **Header**: Updated "Add Node" and "Save Changes" buttons to be icon-only on mobile devices to save screen space.
    - **Fixes**: Resolved `ReferenceError: handleDelete is not defined` by removing the redundant delete button from the header (functionality moved to hover actions).
  - **Prompt Selection Modal**:
    - **Layout**: Implemented a stacked layout for mobile devices (Categories on top, Prompts below) for better usability on small screens.
- **Reason**: To improve the user experience on mobile devices and fix a runtime crash caused by a regression.
- **Impact**:
  - **UX**: Better space utilization and usability on mobile.
  - **Stability**: Fixed runtime crash on the project detail page.

## [2025-12-04] v1.5.1 - Build Fix for Static Export
- **Changed**:
  - **Project Detail Page**: Refactored from Dynamic Route (`/projects/[id]`) to Query Parameter (`/projects/view?id=...`).
  - **Reason**: To resolve "missing generateStaticParams" error during production build with `output: 'export'`. Dynamic routes cannot be statically exported without pre-rendering all paths.
  - **Impact**: Application now builds successfully for static hosting (GitHub Pages, Render.com).

## [2025-12-04] v1.5.0 - Project Node & Edge Persistence
- **Changed**:
  - **Project Management**:
    - **Edge Persistence**: Added `data` column to `Project` table (Migration v1.5) to save and load node connections (edges).
    - **Node Positioning**: Implemented smart positioning for new nodes (cascading offset) and ensured they appear on top of existing nodes.
    - **Directional Edges**: Added arrow markers to all connections to indicate flow direction.
    - **Delete Functionality**: Implemented hover-to-delete for nodes and edges, and removed the global delete button for a cleaner UI.
    - **Node Styling**: Added `max-width` to nodes to prevent long summary text from breaking the layout.
  - **Prompt Selection Modal**:
    - **Filtering**: Fixed category filtering logic to correctly handle sub-categories and value/name matching.
    - **UI**: Added prompt counts per category and filtered out empty categories from the sidebar.
- **Reason**: To implement the requested features for the Project Detail page, ensuring data persistence, better usability, and visual clarity.
- **Impact**:
  - **UX**: Users can now save their flow diagrams, easily manage connections, and view prompt information clearly.
  - **Reliability**: Node connections are no longer lost upon reload.

## [2025-12-04] Documentation & Tech Stack Update
- **Changed**:
  - **Documentation**: Updated `master_prompt.md` to reflect the actual Tech Stack:
    - Next.js 16 (App Router)
    - React 19
    - Tailwind CSS 4
  - **Process**: Added "Vibe Coding Principles" to `master_prompt.md` to emphasize aesthetics, flow state, and user-centricity.
  - **Persona**: Refined the project context to reflect a "Startup Tech Leader" role.
- **Reason**: To ensure the master prompt accurately reflects the current codebase and sets the correct tone and standards for future development.
- **Impact**:
  - **Alignment**: Future AI interactions will be based on accurate version information, reducing hallucinated solutions for older versions.
  - **Culture**: Establishes a clear "Vibe Coding" standard for high-quality, aesthetic, and rapid development.

## [2025-12-04] v1.3.0 - Global Sidebar & Mobile Responsiveness
- **Changed**:
  - **Global Sidebar Integration**:
    - Replaced the top `Header` component with a new collapsible left `Sidebar` component.
    - Implemented `ClientLayout` to manage global sidebar state and layout adjustments.
    - Added "My Prompts" usage stats and quota visualization to the sidebar.
    - Integrated User Profile menu with Settings, Pricing, and Sign Out options.
    - Added "Admin Console" link for admin users.
  - **Mobile Responsiveness**:
    - Implemented a mobile-specific header with a hamburger menu.
    - Added slide-in mobile sidebar with overlay backdrop.
    - Ensured responsive layout adjustments for main content area.
  - **UI/UX Improvements**:
    - **Logo**: Replaced `next/image` with standard `img` tag to resolve local loading issues and implemented dynamic resizing/positioning (Center when collapsed, Left when expanded).
    - **User Experience**: Improved "My Page" Google Account management (Connect/Disconnect/Change).
    - **Assistance Mode**: Enhanced to support multiple template selection with a dropdown UI.
  - **Fixes**:
    - Resolved horizontal scrolling issues caused by sidebar width.
    - Fixed logo visibility issues by decoding corrupted base64 image file.
    - Fixed build errors in `Sidebar.tsx` due to malformed JSX.
    - **Kanban Board**: Fixed issue where "Simple Mode" prompts were hidden; now dynamically creates columns for all categories to ensure full visibility.
    - **Pricing Modal**: Resolved persistent double scrollbar issue by refactoring scroll behavior to the outer overlay.
    - **Settings Page**: Fixed layout issues by making the header and back button sticky within the sidebar for consistent navigation.
    - **Google Auth**: 
      - Fixed `identity_id must be an UUID` error during account disconnection.
      - Added robust error handling for "Manual Linking is disabled" scenarios.

      - Created comprehensive Supabase setup guide in `docs/`.
- **Reason**: To implement the v1.3.0 PRD requirements, providing a modern navigation structure, mobile support, and enhanced user account management features.
- **Impact**:
  - **Navigation**: Users can now navigate more efficiently with a persistent sidebar.
  - **Mobile**: The application is now fully usable on mobile devices.
  - **Visuals**: Cleaner, more professional UI with responsive design elements.

## [2025-12-03] Layout & Stability Improvements
- **Changed**:
  - **Frontend**:
    - `src/components/layouts/ClientLayout.tsx`: Fixed `PricingModal` props mismatch (`isOpen` -> `onUpgrade`).
    - `src/components/ui-generated/PromptDetailPage.tsx` & `SettingsPage.tsx`: Removed legacy sticky headers and integrated navigation/actions into the main content area.
    - `src/components/ui-generated/Header.tsx`: Removed unused legacy component.
    - `src/utils/storage.ts`: Fixed `localStorage` runtime error by adding SSR checks.
    - `src/app/prompts/new/page.tsx` & `src/app/prompts/edit/[id]/page.tsx`: Removed `Header` imports to fix build errors.
- **Reason**: To resolve runtime/build errors and unify the layout by removing redundant legacy headers in favor of the global sidebar.
- **Impact**:
  - **Stability**: Application builds and runs without errors (SSR/Runtime).
  - **UI/UX**: Cleaner, consistent interface without duplicate headers.

## [2025-12-03] Auth Stability & Guest Migration Fixes
- **Changed**:
  - **Backend**:
    - `backend/routers/auth.py`: Updated `migrate_guest_data` to split prompt reassignment and user deletion into separate transactions. This ensures user data is preserved even if the cleanup of the guest account fails (e.g., due to foreign key constraints).
  - **Frontend**:
    - `frontend/src/features/auth/AuthContainer.tsx`: Added graceful error handling for "Invalid Refresh Token" errors. The application now silently logs out the user instead of throwing a console error when the session is invalid.
    - `frontend/src/components/ui-generated/AssistanceMode.tsx`: Removed the redundant bottom preview section to clean up the UI, as the sticky right-column preview is sufficient.
- **Reason**: To resolve 500 Internal Server Errors during guest migration and improve the user experience by handling session expiration gracefully and removing cluttered UI elements.
- **Impact**:
  - **Reliability**: Guest migration is now robust against database constraint issues.
  - **UX**: Users are no longer confronted with scary console errors upon session timeout, and the prompt creation interface is cleaner.

## [2025-12-03] Fix Network Error & Frontend Startup
- **Changed**:
  - **Backend**:
    - `backend/models.py`: Added `CategoryRead` model to exclude `children` relationship.
    - `backend/routers/categories.py`: Updated `list_categories` to use `CategoryRead` response model.
  - **Frontend**:
    - Fixed `npm run dev` startup error by clearing stale lock files and conflicting processes.
- **Reason**: To resolve "Network Error" caused by infinite recursion in Category serialization and fix local development startup issues.
- **Impact**:
  - **Stability**: API now returns category list correctly without timeout.
  - **DX**: Local development server starts reliably.

## [2025-12-03] Production Build & Deployment Fixes
- **Changed**:
  - **Build Fixes**:
    - `frontend/src/components/ui-generated/AssistanceMode.tsx`: Removed unused `jobCategories` import.
    - `frontend/src/components/ui-generated/PromptDetailPage.tsx`: Fixed `currentUserId` type mismatch (`string | null`).
    - `frontend/src/components/ui-generated/ui/*.tsx`: Removed version suffixes from imports (e.g., `@radix-ui/react-accordion@1.2.3` -> `@radix-ui/react-accordion`) to fix module resolution errors.
    - `frontend/src/components/ui-generated/ui/calendar.tsx`: Updated `react-day-picker` usage to v9 API (replaced `IconLeft`/`IconRight` with `Chevron`).
    - `frontend/src/components/ui-generated/ui/chart.tsx`: Fixed `recharts` type errors by manually defining `ChartTooltipContent` props.
  - **Production Fixes**:
    - `frontend/src/app/layout.tsx`: Added `suppressHydrationWarning` to fix hydration mismatch caused by browser extensions.
    - `frontend/next.config.ts`: 
      - Restored `basePath` and `assetPrefix` for GitHub Pages deployment.
      - (Note: `basePath` is required for GitHub Pages but was temporarily removed during debugging).
    - `frontend/src/utils/axios.ts`: Confirmed usage of `NEXT_PUBLIC_API_URL` for production API calls.
    - `frontend/src/features/prompts/api.ts` & `PromptListContainer.tsx`: Added trailing slashes to all API endpoints (e.g., `/api/prompts/`) to prevent 307 redirects and 503 errors in production (FastAPI/Render).
  - **Assets**:
    - Moved logo images from `public/` to `frontend/src/assets/images/` to ensure reliable path resolution in production builds.
    - Updated `Header.tsx` and `AuthLeftPanel.tsx` to import images directly.
- **Reason**: To resolve multiple build failures, runtime errors in production (404/500), and asset loading issues on GitHub Pages and Render.com.
- **Impact**: 
  - **Stability**: Application now builds successfully and runs without hydration errors.
  - **Reliability**: API calls work correctly in production without redirects.
  - **UX**: Logo images load correctly on all platforms.

## [2025-12-02] Frontend Integration of Dynamic Content
- **Changed**:
  - **Backend**:
    - `backend/routers/categories.py`: Added public API endpoints for listing categories and fetching default templates.
    - `backend/main.py`: Registered the new `categories` router.
  - **Frontend**:
    - `frontend/src/components/ui-generated/PromptModal.tsx`: 
      - Replaced static `jobCategories` with dynamic fetching from `/api/categories`.
      - Implemented auto-fetching of default templates when Category/Mode is selected.
    - `frontend/src/components/ui-generated/PromptListView.tsx`: Updated to accept dynamic `categories` prop for filtering and labels.
    - `frontend/src/features/prompts/PromptListContainer.tsx`: Implemented category fetching and passing to child components.
- **Reason**: To fully connect the frontend user experience with the backend content management system, ensuring users see the latest categories and templates managed by admins.
- **Impact**: 
  - **User Experience**: Users receive context-aware template suggestions based on their job category and selected mode, improving prompt quality and creation speed.
  - **Maintainability**: Category and template updates in the Admin console are immediately reflected in the user application without code changes.

## [2025-12-02] Category & Template Management System
- **Changed**:
  - **Database & Seeding**:
    - Created `backend/scripts/seed_categories.py`: Seeded 39 job categories and subcategories with standardized English values.
    - Created `backend/scripts/seed_templates.py`: Seeded default "Simple Mode" templates for all subcategories.
    - Created `backend/scripts/seed_assistance_templates.py`: Seeded default "Assistance Mode" templates using the P.A.I.R framework structure.
  - **Admin UI - Categories**:
    - `frontend/src/app/admin/categories/page.tsx`: 
      - Added ID column for better identification.
      - Implemented hierarchical tree view (indentation) for parent-child relationships.
      - Added search functionality (Name/Value).
  - **Admin UI - Templates**:
    - `frontend/src/app/admin/templates/page.tsx`:
      - Implemented hierarchical category filter (Main Category -> Sub Category).
      - Added search functionality (Content/Category).
      - Added Mode filter (Simple/Assistance).
      - Updated table to display full category path (e.g., "Development > Frontend").
- **Reason**: To establish a robust content management system for the application, enabling administrators to easily manage job categories and provide high-quality default templates to users.
- **Impact**: 
  - **Content**: Users now have access to 39+ professional templates across various job functions immediately upon sign-up.
  - **Admin Experience**: Administrators can efficiently manage and organize a large number of categories and templates with advanced filtering and search capabilities.

## [2025-12-02] Admin Navigation & UI Fixes
- **Changed**:
  - `frontend/src/components/ui-generated/Header.tsx`: 
    - Fixed missing closing `</div>` tag that was breaking the layout structure.
    - Replaced `window.location.href` with `router.push` for Admin button to prevent full page reload and authentication state loss.
- **Reason**: To resolve layout issues and prevent users from being logged out or redirected incorrectly when accessing the Admin console.
- **Impact**: 
  - **Stability**: Admin navigation is now smooth and preserves the user's session.
  - **UI**: Header layout is correctly structured.

## [2025-12-02] Critical Bug Fixes & Stability Improvements
- **Changed**:
  - `backend/dependencies.py`: Implemented robust user ID migration strategy (Rename -> Create -> Reassign -> Delete) to fix mismatch between Supabase Auth ID and local DB ID. Added session rollback to prevent 500 errors on failed transactions.
  - `frontend/src/features/prompts/api.ts` & `backend/models.py`: Added `mode` property to `PromptUpdate` type to fix type error and allow mode switching.
  - `frontend/src/app/prompts/view/PromptDetailClient.tsx`: Added missing `isAuthLoading` and `currentUserId` state to fix ReferenceError.
  - `frontend/src/components/ui-generated/PromptDetailPage.tsx`: Fixed prompt visibility logic by ensuring strict string comparison for owner ID check.
  - `frontend/src/components/ui-generated/PromptModal.tsx`: Added Public/Private toggle UI and fixed duplicate property lint error.
- **Reason**: To resolve critical issues preventing users from viewing their own private prompts, updating prompt modes, and ensuring data consistency between Auth and DB.
- **Impact**: 
  - **Data Integrity**: User IDs are now correctly synchronized with Supabase, and existing mismatched users are automatically migrated without data loss.
  - **Stability**: Fixed 500 errors and runtime crashes.
  - **UX**: Owners can now see their private prompts, toggle visibility easily, and switch prompt modes.

## [2025-12-02] Figma Design Integration & Fixes
- **Changed**:
  - `frontend/src/components/ui-generated/`: Migrated new Figma design components (Header, PromptListView, Auth pages, etc.).
  - `frontend/src/features/prompts/PromptListContainer.tsx`: Updated to use new design components and integrated quota management.
  - `frontend/src/components/ui-generated/Header.tsx`: 
    - Replaced invalid `figma:asset` import with local `/logo.png`.
    - Fixed syntax error (invalid markdown block) and malformed Tailwind classes.
    - Updated to use `next/image` for optimization.
  - `frontend/src/components/ui-generated/auth/AuthPage.tsx` & `AuthLeftPanel.tsx`: Replaced invalid `figma:asset` imports with local `/logo.png`.
  - Multiple components: Fixed incorrect relative imports (e.g., `../types` -> `@/types`, `../utils` -> `@/utils`).
  - `frontend/src/components/ui-generated/PromptList.tsx` & Settings components: Fixed `sonner` import version error.
- **Reason**: To align the application with the latest Figma design, ensure build stability, and fix runtime errors caused by incorrect imports and generated code artifacts.
- **Impact**: The application now features a modern, cohesive UI matching the design system, builds successfully without errors, and properly handles assets and imports.

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
  - `frontend/next.config.ts`: Made `basePath` conditional to fix local development 404 errors.
  - `frontend/src/features/prompts/PromptListContainer.tsx`: Fixed issue where `category`, `subCategory`, `structure`, and `variables` were not being saved during prompt creation.
  - **Refactor**: Changed routing from Dynamic Routes (`/prompts/[id]`) to Query Parameters (`/prompts/view?id=...`) to support static export (GitHub Pages).
  - `backend/routers/prompts.py`: Updated `read_prompt` to allow access if prompt is public OR user is owner.
  - `frontend/src/app/prompts/view/PromptDetailClient.tsx`: Added `isAuthLoading` state to prevent "Access Denied" flash for owners.
  - `frontend/src/components/ui-generated/PromptModal.tsx`: Added UI toggle for setting Public/Private status during prompt creation/edit.
- **Reason**: Enable static site deployment, fix private prompt visibility, fix local dev environment, ensure data integrity, and provide UI for visibility control.
- **Impact**: Automated deployment, correct access control, working local dev server, correctly saved prompt details, compatibility with static hosting, and user control over prompt visibility.

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
