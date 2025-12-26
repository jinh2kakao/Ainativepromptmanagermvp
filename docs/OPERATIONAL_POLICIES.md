# Operational Policies & Protocols

## 1. Database Connection Policy
**Objective:** Prevent recurring connection failures (DNS errors, Timeouts) in Production environments.

### Policy:
*   **Mandatory Session Pooler:** For all container-based deployments (Render, Docker, etc.), the **Supabase Session Pooler (IPv4)** MUST be used.
    *   **Do NOT** use "Direct Connection" (IPv6/Direct) as it is unreliable in certain cloud regions (DNS resolution failures).
    *   **Do NOT** use "Transaction Pooler" unless specifically required for serverless functions (Lambda).
*   **Verification:** Before deployment, verify the `DATABASE_URL` starts with `postgresql://` and uses port `5432` (or `6543`) on the pooler domain (e.g., `aws-0-ap-northeast-2.pooler.supabase.com`).

## 2. Configuration Change Protocol
**Objective:** Ensure all team members and the AI assistant are aware of critical infrastructure changes immediately.

### Policy:
*   **Immediate Notification:** Any change to the following external services MUST be communicated to the development team (and AI assistant) **immediately**:
    *   **GitHub:** Repository Secrets, Actions Variables, Branch protection rules.
    *   **Render:** Environment Variables, Build Commands, Start Commands, Region settings.
    *   **Supabase:** Database Password, Network Restrictions, Auth Providers, Table Schema changes.
*   **Procedure:**
    1.  Make the change in the respective dashboard.
    2.  Update the local `.env` file if applicable.
    3.  **Log the change** in the project chat or issue tracker:
        > "Updated Render Environment Variable `DATABASE_URL` to use Session Pooler."

## 3. Deployment Verification
*   **Post-Deployment Check:** After every deployment to Render or GitHub Pages, the following **MUST** be verified:
    *   **API Connectivity:** `/api/health-db` (or equivalent) returns 200 OK.
    *   **Asset Loading:** Logos and images load correctly (no 404s).
    *   **CORS:** Frontend can successfully fetch data from the Backend.
