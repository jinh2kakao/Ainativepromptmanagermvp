# 🔒 API 서버 HTTPS (SSL) 적용 가이드

**문제 상황**: 프론트엔드(`https://...`)에서 백엔드(`http://...`)로 요청을 보내면 보안 정책(Mixed Content)으로 인해 차단됩니다.
**해결 방법**: Cloudflare의 무료 SSL 기능을 사용하여 `https://api.promptlib.co.kr` 주소를 만들고, EC2 서버에 Nginx를 설치하여 연결합니다.

---

## 1단계: Cloudflare DNS 설정 (API 도메인 생성)

1.  **Cloudflare Dashboard** -> `promptlib.co.kr` 선택 -> **DNS** 메뉴 클릭.
2.  **[+ Add record]** 클릭.
3.  다음과 같이 입력하고 저장합니다:
    *   **Type**: `A`
    *   **Name (root)**: `api`
    *   **IPv4 address**: `***REMOVED_IP***` (EC2 퍼블릭 IP)
    *   **Proxy status**: **Proxied** (주황색 구름 켜기) 🧡
        *   *이게 켜져 있어야 Cloudflare가 무료로 SSL을 씌워줍니다.*
4.  **SSL/TLS** 메뉴 -> **Overview** 클릭.
    *   설정이 **Flexible** 혹은 **Full**로 되어 있는지 확인합니다. (**Flexible** 권장)

---

## 2단계: EC2 서버 설정 (Nginx 설치)

Cloudflare는 기본적으로 80번 포트(HTTP)로 접속을 시도합니다. 현재 백엔드는 8000번 포트이므로, 80번 포트로 들어온 요청을 8000번으로 넘겨주는 **Nginx** 설정이 필요합니다.

1.  **EC2 접속**: 터미널을 열고 SSH로 접속합니다.
    ```bash
    ssh -i ainative-key.pem ec2-user@***REMOVED_IP***
    ```

2.  **Nginx 설치 및 설정 명령어 실행**:
    아래 명령어들을 **한 줄씩 복사해서 붙여넣으세요**.

    ```bash
    # 1. Nginx 설치
    sudo dnf install -y nginx

    # 2. Nginx 설정 파일 생성 (80번 포트 -> 8000번 포트 포워딩)
    sudo sh -c 'cat > /etc/nginx/conf.d/api.conf <<EOF
    server {
        listen 80;
        server_name api.promptlib.co.kr;

        location / {
            proxy_pass http://localhost:8000;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        }
    }
    EOF'

    # 3. 기본 설정 충돌 방지 (필요시) 및 Nginx 시작
    sudo systemctl enable nginx
    sudo systemctl restart nginx
    ```

3.  **접속 테스트**:
    브라우저 주소창에 `https://api.promptlib.co.kr/api/health-db` (또는 health)를 입력했을 때 정상적으로 응답(JSON)이 나오면 성공입니다!

---

## 3단계: 프론트엔드 연결 주소 변경

이제 프론트엔드가 `https` 주소를 바라보도록 설정을 바꿔야 합니다.

1.  **Cloudflare Dashboard** -> **Workers & Pages** -> `promptlib` 프로젝트 클릭.
2.  **Settings** -> **Environment variables** 클릭.
3.  `NEXT_PUBLIC_API_URL` 값을 수정합니다:
    *   기존: `http://***REMOVED_IP***:8000`
    *   변경: `https://api.promptlib.co.kr` (뒤에 `/` 없음 확인)
4.  **[Save]** 클릭.
5.  **Deployments** 탭으로 가서 **[Create new deployment]** (또는 맨 위 최신 배포 오른쪽 점 3개 -> **Retry deployment**)를 눌러 **재배포**합니다.

---

재배포가 완료되면 `https://promptlib.co.kr`에서 API 호출이 정상적으로 작동할 것입니다! 🚀
