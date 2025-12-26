# PRD v1.4.0: Template Enhancement & Project Features

## 1. Overview
This PRD outlines the requirements for enhancing the Template system and introducing a new "Project" feature. The goal is to provide a more flexible template selection experience and a powerful project management tool that allows users to organize and connect multiple prompts.

## 2. Template Enhancements

### 2.1. Multiple Templates per Category
- **Current**: One template per job sub-category.
- **New**: Support multiple templates for a single job sub-category.
- **UI**: In the Prompt creation/edit view (Assistance Mode), when a job category is selected, allow the user to choose from a list of available templates.
    - If only one template exists, apply it automatically (current behavior).
    - If multiple exist, show a dropdown or modal to select the desired template.

### 2.2. Default Template Logic
- **Admin**: Admins can manage templates for each job category.
- **Default Setting**: Admins can mark a template as "Default".
- **Logic**:
    - If a "Default" template is set, it is pre-selected in the UI.
    - If multiple templates are marked as "Default" (should be avoided but if happens), use the one with the **latest `updated_at` timestamp**.
- **Admin UI**:
    - List templates by category.
    - Toggle "Default" status.
    - Visual indicator for the currently active default template.

## 3. Project Features

### 3.1. Project Structure
- **Definition**: A Project is a collection of Prompts.
- **Cardinality**: A User can create multiple Projects. A Project can contain multiple Prompts.
- **Data Model**:
    - `Project`: `id`, `title`, `description`, `owner_id`, `created_at`, `updated_at`.
    - `ProjectPrompt` (or Node): Link between Project and Prompt. May need metadata for positioning (x, y) and connections (next_node_id) for the flow view.

### 3.2. Dashboard & Navigation
- **Sidebar**: Add a "Projects" menu item to the left sidebar.
    - Position: Likely below "Dashboard" or as a top-level section.
    - Icon: Folder or Project icon.
- **Dashboard**:
    - "Recent Projects" section or a dedicated Projects view.
    - Ability to "Create New Project".

### 3.3. Project UI/UX
- **List View**: List of projects with metadata (count of prompts, last updated).
- **Detail View (Canvas/Flow)**:
    - **Visual Interface**: A node-based interface (like n8n or generic flowcharts) where prompts are represented as nodes.
    - **Connections**: Users can connect prompts sequentially or in parallel.
    - **Interaction**:
        - Drag and drop prompts onto the canvas.
        - Click to edit prompt details.
        - "Run" button (Future feature placeholder).
    - **Design**: Must adhere to the current "Premium & Dynamic" design system (Glassmorphism, smooth animations).

### 3.4. Project Templates
- **Requirement**: Projects should also have "Default Templates" based on Job Category (Major Category level).
- **Use Case**: When creating a project for "Marketing", populate it with a standard flow of prompts (e.g., "Idea Generation" -> "Copywriting" -> "Review").
- **Implementation**:
    - `ProjectTemplate` model.
    - Admin interface to define Project Templates (pre-defined set of prompts and connections).

### 3.5. Future Extensibility
- **API Key Management**: Prepare for future integration where users can save their API keys.
- **Auto-Execution**: The flow defined in the Project will eventually be executable, passing outputs from one prompt to the next.

## 4. Admin Requirements

### 4.1. Template Management
- UI to Create/Edit/Delete Prompt Templates.
- UI to Set Default Template.
- UI to View Default Template (filter/highlight).

### 4.2. Project Management
- View all user projects (read-only for monitoring).
- Manage Project Templates (Create standard flows).

## 5. Technical Considerations

### 5.1. Database Changes
- New Tables: `Project`, `ProjectNode` (or `ProjectItem`), `ProjectTemplate`.
- Updates: `PromptTemplate` (allow multiple per category, default flag logic).

### 5.2. Frontend
- New Pages: `/projects`, `/projects/[id]`.
- New Components: `ProjectCard`, `FlowCanvas` (using a library like React Flow or custom SVG/Canvas), `TemplateSelector`.
- Sidebar Update.

### 5.3. Migration
- Existing prompts remain independent.
- No breaking changes to existing `Prompt` model, but `Prompt` might need a reference to `Project` if strict ownership is implied (or keep it loose via mapping table).

## 6. User Experience (UX) Goals
- **Intuitive**: The flow builder should be easy to use, not overly complex like a full IDE.
- **Visual**: High-quality visuals for nodes and connections.
- **Seamless**: Switching between Project view and Prompt edit view should be smooth.
