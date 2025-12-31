# Antigravity IDE MCP 통합 가이드

Antigravity IDE의 기능을 확장하기 위한 **Model Context Protocol (MCP)** 서버 설정 및 활용 가이드입니다.
기초적인 AI 문서 참조(Context7)부터 인프라(AWS, Docker) 및 협업 도구(GitHub, Gmail) 연동까지 포괄합니다.

---

## 1. mcp_config.json 통합 설정

`mcp_config.json` 파일에 아래 내용을 작성하여 필요한 MCP 서버를 활성화하세요.

> [!WARNING]
> `${DATABASE_URL}` 등 환경 변수 치환이 작동하지 않는 경우(에러 발생 시), **실제 연결 문자열과 토큰 값**을 직접 입력해야 합니다. 이 파일은 `.gitignore`에 등록되어 있어 안전합니다.

```json
{
  "mcpServers": {
    "context7": {
      "serverUrl": "https://mcp.context7.com/mcp",
      "headers": {
        "CONTEXT7_API_KEY": "${CONTEXT7_API_KEY}",
        "Accept": "application/json, text/event-stream"
      },
      "disabled": false,
    },
    "postgres": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-postgres",
        "postgresql://postgres:[YOUR_PASSWORD]@db.[YOUR_PROJECT_REF].supabase.co:5432/postgres"
      ],
      "disabled": false,
    },
    "github": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-github"
      ],
      "env": {
        "GITHUB_TOKEN": "YOUR_GITHUB_TOKEN_HERE"
      },
      "disabled": false,
    },
    "aws": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-aws"
      ],
      "env": {
        "AWS_PROFILE": "default",
        "AWS_REGION": "ap-northeast-2"
      },
      "disabled": false,
    },
    "docker": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-docker"
      ],
      "disabled": false,
    },
    "gmail": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-gmail"
      ],
      "env": {
        "Ec": "YOUR_GMAIL_CLIENT_ID",
        "Gc": "YOUR_GMAIL_CLIENT_SECRET",
        "Tc": "YOUR_GMAIL_REFRESH_TOKEN"
      },
      "disabled": false,
    }
  }
}
```

---

## 2. 주요 MCP 상세 가이드

### 2.1 Context7 (AI 문서 참조)
최신 라이브러리 문서와 코드 예제를 실시간으로 제공하여 환각을 방지합니다.
*   **활용**: 별도 설정 없이 프롬프트에서 `React 19`, `Python 3.12` 등 키워드를 사용하면 자동으로 최신 문서를 참조합니다.
*   **API Key**: [Context7 웹사이트](https://context7.ai)에서 발급.

### 2.2 PostgreSQL (Supabase)
IDE 내에서 데이터베이스 스키마를 조회하고 쿼리를 실행합니다.
*   **설정**: Supabase **Transaction Pooler** 연결 문자열(Port 6543) 사용을 권장합니다.
*   **문제 해결**: 환경 변수 로드 실패 시 `postgresql://...` 전체 주소를 직접 입력하세요.

### 2.3 GitHub
이슈 조회, PR 요약, 브랜치 관리 등을 자연어로 수행합니다.
*   **설정**: `repo` 권한이 있는 Personal Access Token이 필요합니다.

---

## 3. 확장 MCP 가이드 (Advanced)

### 3.1 AWS (Infrastructure)
EC2, S3 등 AWS 리소스를 자연어로 관리합니다.
*   **사전 준비**: 로컬에 `aws-cli` 및 자격 증명(`aws configure`) 설정 필수.
*   **보안**: `ReadOnlyAccess` 등 최소 권한 IAM User 사용 권장.

### 3.2 Docker (Container)
로컬 Docker 컨테이너와 이미지를 관리합니다.
*   **사전 준비**: Docker Desktop 실행 필수.

### 3.3 Gmail (Communication)
이메일 검색 및 초안 작성을 지원합니다.
*   **인증**: Google Cloud Platform에서 OAuth 2.0 Client ID 발급 필요.

### 3.4 Filesystem
IDE 샌드박스 외부의 파일 시스템에 접근합니다.
*   **설정**: `args`에 접근을 허용할 절대 경로 목록을 추가해야 합니다.
    ```json
    "args": ["-y", "@modelcontextprotocol/server-filesystem", "C:\\Logs", "C:\\Project"]
    ```

---

## 4. 환경 변수 요약

시스템 환경 변수 또는 IDE 설정에 아래 값들이 등록되어야 합니다. (직접 입력 시 제외)

| MCP | 변수명 | 설명 |
|---|---|---|
| **Context7** | `CONTEXT7_API_KEY` | Context7 API Key |
| **PostgreSQL** | `DATABASE_URL` | DB 연결 문자열 (`backend/.env` 참조) |
| **GitHub** | `GITHUB_TOKEN` | GitHub PAT |
| **AWS** | `AWS_PROFILE`, `AWS_REGION` | AWS CLI 프로필 및 리전 |
| **Gmail** | `Ec`, `Gc`, `Tc` | Gmail OAuth 토큰 정보 |

---

## 5. 보안 수칙

1. **파일 관리**: `mcp_config.json`은 민감한 정보를 포함하므로 반드시 `.gitignore`에 등록하여 관리합니다.
2. **권한 제어**: 특히 AWS, Gmail, Filesystem MCP는 강력한 권한을 가지므로, AI가 의도치 않은 삭제/변경 명령을 수행하지 않도록 주의하고 `autoApprove` 설정을 신중하게 사용하세요.
