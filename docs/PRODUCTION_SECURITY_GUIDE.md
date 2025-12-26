# 🛡️ Production Security Guide

이 문서는 로컬 개발 환경에서 식별된 **보안 민감 파일**들을 운영(Production) 환경에서 안전하게 관리하는 방법을 설명합니다.
현재 서비스 아키텍처(AWS EC2 Backend, Cloudflare Frontend, GitHub Actions)를 기준으로 작성되었습니다.

## 📋 대상 민감 파일 목록

다음 파일들은 로컬 개발 편의를 위해 존재하거나 인증을 위해 사용되지만, Git에 커밋되어서는 안 되며 운영 환경에는 별도의 방식으로 주입되어야 합니다.

| 구분 | 파일 경로 | 용도 | 운영 환경 처리 전략 |
| :--- | :--- | :--- | :--- |
| **Env Config** | `backend/.env` | 백엔드 환경변수 (DB URL 등) | **GitHub Secrets**로 관리 및 배포 시 주입 |
| **인증서** | `cloudflare_origin.crt` <br> `cloudflare_origin.key` | Cloudflare SSL Origin 인증서 | **Nginx 설정** (수동 업로드 또는 Secrets) |
| **API 키** | `backend/credentials.json` <br> `backend/token.json` | Google/Gmail API 인증 | **파일 직접 업로드 (SCP)** 권장 |
| **SSH 키** | `ainative-key.pem` | AWS EC2 접속 키 | **로컬 사용자 PC**에서만 보관 (서버 업로드 금지) |

---

## 🛠️ 상세 가이드

### 1. `backend/.env` (환경변수)
Git에 `.env` 파일을 올리는 대신 **GitHub Actions**와 **EC2**에서 환경변수 값을 관리해야 합니다.

#### 🔹 GitHub Actions 설정 (CI/CD)
GitHub Repository > Settings > Secrets and variables > Actions > **Repository secrets**에 다음 값들을 등록합니다.

- `ENV_FILE_CONTENT`: `.env` 파일의 내용 전체를 복사해서 넣거나, 필요한 변수를 개별 등록하여 배포 스크립트에서 생성하게 합니다.
- (현재 배포 워크플로우 `deploy-ec2.yml` 확인 필요 - 보통 `.env`를 생성하는 단계가 포함되어 있습니다)

#### 🔹 EC2 서버 직접 수정 (Manual)
자동 배포가 `.env`를 덮어쓰지 않는 구조라면, 서버에 직접 접속하여 파일을 생성합니다.

```bash
# 로컬에서 SSH 접속
ssh -i "ainative-key.pem" ec2-user@***REMOVED_IP***

# 서버에서 .env 생성/수정
cd /app/backend
nano .env
# (내용 붙여넣기 후 저장)
```

---

### 2. `credentials.json` & `token.json` (Google API)
이 파일들은 JSON 형태의 복잡한 구조를 가지므로 환경변수보다는 **보안 파일 전송** 방식을 권장합니다.

#### 🔹 방법: SCP를 이용한 직접 전송 (추천)
로컬 PC에서 운영 서버(EC2)로 파일을 직접 안전하게 복사합니다.

```powershell
# Windows PowerShell 예시
$EC2_IP = "***REMOVED_IP***"
$KEY_PATH = ".\ainative-key.pem"

# credentials.json 전송
scp -i $KEY_PATH .\backend\credentials.json ec2-user@$EC2_IP:/home/ec2-user/credentials.json

# token.json 전송
scp -i $KEY_PATH .\backend\token.json ec2-user@$EC2_IP:/home/ec2-user/token.json

# (서버 접속 후) 파일을 앱 디렉토리로 이동
ssh -i $KEY_PATH ec2-user@$EC2_IP
sudo mv ~/credentials.json /app/backend/
sudo mv ~/token.json /app/backend/
```

> **주의**: Docker를 사용하는 경우, 이 파일들을 Volume으로 마운트하거나 Docker build 시점에 secret으로 주입해야 합니다. 현재 `docker-compose.yml`이 Volume 매핑(`- ./backend:/app`)을 사용 중이라면 호스트 경로에 파일이 존재하면 됩니다.

---

### 3. `cloudflare_origin.*` (SSL 인증서)
Cloudflare와 EC2 Nginx 간의 엄격한 SSL(Full Strict) 통신을 위해 필요합니다.

1. **저장 위치**: 보통 `/etc/nginx/certs/` 또는 프로젝트 내 `nginx/` 폴더 등에 위치합니다.
2. **처리 방법**: 위 JSON 파일들과 마찬가지로 **SCP로 전송**하는 것이 가장 안전합니다.
3. **Nginx 설정**: `nginx.conf`에서 해당 경로를 참조하도록 설정해야 합니다.

```nginx
ssl_certificate     /path/to/cloudflare_origin.crt;
ssl_certificate_key /path/to/cloudflare_origin.key;
```

---

### 4. `ainative-key.pem` (SSH 접속 키)
🚨 **절대 서버에 업로드하지 마세요.**
이 파일은 "서버의 열쇠"입니다. 서버 안에 열쇠를 두고 문을 잠그는 것과 같습니다.
- **보관**: 개발자 로컬 PC, 암호화된 USB, 또는 1Password 같은 보안 볼트에 보관하십시오.
- **공유**: 팀원 간 공유 시 안전한 채널을 이용하고, 가능하면 팀원별로 별도의 SSH Public Key를 서버(`~/.ssh/authorized_keys`)에 등록하여 사용하는 것이 좋습니다.

---

## ✅ 요약 체크리스트

1. [ ] **GitHub Secrets**에 PROD용 `.env` 변수들이 등록되었는가?
2. [ ] **EC2 서버**의 `/app/backend` (또는 Docker Volume 경로)에 `credentials.json`, `token.json`이 scp로 전송되었는가?
3. [ ] **Nginx**가 참조하는 위치에 SSL 인증서 파일들이 존재하는가?
4. [ ] `ainative-key.pem`은 로컬에만 안전하게 보관되어 있는가?
