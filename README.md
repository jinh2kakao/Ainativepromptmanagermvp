# AI Native Prompt Manager (MVP v1.3.0)

> **"Turning Fragmented Prompts into Assets"**

![Dashboard UI](docs/images/dashboard_ui.png)

## Overview

**AI Native Prompt Manager** is a B2B/B2C SaaS tool designed to solve the problem of fragmented and inefficient prompt engineering. It helps teams and individuals **assetize**, **structure**, and **reuse** their AI prompts effectively.

-   **Assetization**: Stop losing valuable prompts in chat history. Store and manage them as assets.
-   **Structure**: Utilize the built-in **P.A.I.R Framework** (Persona, Asset, Instruction, Result) to create high-quality prompts consistently.
-   **Reusability**: Automatically detect variables in prompts for instant reuse without modifying the original text.

---

## Key Features

### 1. P.A.I.R Framework Integration
Transform vague instructions into professional prompts.
-   **Assistance Mode**: A structured form that guides users to fill in Persona, Asset, Instruction, and Result.
-   **The Assembler**: Automatically converts structured JSON input into optimized Markdown format for LLMs.

### 2. The Prompt Launcher
Write once, run anywhere.
-   **Variable Detection**: Parses `{{variable}}` syntax in real-time.
-   **Instant Execution**: Generates a dynamic form for inputting values, creating a "Launcher" experience for repeated tasks.

### 3. AI Optimization
Built-in prompt refinement using **Gemini 1.5 Flash**.
-   **Evaluation**: Scores prompts on Structure, Clarity, Technique, and Efficiency.
-   **Auto-Optimize**: One-click improvement suggestions to enhance prompt performance.

### 4. Team Collaboration
Scale prompt engineering across your organization.
-   **Team Workspaces**: Share prompts and projects with team members.
-   **Role-Based Access Control (RBAC)**: Manage permissions (Viewer, Editor, Admin) for secure collaboration.

---

## Technical Stack

The project is built with a modern, high-performance stack focusing on scalability and user experience.

### Frontend
-   **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
-   **Language**: TypeScript, React 19
-   **Styling**: Tailwind CSS 4, Shadcn UI
-   **State Management**: Zustand, TanStack Query

### Backend
-   **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.11+)
-   **Database**: Supabase (PostgreSQL)
-   **ORM**: SQLModel

### Infrastructure
-   **Authentication**: Supabase Auth (Google OAuth)
-   **Deployment**: Docker

---

## Getting Started

### Prerequisites
-   Node.js (v18+)
-   Python (v3.11+)
-   Git

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/Ainativepromptmanagermvp.git
    cd Ainativepromptmanagermvp
    ```

2.  **Backend Setup**
    ```bash
    cd backend
    python -m venv venv
    # Windows
    .\venv\Scripts\activate
    # Mac/Linux
    # source venv/bin/activate
    
    pip install -r requirements.txt
    
    # Create .env file with your credentials
    # cp .env.example .env
    
    uvicorn main:app --reload
    ```

3.  **Frontend Setup**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

4.  **Access the Application**
    -   Frontend: `http://localhost:3000`
    -   Backend API: `http://localhost:8000/docs`

---

## 🛠️ Troubleshooting

If you encounter issues like `500 Internal Server Error` during AI Optimization, please refer to our **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** guide.

---

## Author

**Designed & Built by [Jin H K]**
-   **Role**: Product Manager & Full Stack Developer
-   **Portfolio**: [Link to Portfolio]

---

This project was developed to demonstrate a complete **0 to 1 Product Building Process**.
The original design file is available on [Figma](https://www.figma.com/design/IOPcKeRCg5BVrAidNXS1IX/AI-Native-Prompt-Manager-MVP).