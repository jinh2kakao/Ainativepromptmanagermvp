# 🚀 Deployment Guide (AWS Migration)

**2025-12-09 Update**: 본 서비스는 기존 Render/Vercel/Supabase 구조에서 **AWS Free Tier (EC2, RDS, Amplify)** 환경으로 마이그레이션 되었습니다.

상세한 마이그레이션 정보 및 접속 정보는 **[docs/AWS_MIGRATION_SUMMARY.md](docs/AWS_MIGRATION_SUMMARY.md)**를 참조하세요.

---

## 🏗️ Current Architecture (AWS)

### 1. Backend & Worker (AWS EC2)
*   **Service**: AWS EC2 `t3.micro` (Amazon Linux 2023)
*   **Location**: Singapore (`ap-southeast-1`)
*   **Public IP**: `***REMOVED_IP***`
*   **Deployment**: Docker Containers (via ECR & User Data Script)

### 2. Database (AWS RDS)
*   **Service**: AWS RDS PostgreSQL `db.t3.micro`
*   **Access**: Private (VPC Internal only)
*   **Connection**: Accessed by EC2 via Security Group allowlist.

### 3. Frontend (Cloudflare Pages)
*   **Service**: Cloudflare Pages
*   **Deployment**: Connects to GitHub Repository.
*   **Build Config**: Next.js Static Export (`output: 'export'`).
*   **Domain**: `promptlib.co.kr` (Managed via Cloudflare DNS).

---

## 📝 Operation Guide (요약)

### Backend Update (EC2)
1.  **Recommended**: GitHub `main` 브랜치에 Push하면 **GitHub Actions**가 자동으로 빌드 및 배포를 수행합니다. (`.github/workflows/deploy-ec2.yml`)
2.  **Manual (Fallback)**: 로컬 빌드 및 ECR Push 후 EC2에서 Pull (상세: `docs/guides/ec2_deployment_guide.md`).

### Frontend Update (Cloudflare Pages)
1.  GitHub `main` 브랜치에 Push하면 Cloudflare Pages가 자동으로 감지하여 빌드 및 배포를 수행합니다.

---

## ⚠️ Important Notes

### 3.3.0 Upgrade (Template System Migration)
*   **Template Format Change**: Assistance templates are now Markdown-based.
*   **Action Required (Existing Deployments)**: If you have existing "Assistance" templates stored as plain text but marked as `SIMPLE` mode (due to legacy bugs), run the revert script:
    ```bash
    python backend/scripts/revert_assistance_fixes.py
    ```

### 3.3.1 Maintenance & Recovery Tools (Added 2025-12-19)
*   **Production Template Sync**: Syncs templates from production to local environment.
    ```bash
    python backend/scripts/sync_prod_templates.py
    ```
*   **Fix Missing Titles**: Populates missing title fields based on Name or Category (safe to run multiple times).
    ```bash
    python backend/scripts/fix_missing_titles.py
    ```

### 3.3.3 API Key Management (Added 2025-12-23)
*   **Gemini API Key**: Always ensure the `GEMINI_API_KEY` in GitHub Secrets is valid. If the key expires or is rotated, AI-related features (Optimization, Evaluation) will return 500 errors.
*   **Update Process**: Update GitHub Action Secret > Redeploy Backend.