# AWS EC2 Backend Deployment Guide

**Updated: 2025-12-16**

This guide details the deployment options for the backend.

## ✅ Method 1: GitHub Actions (Recommended)
This method is fully automated.
1.  **Trigger**: Push code to `main` branch.
2.  **Process**: GitHub Cloud Runner builds the image -> Pushes to ECR -> SSHs to EC2 -> Restarts container.
3.  **Setup**: Requires Secrets configuration (See `docs/guides/github_actions_setup.md`).

---

## ⚠️ Method 2: Manual Local Build (Fallback)
Use this only if GitHub Actions is failing or you need to debug.

### 🏗️ Architecture
- **Local (Windows)**: Build Docker image (amd64) -> Push to AWS ECR.
- **Server (EC2)**: Pull from AWS ECR -> Restart Container.

### 1. Local Build & Push
**Step 1. Login to ECR**
```powershell
aws ecr get-login-password --region ap-southeast-1 | docker login --username AWS --password-stdin 736817644725.dkr.ecr.ap-southeast-1.amazonaws.com
```

**Step 2. Build Image (Force AMD64)**
*Note: Use `--no-cache` if you changed Enums or config files to ensure fresh layers.*
```powershell
docker build --no-cache --platform linux/amd64 -t ainative-backend ./backend
```

**Step 3. Tag & Push**
```powershell
docker tag ainative-backend:latest 736817644725.dkr.ecr.ap-southeast-1.amazonaws.com/ainative-backend:latest
docker push 736817644725.dkr.ecr.ap-southeast-1.amazonaws.com/ainative-backend:latest
```

### 2. Server Deployment (EC2)
**Step 1. SSH into Server**
```bash
ssh -i ainative-key.pem ec2-user@***REMOVED_IP***
```

**Step 2. Pull & Restart (One-Liner)**
Copy and paste this block into the EC2 terminal:
```bash
export AWS_DEFAULT_REGION=ap-southeast-1
aws ecr get-login-password | docker login --username AWS --password-stdin 736817644725.dkr.ecr.ap-southeast-1.amazonaws.com

docker pull 736817644725.dkr.ecr.ap-southeast-1.amazonaws.com/ainative-backend:latest

# Stop previous container to free memory
docker stop backend || true
docker rm backend || true

# Run new container
docker run -d -p 8000:8000 --env-file .env --name backend 736817644725.dkr.ecr.ap-southeast-1.amazonaws.com/ainative-backend:latest
```

---

## 3. Troubleshooting

### 🛑 "Network Error" / SSH Lag
**Cause**: `t3.micro` instance CPU credits exhausted or RAM full (swapping).
**Diagnosis**:
```bash
# Check Load
uptime
# Check Memory
free -h
```
**Fix**:
1. **Stop Worker**: Currently `worker` container is heavy. Stop it if backend is critical.
   ```bash
   docker stop worker
   ```
2. **Reboot**: If SSH is stuck, go to AWS Console -> Instances -> Reboot Instance.

### 🛑 500 Internal Server Error (DB Mismatch)
**Cause**: Python Enum values don't match DB text values (Case Sensitive).
**Fix**:
1. Check `backend/models.py`: Ensure `UserType.GUEST = "GUEST"` (Uppercase matches DB).
2. **Rebuild with `--no-cache`**: Docker might cache the old `models.py`. Always use `--no-cache` when fixing subtle bugs.

### 🛑 CORS Errors
**Cause**: `ALLOWED_ORIGINS` in `.env` missing the frontend URL.
**Fix**:
1. Edit `.env` on EC2:
   ```bash
   nano .env
   ```
2. Ensure `https://promptlib.co.kr` is in `ALLOWED_ORIGINS`.
3. Restart container.

### 🛑 AI Optimization Fails (Gemini Key)
**Cause**: `GEMINI_API_KEY` in `.env` is expired or invalid.
**Fix**:
1. Get a new key from [Google AI Studio](https://aistudio.google.com/).
2. Edit `.env` on EC2: `nano .env`
3. Update `GEMINI_API_KEY`.
4. Restart backend: `docker restart backend`
