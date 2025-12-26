# AWS Migration Roadmap (Render/Supabase -> AWS)

- [x] **Phase 0: Prerequisites & Setup** <!-- id: 0 -->
    - [x] Install & Configure AWS CLI
    - [x] Create IAM User with necessary permissions
    - [x] Setup AWS ECR (Elastic Container Registry) repositories

- [x] **Phase 1: Containerization & Compute (AWS EC2)** <!-- id: 1 -->
    - [x] Build & Push Backend Docker Image to ECR
    - [x] Build & Push Worker Docker Image to ECR
    - [x] Create IAM Role & Instance Profile for ECR Access
    - [x] Create Security Group (Ports 22, 8000)
    - [x] Launch EC2 Instance with User Data (Auto-deploy)
    - [x] Verify Deployment (Wait for Docker pull & run)
    - [x] Verify Backend Health & Connectivity (using Supabase DB initially)

- [x] **Phase 2: Database Migration (RDS)** <!-- id: 2 -->
    - [x] Create AWS RDS for PostgreSQL Instance (Free Tier)
    - [x] Configure Security Groups (Allow Port 80/443)
- [x] Verify SSL/CORS Resolution
- [x] Final Cloudflare SSL Mode Update
    - [x] Export Data from Supabase (pg_dump)
    - [x] Importing Data to AWS RDS (pg_restore)
    - [x] Update Backend & Worker Environment Variables to use RDS
    - [x] Verify Data Integrity

- [x] **Phase 3: Frontend Migration (Amplify)** <!-- id: 3 -->
    - [x] Connect Repository to AWS Amplify
    - [x] Configure Build Settings (Next.js)
    - [x] Set Environment Variables (API URL, Supabase URL)
    - [x] Deploy & Verify

- [x] **Phase 4: Optimization & Cutover** <!-- id: 4 -->
    - [x] Update DNS Records (Route53 or External DNS)
    - [x] Configure Custom Domain (AWS Blocked -> Pivoted to Cloudflare Pages)
    - [x] Update Documentation (DEPLOY.md, CHANGELOG.md)
    - [x] Final Sanity Check (End-to-End Flow)
    - [x] Configure SSL/Custom Domains
    - [x] Codebase Cleanup (Remove legacy configs/scripts)
    - [x] Decommission Render Services
    - [x] (Optional) Optimize Supabase usage (Auth only) or migrate Auth fully
