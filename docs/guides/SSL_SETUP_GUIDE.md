# Cloudflare Origin Certificate EC2 설치 가이드 (Korean)

이 가이드는 Cloudflare Origin Certificate를 생성하고, AWS EC2의 Nginx에 설치하여 **Strict SSL (Full)** 모드를 활성화하는 과정을 설명합니다.

---

## 1단계: Cloudflare에서 Origin Certificate 생성

1.  Cloudflare Dashboard 로그인 -> `promptlib.co.kr` 선택.
2.  좌측 메뉴 **SSL/TLS** -> **Origin Server** 클릭.
3.  **[Create Certificate]** 클릭.
4.  설정 기본값 유지:
    *   **Private key type**: RSA (2048)
    *   **Hostnames**: `*.promptlib.co.kr`, `promptlib.co.kr`
    *   **Certificate Validity**: 15 years
5.  **[Create]** 클릭.
6.  **결과 화면 유지 (중요!)**:
    *   `Origin Certificate` (-----BEGIN CERTIFICATE----- 로 시작)
    *   `Private Key` (-----BEGIN PRIVATE KEY----- 로 시작)
    *   이 두 값을 메모장 등에 잠시 복사해둡니다.

---

## 2단계: 인증서 파일 EC2 업로드

EC2 서버에 접속하여 인증서 파일을 생성합니다.

1.  **EC2 SSH 접속**:
    ```bash
    ssh -i ainative-key.pem ec2-user@***REMOVED_IP***
    ```

2.  **SSL 디렉토리 생성**:
    ```bash
    sudo mkdir -p /etc/nginx/ssl
    ```

3.  **인증서 파일 생성 (`cloudflare_origin.crt`)**:
    ```bash
    sudo nano /etc/nginx/ssl/cloudflare_origin.crt
    ```
    *   Cloudflare에서 복사한 **Origin Certificate** 내용을 붙여넣고 저장합니다. (`Ctrl+O`, `Enter`, `Ctrl+X`)

4.  **개인키 파일 생성 (`cloudflare_origin.key`)**:
    ```bash
    sudo nano /etc/nginx/ssl/cloudflare_origin.key
    ```
    *   Cloudflare에서 복사한 **Private Key** 내용을 붙여넣고 저장합니다.

5.  **권한 설정 (보안 강화)**:
    ```bash
    sudo chmod 644 /etc/nginx/ssl/cloudflare_origin.crt
    sudo chmod 600 /etc/nginx/ssl/cloudflare_origin.key
    ```

---

## 3단계: Nginx HTTPS 설정

Nginx 설정 파일을 수정하여 443 포트(HTTPS)를 열고 인증서를 연결합니다.

1.  **설정 파일 수정**:
    ```bash
    sudo nano /etc/nginx/conf.d/api.conf
    ```

2.  **기존 내용 삭제 후 아래 내용으로 교체**:
    (기존 80 포트 설정은 리다이렉용으로 남기고, 443 설정을 추가합니다)

    ```nginx
    # HTTP -> HTTPS 리다이렉트
    server {
        listen 80;
        server_name api.promptlib.co.kr;
        return 301 https://$host$request_uri;
    }

    # HTTPS 설정
    server {
        listen 443 ssl http2;
        server_name api.promptlib.co.kr;

        # SSL 인증서 경로 지정
        ssl_certificate /etc/nginx/ssl/cloudflare_origin.crt;
        ssl_certificate_key /etc/nginx/ssl/cloudflare_origin.key;

        # SSL 보안 설정 (권장값)
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        location / {
            proxy_pass http://localhost:8000;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;

            # CORS 헤더 (필요시)
            add_header 'Access-Control-Allow-Origin' '*';
        }
    }
    ```

3.  **저장**: `Ctrl+O`, `Enter`, `Ctrl+X`.

4.  **설정 검사 및 재시작**:
    ```bash
    sudo nginx -t  # syntax is ok 확인
    sudo systemctl restart nginx
    ```

---

## 4단계: Cloudflare 설정 변경 (중요)

마지막으로 Cloudflare가 EC2와 HTTPS로 통신하도록 설정합니다.

1.  Cloudflare Dashboard -> **SSL/TLS** -> **Overview**.
2.  암호화 모드를 **Full (strict)**로 변경합니다.
    *   *주의: 인증서 설치 전에 바꾸면 522 에러가 납니다.*

---

## 5단계: 확인

브라우저에서 `https://api.promptlib.co.kr` 로 접속하여 자물쇠 아이콘이 뜨고 연결이 안전한지 확인합니다.
