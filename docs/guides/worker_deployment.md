# Worker Deployment Guide

AI 최적화 기능을 담당하는 Worker 서비스를 EC2에 배포하고 실행하는 방법입니다.

## 1. 개요
Worker는 백엔드와 **동일한 Docker 이미지**(`ainative-backend`)를 사용하지만, 실행 명령어(Command)가 다릅니다.
- **Backend**: `uvicorn main:app ...` (API 서버)
- **Worker**: `python3 optimizer_worker/main.py` (백그라운드 작업)

## 2. 필수 조건 (Prerequisites)
- **Database**: AWS RDS에 `pgmq` 확장 기능이 설치되어 있어야 합니다. (Schema 초기화 시 자동 설치됨)
- **Environment**: `.env` 파일에 `GEMINI_API_KEY`와 `DATABASE_URL`이 설정되어 있어야 합니다.

## 3. 실행 방법 (수동)

EC2에 접속하여 다음 명령어를 실행하면 Worker 컨테이너가 시작됩니다.

```bash
# 1. 기존 Worker 중지 및 삭제 (있다면)
docker stop worker || true
docker rm worker || true

# 2. Worker 실행
docker run -d \
  --name worker \
  --env-file .env \
  --restart unless-stopped \
  ainative-backend:latest \
  python3 optimizer_worker/main.py
```

> **참고**: Worker는 외부 포트를 열 필요가 없습니다. (내부적으로 DB와 통신)
> 만약 헬스 체크가 필요하다면 `-p 8001:8000` 옵션을 추가하여 호스트의 8001번 포트를 Worker의 8000번에 연결할 수 있습니다.

## 4. 자동 배포 스크립트 업데이트
`force_deploy_ec2.sh` 스크립트를 업데이트하여 백엔드 배포 시 Worker도 함께 재시작되도록 설정하는 것을 권장합니다.

```bash
# force_deploy_ec2.sh 에 추가될 내용:

echo "--- 5. Restart Worker ---"
docker stop worker || true
docker rm worker || true
docker run -d --name worker --env-file .env --restart unless-stopped $IMAGE_NAME python3 optimizer_worker/main.py
```
