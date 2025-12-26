# Deployment Summary (Hybrid Architecture)

**Migration Date**: 2025-12-09
**Status**: ✅ Completed
**Architecture**: AWS EC2 (Backend) + AWS RDS (DB) + Cloudflare Pages (Frontend)

---

## 🏗️ Architecture Configuration

### 1. Compute (Backend & Worker)
*   **Service**: AWS EC2
*   **Instance Type**: `t3.micro` (Free Tier)
*   **OS**: Amazon Linux 2023
*   **Public IP**: `***REMOVED_IP***`
*   **API Endpoint**: `http://***REMOVED_IP***:8000`
*   **Access Key**: `ainative-key.pem` (Local)
*   **Deployment**: Docker Containers (`backend`, `worker`) managed by `User Data` script (auto-starts on boot).

### 2. Database (PostgreSQL)
*   **Service**: AWS RDS
*   **Instance Class**: `db.t3.micro` (Free Tier)
*   **Engine**: PostgreSQL 17.1
*   **Endpoint**: `ainative-db.cxg68i86qqwp.ap-southeast-1.rds.amazonaws.com`
*   **Port**: `5432`
*   **Access**: Private (accessible only from EC2 via Security Group `sg-002a6583107d13ceb`).
*   **Data**: Fully migrated from Supabase.

### 3. Frontend (Next.js)
*   **Service**: Cloudflare Pages
*   **Repository**: GitHub `Ainativepromptmanagermvp`
*   **Build Config**: `npm run build` (Static Export)
*   **Output Directory**: `frontend/out`
*   **Domain**: `promptlib.co.kr`

---

## 🔐 Environment Variables (Reference)

### Backend (EC2)
Already configured in Docker containers via User Data.
*   `DATABASE_URL`: `postgresql://postgres:***REMOVED_DB_PASSWORD***@ainative-db...:5432/postgres`
*   `GEMINI_API_KEY`: (Configured)
*   `SUPABASE_URL`: (Configured)
*   `SUPABASE_SERVICE_KEY`: (Configured)

### Frontend (Cloudflare Pages)
Configured in Cloudflare Dashboard.
*   `NEXT_PUBLIC_API_URL`: `http://***REMOVED_IP***:8000`
*   `NEXT_PUBLIC_SUPABASE_URL`: `https://lbdwlxyigbmwegxkpgbx.supabase.co`
*   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: (Configured)

---

## 📝 Maintenance & Operation

### Accessing EC2 Server
```bash
# Terminal에서 접속
ssh -i /path/to/ainative-key.pem ec2-user@***REMOVED_IP***

# 로그 확인
docker logs -f backend
docker logs -f worker
```

### Updating Backend
1.  Code 수정 및 Commit.
2.  로컬에서 Docker Image Build & Push:
    ```bash
    aws ecr get-login-password ... | docker login ...
    docker build ...
    docker push ...
    ```
3.  EC2 접속 후 이미지 업데이트:
    ```bash
    ssh ... ec2-user@***REMOVED_IP***
    # 간편하게 재부팅하면 User Data가 다시 돌면서 최신 이미지를 가져옵니다
    sudo reboot
    # 또는 수동으로: docker pull ... && docker rm -f ... && docker run ...
    ```

### Updating Frontend
1.  GitHub `main` 브랜치에 Push하면 **Cloudflare Pages**가 자동으로 감지하고 배포합니다.
