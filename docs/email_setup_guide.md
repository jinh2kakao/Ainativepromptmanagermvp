# 이메일 발송 설정 가이드 (SMTP Configuration)

이 문서는 로컬 및 프로덕션 환경에서 실제 이메일이 발송되도록 SMTP를 설정하는 방법을 안내합니다.
현재 시스템은 `/api/verification/send-code` 엔드포인트를 통해 Python 백엔드에서 직접 인증 메일을 발송합니다.

## 1. SMTP 계정 준비 (Gmail 예시)
가장 간편한 Gmail을 기준으로 설명합니다.

1. **Google 계정 로그인** 후 [Google 계정 관리] -> [보안]으로 이동합니다.
2. **2단계 인증**이 켜져 있어야 합니다. (켜져 있지 않다면 활성화)
3. 2단계 인증 메뉴 하단의 **앱 비밀번호**를 선택합니다.
   - 앱 이름을 입력(예: `PromptManager`)하고 **만들기** 클릭.
   - 생성된 **16자리 비밀번호**를 복사해 둡니다. (띄어쓰기 없이 사용)

---

## 2. 로컬 개발 환경 설정 (Local)
로컬에서는 `.env` 파일을 사용하여 환경 변수를 관리합니다.

### 2.1. `.env` 파일 수정
`backend/.env` 파일을 열고(없다면 생성) 아래 내용을 추가합니다.

```ini
# backend/.env

# SMTP 설정 (Gmail 기준)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=jinh2kakao@gmail.com
SMTP_PASSWORD=wltwxaitnlbcncoy
```

### 2.2. 서버 재시작
설정을 적용하려면 백엔드 서버를 재시작해야 합니다.
```bash
# 터미널에서 실행 중인 uvicorn 프로세스 종료 (Ctrl+C) 후 재실행
uvicorn main:app --reload --port 8000
```

---

## 3. 프로덕션 환경 설정 (Production)
프로덕션 서버(EC2 등)에 `.env` 파일을 직접 업로드하지 못하는 경우, **시스템 환경 변수** 또는 **Docker 컨테이너 환경 변수**로 주입해야 합니다.

### 방법 A: Docker 실행 시 주입 (권장)
Docker 컨테이너를 실행할 때 `-e` 옵션을 사용하여 환경 변수를 넘겨줍니다.

```bash
docker run -d \
  --name backend \
  -p 8000:8000 \
  -e SMTP_SERVER=smtp.gmail.com \
  -e SMTP_PORT=587 \
  -e SMTP_USER=jinh2kakao@gmail.com \
  -e SMTP_PASSWORD=wltwxaitnlbcncoy \
  <이미지_이름>
```

### 방법 B: 서버에 `.env` 파일 직접 생성 (파일 전송 불가 시)
로컬에서 파일을 업로드할 수 없다면, 서버에 접속(SSH)하여 직접 파일을 생성할 수 있습니다.

1. **서버 접속**: `ssh -i key.pem user@host`
2. **파일 생성**:
   ```bash
   cd /path/to/project/backend
   nano .env
   ```
3. **내용 붙여넣기**: 로컬 설정과 동일하게 내용을 입력하고 저장(`Ctrl+O`, `Enter`, `Ctrl+X`)합니다.
4. **컨테이너 재시작**:
   ```bash
   # .env 파일을 사용하는 docker-compose의 경우
   docker-compose up -d --build
   
   # 또는 docker run 시 --env-file 옵션 사용
   docker run --env-file .env ...
   ```

### 방법 C: CI/CD 파이프라인 이용 (GitHub Actions 등)
배포 파이프라인(GitHub Actions)을 사용하는 경우, Repository Secrets에 변수를 등록하고 배포 스크립트에서 이를 사용하도록 설정합니다.

1. **GitHub Repository Settings** -> **Secrets and variables** -> **Actions**로 이동.
2. `SMTP_USER`, `SMTP_PASSWORD` 등을 Secret으로 등록.
3. 배포 워크플로우(`deploy.yml`)에서 사용:
   ```yaml
   - name: Run Docker
     run: |
       docker run -d \
         -e SMTP_USER=${{ secrets.SMTP_USER }} \
         -e SMTP_PASSWORD=${{ secrets.SMTP_PASSWORD }} \
         ...
   ```
